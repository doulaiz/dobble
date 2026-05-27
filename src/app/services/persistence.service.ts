import { Injectable } from '@angular/core';
import { ImageState } from '../classes/image-state';
import { CardLayout, CardShape } from '../classes/card-layout';
import { ImgLayout } from '../classes/img-layout';
import { Mode } from '../utils/dobble.utils';

export interface PersistedState {
  mode: Mode;
  imageStates: ImageState[];
  cardIndices?: number[][];
  cards?: string[][];  // legacy, kept for backward compat
  cardLayout?: CardLayout;
  cardLayouts?: ImgLayout[][];
}

// What actually lives in the "state" store. imageStates use fileRef instead of inline image data.
interface StoredImageState {
  fileRef?: string;     // SHA-256 key into the "files" store
  image?: string;       // legacy v1: inline data URL (migrated on next save)
  croppedImage: string;
  zoomLevel: number;
  angleLevel: number;
  translateH?: number;
  translateV?: number;
}

interface StoredCardLayout {
  shape?: CardShape;
  width: number;
  height: number;
  diameter?: number;
  marginTop: number;
  marginLeft: number;
  backgroundImageRef?: string;  // SHA-256 key into the "files" store
  backgroundImage?: string;     // legacy v2: inline data URL (migrated on next save)
}

interface StoredState extends Omit<PersistedState, 'imageStates' | 'cardLayout'> {
  imageStates: StoredImageState[];
  cardLayout?: StoredCardLayout;
}

const DB_NAME = 'dobble_db';
const DB_VERSION = 2;
const STATE_STORE = 'state';
const FILES_STORE = 'files';
const STATE_KEY = 'dobble_state';

@Injectable({ providedIn: 'root' })
export class PersistenceService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  // Serializes concurrent save calls so they never interleave
  private saveQueue: Promise<void> = Promise.resolve();

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STATE_STORE)) {
          db.createObjectStore(STATE_STORE);
        }
        if (!db.objectStoreNames.contains(FILES_STORE)) {
          db.createObjectStore(FILES_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return this.dbPromise;
  }

  private async hashImage(dataUrl: string): Promise<string> {
    const data = new TextEncoder().encode(dataUrl);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private putFile(db: IDBDatabase, key: string, data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILES_STORE, 'readwrite');
      tx.objectStore(FILES_STORE).put(data, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private getFile(db: IDBDatabase, key: string): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILES_STORE, 'readonly');
      const req = tx.objectStore(FILES_STORE).get(key);
      req.onsuccess = () => resolve(req.result as string | undefined);
      req.onerror = () => reject(req.error);
    });
  }

  // Deletes any file in the "files" store not present in activeRefs.
  private deleteOrphanedFiles(db: IDBDatabase, activeRefs: Set<string>): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILES_STORE, 'readwrite');
      const store = tx.objectStore(FILES_STORE);
      const keysReq = store.getAllKeys();
      keysReq.onsuccess = () => {
        for (const key of keysReq.result as string[]) {
          if (!activeRefs.has(key)) store.delete(key);
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Public entry point: enqueues the save so concurrent calls never interleave
  save(state: PersistedState): Promise<void> {
    this.saveQueue = this.saveQueue.then(() => this._save(state));
    return this.saveQueue;
  }

  private async _save(state: PersistedState): Promise<void> {
    const db = await this.openDB();

    // Build stored image states: deduplicate raw images into the "files" store.
    const storedImageStates: StoredImageState[] = [];
    for (const imgState of state.imageStates) {
      if (imgState.image) {
        const fileRef = await this.hashImage(imgState.image);
        await this.putFile(db, fileRef, imgState.image);
        storedImageStates.push({ fileRef, croppedImage: imgState.croppedImage, zoomLevel: imgState.zoomLevel, angleLevel: imgState.angleLevel, translateH: imgState.translateH, translateV: imgState.translateV });
      } else {
        storedImageStates.push({ croppedImage: imgState.croppedImage, zoomLevel: imgState.zoomLevel, angleLevel: imgState.angleLevel, translateH: imgState.translateH, translateV: imgState.translateV });
      }
    }

    // Store cardLayout.backgroundImage in the "files" store too.
    let storedCardLayout: StoredCardLayout | undefined;
    if (state.cardLayout) {
      const { backgroundImage, ...rest } = state.cardLayout;
      storedCardLayout = rest;
      if (backgroundImage) {
        const bgRef = await this.hashImage(backgroundImage);
        await this.putFile(db, bgRef, backgroundImage);
        storedCardLayout.backgroundImageRef = bgRef;
      }
    }

    const activeRefs = new Set<string>([
      ...storedImageStates.map(s => s.fileRef).filter((r): r is string => r != null),
      ...(storedCardLayout?.backgroundImageRef ? [storedCardLayout.backgroundImageRef] : []),
    ]);

    // Write the state record FIRST so it is always consistent with the files store
    // A crash after this point leaves unreferenced blobs (wasted space)
    // but the state record is always valid and load() will never produce broken images.
    const stored: StoredState = { ...state, imageStates: storedImageStates, cardLayout: storedCardLayout };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STATE_STORE, 'readwrite');
      tx.objectStore(STATE_STORE).put(stored, STATE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Delete orphaned files only after the state is durably committed.
    await this.deleteOrphanedFiles(db, activeRefs);
  }

  async load(): Promise<PersistedState | null> {
    try {
      const db = await this.openDB();
      const stored = await new Promise<StoredState | null>((resolve, reject) => {
        const tx = db.transaction(STATE_STORE, 'readonly');
        const req = tx.objectStore(STATE_STORE).get(STATE_KEY);
        req.onsuccess = () => resolve((req.result as StoredState) ?? null);
        req.onerror = () => reject(req.error);
      });

      if (!stored) return null;

      // Resolve fileRefs back to full data URLs.
      const imageStates: ImageState[] = [];
      for (const s of stored.imageStates) {
        let image = s.image ?? '';  // legacy v1: image stored inline
        if (s.fileRef) image = (await this.getFile(db, s.fileRef)) ?? '';
        imageStates.push({ image, croppedImage: s.croppedImage, zoomLevel: s.zoomLevel, angleLevel: s.angleLevel, translateH: s.translateH ?? 0, translateV: s.translateV ?? 0 });
      }

      // Resolve cardLayout.backgroundImageRef back to a data URL.
      let cardLayout: CardLayout | undefined;
      if (stored.cardLayout) {
        const sc = stored.cardLayout;
        let backgroundImage = '';
        if (sc.backgroundImageRef) {
          backgroundImage = (await this.getFile(db, sc.backgroundImageRef)) ?? '';
        } else if (sc.backgroundImage) {
          backgroundImage = sc.backgroundImage;  // legacy v2: inline
        }
        cardLayout = {
          shape: sc.shape ?? 'rectangle',
          width: sc.width,
          height: sc.height,
          diameter: sc.diameter ?? Math.max(sc.width, sc.height),
          marginTop: sc.marginTop,
          marginLeft: sc.marginLeft,
          backgroundImage,
        };
      }

      return { mode: stored.mode, imageStates, cardIndices: stored.cardIndices, cards: stored.cards, cardLayout, cardLayouts: stored.cardLayouts };
    } catch (err) {
      console.error('[Dobble] Failed to load persisted state:', err);
      return null;
    }
  }
}

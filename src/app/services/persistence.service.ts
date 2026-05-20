import { Injectable } from '@angular/core';
import { ImageState } from '../classes/image-state';
import { CardLayout } from '../classes/card-layout';
import { ImgLayout } from '../classes/img-layout';

type Mode = 4 | 6 | 8;

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

interface StoredState extends Omit<PersistedState, 'imageStates'> {
  imageStates: StoredImageState[];
}

const DB_NAME = 'dobble_db';
const DB_VERSION = 2;
const STATE_STORE = 'state';
const FILES_STORE = 'files';
const STATE_KEY = 'dobble_state';

@Injectable({ providedIn: 'root' })
export class PersistenceService {
  private dbPromise: Promise<IDBDatabase> | null = null;

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

  async save(state: PersistedState): Promise<void> {
    try {
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

      // Remove files no longer referenced by any image slot.
      const activeRefs = new Set(
        storedImageStates.map(s => s.fileRef).filter((r): r is string => r != null)
      );
      await this.deleteOrphanedFiles(db, activeRefs);

      const stored: StoredState = { ...state, imageStates: storedImageStates };
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STATE_STORE, 'readwrite');
        tx.objectStore(STATE_STORE).put(stored, STATE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {}
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

      return { ...stored, imageStates };
    } catch {
      return null;
    }
  }
}

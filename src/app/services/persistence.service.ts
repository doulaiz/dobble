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

const DB_NAME = 'dobble_db';
const DB_VERSION = 1;
const STORE_NAME = 'state';
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
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return this.dbPromise;
  }

  async save(state: PersistedState): Promise<void> {
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(state, STATE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {}
  }

  async load(): Promise<PersistedState | null> {
    try {
      const db = await this.openDB();
      return await new Promise<PersistedState | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(STATE_KEY);
        request.onsuccess = () => resolve((request.result as PersistedState) ?? null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }
}

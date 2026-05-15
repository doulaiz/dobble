import { Injectable } from '@angular/core';
import { ImageState } from '../classes/image-state';

type Mode = 4 | 6 | 8;

interface PersistedState {
  mode: Mode;
  imageStates: ImageState[];
  cards: string[][];
}

const STORAGE_KEY = 'dobble_state';

@Injectable({ providedIn: 'root' })
export class PersistenceService {
  save(state: PersistedState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  load(): PersistedState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PersistedState) : null;
    } catch {
      return null;
    }
  }
}

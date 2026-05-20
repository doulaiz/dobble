import { NgZone } from '@angular/core';

export function pickFile(accept: string, ngZone: NgZone): Promise<string> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    const done = (value: string) => ngZone.run(() => resolve(value));
    input.addEventListener('cancel', () => done(''));
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { done(''); return; }
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => done(ev.target!.result as string);
      reader.onerror = () => done('');
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

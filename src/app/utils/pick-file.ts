import { NgZone } from '@angular/core';

export function pickFile(accept: string, ngZone: NgZone): Promise<string> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        ngZone.run(() => resolve(ev.target!.result as string));
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

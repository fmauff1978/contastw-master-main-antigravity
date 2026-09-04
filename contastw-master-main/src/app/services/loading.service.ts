import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  // internal counter to support nested show/hide calls
  private counter = signal(0);
  isLoading = signal(false);
  message = signal<string>('Aguarde...');
  progress = signal<number>(0);

  show(msg?: string) {
    const c = this.counter();
    this.counter.set(c + 1);
    if (msg) this.message.set(msg);
    this.progress.set(0);
    this.isLoading.set(true);
  }

  hide() {
    const c = this.counter();
    const next = Math.max(0, c - 1);
    this.counter.set(next);
    if (next === 0) {
      this.isLoading.set(false);
      this.message.set('Aguarde...');
      this.progress.set(0);
    }
  }

  setMessage(msg: string) {
    this.message.set(msg);
  }

  setProgress(percent: number) {
    this.progress.set(Math.min(100, Math.max(0, percent)));
  }

  // force hide and reset counter
  reset() {
    this.counter.set(0);
    this.isLoading.set(false);
    this.message.set('Aguarde...');
    this.progress.set(0);
  }
}

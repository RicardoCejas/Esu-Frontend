/**
 * Utilidad de audio sintetizado con Web Audio API para alertas de llamada médica
 * No requiere archivos de audio externos, no sufre por CORS ni fallas de red.
 */
class SoundNotificationService {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Reproduce un agradable "ding-dong" de aviso hospitalario
   */
  public playChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Primer tono suave (Sol / G5 - 784 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(783.99, now);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.7);

      // Segundo tono suave más grave (Mi / E5 - 659.25 Hz) tras 300ms
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.3);

      gain2.gain.setValueAtTime(0, now + 0.3);
      gain2.gain.linearRampToValueAtTime(0.3, now + 0.35);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.3);
      osc2.stop(now + 1.2);
    } catch {
      // Ignorar fallas si las políticas de interacción del navegador bloquean temporalmente
    }
  }
}

export const soundNotification = new SoundNotificationService();

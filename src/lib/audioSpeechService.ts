export interface AudioSpeechOptions {
  volumen?: number;
  vozHabilitada?: boolean;
  lang?: string;
  rate?: number;
}

export function clampVolume(val?: number): number {
  if (typeof val !== 'number' || !Number.isFinite(val)) return 0.7;
  return Math.max(0, Math.min(1, val));
}

export function construirMensajeLlamado(
  pacienteNombre: string,
  consultorioNumero?: string
): string {
  const nombreLimpio = (pacienteNombre ?? '').trim();
  const consultorioLimpio = (consultorioNumero ?? '').trim();

  if (!consultorioLimpio || consultorioLimpio.toLowerCase() === 's/n') {
    return `Paciente ${nombreLimpio}, por favor acercarse a recepción.`;
  }
  return `Paciente ${nombreLimpio}, dirigirse a Consultorio ${consultorioLimpio}.`;
}

class AudioSpeechService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public isAudioSupported(): boolean {
    return typeof window !== 'undefined' && Boolean(window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext);
  }

  public isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public async playChime(volumen = 0.7): Promise<void> {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const safeVol = clampVolume(volumen) * 0.35;
      const now = ctx.currentTime;

      // Primer tono (Sol / G5 - 784 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(783.99, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(safeVol, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Segundo tono (Mi / E5 - 659.25 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.25);
      gain2.gain.setValueAtTime(0, now + 0.25);
      gain2.gain.linearRampToValueAtTime(safeVol * 1.1, now + 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 1.1);
    } catch {
      // Ignorar bloqueos de autoplay de navegadores no interactuados
    }
  }

  public async speakText(text: string, options: AudioSpeechOptions = {}): Promise<void> {
    if (!this.isSpeechSupported()) return;

    return new Promise((resolve) => {
      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = clampVolume(options.volumen);
        utterance.rate = options.rate ?? 0.95;
        utterance.lang = options.lang ?? 'es-AR';

        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find(
          (v) => v.lang.startsWith('es-AR') || v.lang.startsWith('es-419') || v.lang.startsWith('es')
        );
        if (spanishVoice) {
          utterance.voice = spanishVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);
      } catch {
        resolve();
      }
    });
  }

  public async anunciarLlamado(
    pacienteNombre: string,
    consultorioNumero?: string,
    options: AudioSpeechOptions = {}
  ): Promise<void> {
    await this.playChime(options.volumen);

    if (options.vozHabilitada !== false) {
      await new Promise((r) => setTimeout(r, 450));
      const frase = construirMensajeLlamado(pacienteNombre, consultorioNumero);
      await this.speakText(frase, options);
    }
  }

  public cancelAll(): void {
    if (this.isSpeechSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioSpeechService = new AudioSpeechService();

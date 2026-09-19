import { PaymentRecord, SoundboxSettings } from '../types';
import { playChimeSound } from './soundSynthesizer';

export function getCurrencyWord(currency: string, lang = 'en'): string {
  if (currency === '₹') {
    return lang.startsWith('hi') ? 'रुपये' : 'rupees';
  }
  if (currency === '$') return 'dollars';
  if (currency === '€') return 'euros';
  if (currency === '£') return 'pounds';
  return 'units';
}

export function formatAnnouncement(
  payment: Pick<PaymentRecord, 'amount' | 'currency' | 'appDisplayName' | 'payerName' | 'referenceId'>,
  settings: SoundboxSettings
): string {
  const { amount, currency, appDisplayName, payerName } = payment;
  const currencyWord = getCurrencyWord(currency, settings.language);

  switch (settings.template) {
    case 'hindi': {
      // Matches Java PaymentNotificationService: "आपको " + amount + " रुपये प्राप्त हुए"
      return `आपको ${amount} रुपये प्राप्त हुए`;
    }
    case 'hindi_detailed': {
      const payerPart = payerName && payerName !== 'Customer' ? ` ${payerName} से ` : ' ';
      return `${appDisplayName} पर${payerPart}${amount} ${currencyWord} प्राप्त हुए`;
    }
    case 'short':
      return `${amount} ${currencyWord} received`;
    case 'detailed': {
      const payerPart = payerName && payerName !== 'Customer' ? ` from ${payerName}` : '';
      return `Received payment of ${amount} ${currencyWord}${payerPart} on ${appDisplayName}`;
    }
    case 'custom': {
      return settings.customTemplate
        .replace(/{amount}/gi, String(amount))
        .replace(/{currency}/gi, currencyWord)
        .replace(/{app}/gi, appDisplayName)
        .replace(/{name}|{payer}/gi, payerName || 'Customer')
        .replace(/{ref}|{utr}/gi, payment.referenceId || '');
    }
    case 'standard':
    default:
      return `Received ${amount} ${currencyWord} on ${appDisplayName}`;
  }
}

export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const deduplicate = (rawVoices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] => {
      const seen = new Set<string>();
      const result: SpeechSynthesisVoice[] = [];
      for (const v of rawVoices) {
        const id = `${v.voiceURI || v.name}_${v.lang}`;
        if (!seen.has(id)) {
          seen.add(id);
          result.push(v);
        }
      }
      return result;
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(deduplicate(voices));
      return;
    }

    // Wait for voiceschanged event
    const handleVoicesChanged = () => {
      const updated = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(deduplicate(updated));
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    // Fallback timeout in case voiceschanged never fires
    setTimeout(() => {
      resolve(deduplicate(window.speechSynthesis.getVoices()));
    }, 500);
  });
}

export interface AnnounceOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export async function announcePayment(
  text: string,
  settings: SoundboxSettings,
  options?: AnnounceOptions
): Promise<void> {
  if (!('speechSynthesis' in window)) {
    options?.onError?.(new Error('Speech Synthesis not supported'));
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Play chime first if enabled
  if (settings.playChimeBeforeVoice) {
    try {
      await playChimeSound(settings.chimeSound, settings.chimeVolume);
    } catch {
      // ignore chime error
    }
  }

  return new Promise((resolve) => {
    try {
      options?.onStart?.();

      const voices = window.speechSynthesis.getVoices();
      let chosenVoice: SpeechSynthesisVoice | undefined;

      if (settings.voiceURI) {
        chosenVoice = voices.find(
          (v) => (v.voiceURI && v.voiceURI === settings.voiceURI) || v.name === settings.voiceURI
        );
      }

      if (!chosenVoice && settings.language) {
        chosenVoice =
          voices.find((v) => v.lang.toLowerCase() === settings.language.toLowerCase()) ||
          voices.find((v) => v.lang.toLowerCase().startsWith(settings.language.split('-')[0].toLowerCase()));
      }

      const speakCount = settings.repeatCount || 1;
      let iterationsCompleted = 0;

      const speakIteration = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        if (chosenVoice) {
          utterance.voice = chosenVoice;
          utterance.lang = chosenVoice.lang;
        } else if (settings.language) {
          utterance.lang = settings.language;
        }

        utterance.pitch = settings.pitch;
        utterance.rate = settings.rate;
        utterance.volume = settings.volume;

        utterance.onend = () => {
          iterationsCompleted++;
          if (iterationsCompleted < speakCount) {
            setTimeout(speakIteration, 350);
          } else {
            options?.onEnd?.();
            resolve();
          }
        };

        utterance.onerror = (e) => {
          options?.onError?.(e);
          options?.onEnd?.();
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      };

      speakIteration();
    } catch (err) {
      options?.onError?.(err);
      options?.onEnd?.();
      resolve();
    }
  });
}

export function stopCurrentAnnouncement() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// lib/services/speechService.ts
// Web Speech API for voice input/output

export interface SpeechRecognitionConfig {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface SpeechSynthesisConfig {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
}

class SpeechService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSpeechRecognition();
      this.initializeSpeechSynthesis();
    }
  }

  private initializeSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    } else {
      console.warn('Speech Recognition not supported');
    }
  }

  private initializeSpeechSynthesis() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      
      // Load voices
      this.loadVoices();
      
      // Voices may load asynchronously
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
      }
    } else {
      console.warn('Speech Synthesis not supported');
    }
  }

  private loadVoices() {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices();
    }
  }

  // SPEECH RECOGNITION (STT)
  
  startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: any) => void,
    config: SpeechRecognitionConfig = {}
  ): boolean {
    if (!this.recognition) {
      console.error('Speech Recognition not available');
      return false;
    }

    if (this.isListening) {
      console.warn('Already listening');
      return false;
    }

    // Apply config
    if (config.lang) this.recognition.lang = config.lang;
    if (config.continuous !== undefined) this.recognition.continuous = config.continuous;
    if (config.interimResults !== undefined) this.recognition.interimResults = config.interimResults;

    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const isFinal = event.results[last].isFinal;
      
      onResult(transcript, isFinal);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  // SPEECH SYNTHESIS (TTS)

  speak(
    text: string,
    config: SpeechSynthesisConfig = {},
    onEnd?: () => void,
    onError?: (error: any) => void
  ): boolean {
    if (!this.synthesis) {
      console.error('Speech Synthesis not available');
      return false;
    }

    // Stop any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Auto-detect language if not specified
    const detectedLang = this.detectLanguage(text);
    utterance.lang = config.lang || detectedLang;
    
    utterance.rate = config.rate || 0.9;
    utterance.pitch = config.pitch || 1.0;
    utterance.volume = config.volume || 1.0;
    
    if (config.voice) {
      utterance.voice = config.voice;
    } else {
      // Try to find appropriate voice for language
      const preferredVoice = this.getVoiceForLanguage(utterance.lang);
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      if (onError) onError(event);
    };

    try {
      this.synthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('Failed to speak:', error);
      return false;
    }
  }

  // Detect language from text
  private detectLanguage(text: string): string {
    // Simple Arabic detection
    const arabicPattern = /[\u0600-\u06FF]/;
    if (arabicPattern.test(text)) {
      return 'ar-AE';
    }
    return 'en-US';
  }

  // Get best voice for language
  private getVoiceForLanguage(lang: string): SpeechSynthesisVoice | undefined {
    const langPrefix = lang.split('-')[0];
    const voicesForLang = this.voices.filter(v => v.lang.startsWith(langPrefix));
    
    // Prefer local voices
    const localVoice = voicesForLang.find(v => v.localService);
    if (localVoice) return localVoice;
    
    // Fallback to any voice
    return voicesForLang[0];
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  // VOICE MANAGEMENT

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  getVoicesByLanguage(lang: string): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith(lang));
  }

  getDefaultVoice(lang: string = 'en'): SpeechSynthesisVoice | undefined {
    const voicesForLang = this.getVoicesByLanguage(lang);
    
    // Prefer local voices
    const localVoice = voicesForLang.find(v => v.localService);
    if (localVoice) return localVoice;
    
    // Fallback to any voice for that language
    return voicesForLang[0];
  }

  // FEATURE DETECTION

  isSpeechRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  isSpeechSynthesisSupported(): boolean {
    return this.synthesis !== null;
  }

  getCapabilities() {
    return {
      recognition: this.isSpeechRecognitionSupported(),
      synthesis: this.isSpeechSynthesisSupported(),
      voiceCount: this.voices.length,
      languages: [...new Set(this.voices.map(v => v.lang))].sort()
    };
  }
}

export const speechService = new SpeechService();
export default speechService;
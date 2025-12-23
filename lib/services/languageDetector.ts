// lib/services/languageDetector.ts
// Automatic language detection for English and Arabic

export type SupportedLanguage = 'en' | 'ar';

export interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: number;
  isArabic: boolean;
  isEnglish: boolean;
}

class LanguageDetector {
  // Unicode ranges for Arabic script
  private arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  
  // Common English words
  private commonEnglishWords = new Set([
    'the', 'is', 'are', 'where', 'what', 'how', 'when', 'who', 'can', 'do',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'a', 'an', 'to', 'from'
  ]);

  // Common Arabic words
  private commonArabicWords = new Set([
    'في', 'من', 'إلى', 'على', 'هو', 'هي', 'أنا', 'أنت', 'هذا', 'ذلك',
    'ما', 'كيف', 'أين', 'متى', 'لماذا', 'هل', 'نعم', 'لا', 'و', 'أو'
  ]);

  /**
   * Detect language from text
   */
  detect(text: string): LanguageDetectionResult {
    if (!text || text.trim().length === 0) {
      return {
        language: 'en',
        confidence: 0,
        isArabic: false,
        isEnglish: true
      };
    }

    const normalized = text.trim();
    
    // Count Arabic characters
    const arabicChars = (normalized.match(this.arabicPattern) || []).length;
    const totalChars = normalized.replace(/\s/g, '').length;
    
    // Calculate Arabic character percentage
    const arabicPercentage = totalChars > 0 ? (arabicChars / totalChars) : 0;

    // If >30% Arabic characters, it's likely Arabic
    if (arabicPercentage > 0.3) {
      return {
        language: 'ar',
        confidence: Math.min(arabicPercentage + 0.2, 1.0),
        isArabic: true,
        isEnglish: false
      };
    }

    // Check for common words
    const words = normalized.toLowerCase().split(/\s+/);
    
    let englishWordCount = 0;
    let arabicWordCount = 0;

    words.forEach(word => {
      if (this.commonEnglishWords.has(word)) {
        englishWordCount++;
      }
      if (this.commonArabicWords.has(word)) {
        arabicWordCount++;
      }
    });

    // Determine language based on word matches
    if (arabicWordCount > englishWordCount) {
      return {
        language: 'ar',
        confidence: 0.8,
        isArabic: true,
        isEnglish: false
      };
    }

    // Default to English
    return {
      language: 'en',
      confidence: 0.9,
      isArabic: false,
      isEnglish: true
    };
  }

  /**
   * Quick check if text contains Arabic
   */
  hasArabic(text: string): boolean {
    return this.arabicPattern.test(text);
  }

  /**
   * Quick check if text is primarily Arabic
   */
  isArabic(text: string): boolean {
    const result = this.detect(text);
    return result.isArabic;
  }

  /**
   * Quick check if text is primarily English
   */
  isEnglish(text: string): boolean {
    const result = this.detect(text);
    return result.isEnglish;
  }

  /**
   * Get appropriate speech language code
   */
  getSpeechLanguage(text: string): 'en-US' | 'ar-AE' {
    return this.isArabic(text) ? 'ar-AE' : 'en-US';
  }

  /**
   * Get text direction (LTR or RTL)
   */
  getTextDirection(text: string): 'ltr' | 'rtl' {
    return this.isArabic(text) ? 'rtl' : 'ltr';
  }

  /**
   * Detect mixed language content
   */
  detectMixed(text: string): {
    hasBothLanguages: boolean;
    primaryLanguage: SupportedLanguage;
    arabicPercentage: number;
    englishPercentage: number;
  } {
    const arabicChars = (text.match(this.arabicPattern) || []).length;
    const totalChars = text.replace(/\s/g, '').length;
    const arabicPercentage = totalChars > 0 ? (arabicChars / totalChars) : 0;
    const englishPercentage = 1 - arabicPercentage;

    return {
      hasBothLanguages: arabicPercentage > 0.1 && arabicPercentage < 0.9,
      primaryLanguage: arabicPercentage > 0.5 ? 'ar' : 'en',
      arabicPercentage,
      englishPercentage
    };
  }
}

export const languageDetector = new LanguageDetector();
export default languageDetector;
// lib/services/offlineEngine.ts
// Offline Intelligence Engine - Pure client-side semantic search

import { knowledgeBase, FAQ } from '../data/knowledgeBase';
import { arabicFAQs, arabicKeywordMap } from '../data/arabicTranslations';
import languageDetector, { SupportedLanguage } from './languageDetector';

interface QueryResult {
  answer: string;
  confidence: number;
  relatedQuestions: string[];
  category: string;
  source: 'offline-engine';
  matchedFaq?: FAQ;
  language?: SupportedLanguage;
}

class OfflineIntelligenceEngine {
  public kb = knowledgeBase;
  // Reduced stopwords - keep important query words
  private stopwords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'i', 'me', 'my', 'you', 'your'
  ]);

  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/wi-fi/gi, 'wifi')        // NEW: Handle Wi-Fi → wifi
      .replace(/[-_]/g, ' ')             // NEW: Convert hyphens to spaces
      .replace(/[\u064B-\u065F]/g, '')   // Remove Arabic diacritics
      .replace(/[ًٌٍَُِّْ]/g, '')
      .replace(/[؟،]/g, ' ')
      .replace(/ال/g, ' ')
      .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  tokenize(text: string): string[] {
    return text
      .split(' ')
      .filter(word => word.length > 2 && !this.stopwords.has(word));
  }

  levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  partialMatch(word1: string, word2: string): boolean {
    if (word1.length < 3 || word2.length < 3) return false;
    
    if (word1.startsWith(word2.slice(0, 3)) || word2.startsWith(word1.slice(0, 3))) {
      return true;
    }

    return this.levenshteinDistance(word1, word2) <= 2;
  }

  detectIntent(query: string, faq: FAQ): number {
    let intentScore = 0;

    if (/where|location|find|situated/i.test(query) && faq.category === 'facilities') {
      intentScore += 1;
    }

    if (/how (do|can|to)|process|steps/i.test(query) && faq.answer.includes('step')) {
      intentScore += 1;
    }

    if (/when|time|hours|open|close/i.test(query) && faq.answer.match(/\d+:\d+|hours|open/)) {
      intentScore += 1;
    }

    if (/cost|price|fee|charge|expensive/i.test(query) && faq.answer.match(/aed|\$/i)) {
      intentScore += 1;
    }
// "Is there" questions
    if (/is there|are there|do you have/i.test(query)) {
      intentScore += 1;
    }
    return intentScore;
  }

  findMatches(queryTokens: string[], fullQuery: string): Array<FAQ & { score: number }> {
    const scored = this.kb.faqs.map(faq => {
      let score = 0;

      // Exact keyword matching
      const keywords = faq.keywords.map(k => k.toLowerCase());
      queryTokens.forEach(token => {
        if (keywords.some(k => k.includes(token) || token.includes(k))) {
          score += 10;
        }
      });

      // Question similarity
      const faqTokens = this.tokenize(this.normalizeText(faq.question));
      const commonTokens = queryTokens.filter(t => faqTokens.includes(t));
      score += commonTokens.length * 5;

      // Partial word matching
      queryTokens.forEach(qToken => {
        keywords.forEach(keyword => {
          if (this.partialMatch(qToken, keyword)) {
            score += 3;
          }
        });
      });

      // Intent detection
      score += this.detectIntent(fullQuery, faq) * 8;

      // Question word matching
      const questionWords = ['where', 'what', 'how', 'when', 'who', 'which'];
      questionWords.forEach(qw => {
        if (fullQuery.includes(qw) && faq.question.toLowerCase().includes(qw)) {
          score += 4;
        }
      });

      return { ...faq, score };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  getDefaultResponse(query: string): string {
    if (query.match(/terminal|gate/i)) {
      return "I can help you with terminal information. Abu Dhabi Airport has 3 terminals. What specific information do you need?";
    }
    
    if (query.match(/food|eat|restaurant/i)) {
      return "There are many dining options available. Terminal 3 has 40+ restaurants including McDonald's, Shake Shack, and various Arabic cuisines.";
    }

    return "I'd be happy to help! You can ask me about WiFi, prayer rooms, lounges, shopping, transportation, or any airport facilities.";
  }

  async processQuery(userQuery: string): Promise<QueryResult> {
    console.log('🚀🚀🚀 PROCESS QUERY CALLED:', userQuery);
    
    // Direct Arabic character detection (more reliable)
    const hasArabic = /[\u0600-\u06FF]/.test(userQuery);
    const language = hasArabic ? 'ar' : 'en';
    
    console.log('🌍 DETECTED LANGUAGE:', language, '(hasArabic:', hasArabic + ')');
    
    if (language === 'ar') {
      console.log('➡️ Routing to ARABIC processor');
      return this.processArabicQuery(userQuery);
    }
    
    console.log('➡️ Routing to ENGLISH processor');
    return this.processEnglishQuery(userQuery);
  }
  private async processEnglishQuery(userQuery: string): Promise<QueryResult> {
    const normalizedQuery = this.normalizeText(userQuery);
    const tokens = this.tokenize(normalizedQuery);
    
    const matches = this.findMatches(tokens, normalizedQuery);
    
    const bestMatch = matches[0];
    
    // Accept matches with score >= 10 (was > 10)
    if (bestMatch && bestMatch.score >= 10) {
      return {
        answer: bestMatch.answer,
        confidence: Math.min(bestMatch.score / 100, 0.95),
        relatedQuestions: matches.slice(1, 4).map(m => m.question),
        category: bestMatch.category,
        source: 'offline-engine',
        matchedFaq: bestMatch,
        language: 'en'
      };
    }

    return {
      answer: this.getDefaultResponse(normalizedQuery),
      confidence: 0.3,
      relatedQuestions: this.kb.faqs.slice(0, 3).map(f => f.question),
      category: 'general',
      source: 'offline-engine',
      language: 'en'
    };
  }

  private async processArabicQuery(userQuery: string): Promise<QueryResult> {
    const normalizedQuery = this.normalizeText(userQuery);
    const tokens = this.tokenize(normalizedQuery);
    
    // Translate Arabic keywords to English for matching
    const translatedTokens = this.translateArabicKeywords(tokens);
    
    // Find matches using English knowledge base
    const englishMatches = this.findMatches(translatedTokens, normalizedQuery);
    
    // Accept matches with score >= 10 (was > 10)
    if (englishMatches.length > 0 && englishMatches[0].score >= 10) {
      const bestMatch = englishMatches[0];
      
      // Find corresponding Arabic FAQ
      const arabicFaq = arabicFAQs.find(faq => faq.id === bestMatch.id);
      
      if (arabicFaq) {
        // Get related Arabic questions
        const relatedArabicQuestions = englishMatches
          .slice(1, 4)
          .map(m => {
            const arabicRelated = arabicFAQs.find(faq => faq.id === m.id);
            return arabicRelated ? arabicRelated.question : m.question;
          });
        
        return {
          answer: arabicFaq.answer,
          confidence: Math.min(bestMatch.score / 100, 0.95),
          relatedQuestions: relatedArabicQuestions,
          category: bestMatch.category,
          source: 'offline-engine',
          matchedFaq: bestMatch,
          language: 'ar'
        };
      }
    }

    return {
      answer: this.getDefaultArabicResponse(normalizedQuery),
      confidence: 0.3,
      relatedQuestions: arabicFAQs.slice(0, 3).map(f => f.question),
      category: 'general',
      source: 'offline-engine',
      language: 'ar'
    };
  }

  private translateArabicKeywords(tokens: string[]): string[] {
    const translatedTokens: string[] = [];
    
    tokens.forEach(token => {
      let translated = false;
      
      // Check each keyword mapping
      for (const [englishKey, arabicWords] of Object.entries(arabicKeywordMap)) {
        if (arabicWords.some(arabicWord => token.includes(arabicWord) || arabicWord.includes(token))) {
          translatedTokens.push(englishKey);
          translated = true;
          break;
        }
      }
      
      // If no translation found, keep original
      if (!translated) {
        translatedTokens.push(token);
      }
    });
    
    return translatedTokens;
  }

  private getDefaultArabicResponse(query: string): string {
    if (query.match(/صالة|بوابة/)) {
      return "يمكنني مساعدتك بمعلومات الصالات. مطار أبوظبي الدولي لديه 3 صالات. ما هي المعلومات المحددة التي تحتاجها؟";
    }
    
    if (query.match(/طعام|مطعم|أكل/)) {
      return "هناك العديد من خيارات تناول الطعام المتاحة. الصالة 3 بها أكثر من 40 مطعم بما في ذلك ماكدونالدز وشيك شاك ومأكولات عربية متنوعة.";
    }

    return "يسعدني مساعدتك! يمكنك أن تسألني عن الواي فاي، المصليات، الصالات، التسوق، النقل، أو أي مرافق في المطار.";
  }

  getTerminalInfo(terminalId: string) {
    return this.kb.terminals.find(t => t.id === terminalId);
  }

  searchByCategory(category: string) {
    return this.kb.faqs.filter(faq => faq.category === category);
  }

  getEmergencyInfo() {
    return this.kb.emergencyContacts;
  }
}

export const offlineEngine = new OfflineIntelligenceEngine();
export default offlineEngine;
// lib/services/hybridEngine.ts
// Hybrid Intelligence Engine - Routes between online/offline with context awareness + NAVIGATION

import offlineEngine from './offlineEngine';
import contextManager from './contextManager';
import languageDetector from './languageDetector';
import navigationEngine from './navigationEngine';
import { findPOI, findSimplePath } from './simplePathfinding';

type ProcessingMode = 'online' | 'offline' | 'hybrid';

interface QueryResult {
  answer: string;
  confidence: number;
  relatedQuestions: string[];
  category: string;
  source: 'claude-api' | 'offline-engine' | 'navigation-engine';
  processingMode: ProcessingMode;
  timestamp: number;
  fallbackUsed?: boolean;
  language?: 'en' | 'ar';
  // NEW: Navigation data
  navigation?: {
    type: 'location' | 'route' | 'search';
    poi?: any;
    route?: any;
    locations?: any[];
  };
}

interface ConversationTurn {
  query: string;
  response: QueryResult;
  timestamp: number;
}

class HybridIntelligenceEngine {
  private mode: ProcessingMode = 'hybrid';
  private conversationHistory: ConversationTurn[] = [];
  private responseCache = new Map<string, QueryResult>();
  private isOnline = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupConnectivityMonitor();
    }
    console.log('🟢 Hybrid Engine initialized with Context Manager + Navigation');
  }

  private setupConnectivityMonitor() {
    if (typeof window !== 'undefined' && 'onLine' in navigator) {
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', () => {
        this.isOnline = true;
        console.log('🌐 Connection: ONLINE');
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
        console.log('🔴 Connection: OFFLINE');
      });
    }
  }

  /**
   * NEW: Detect navigation queries
   */
  private isNavigationQuery(query: string): { isNav: boolean; type: string } {
    const normalized = query.toLowerCase();
    
    // Direct navigation requests
    if (/take me to|navigate to|directions to|how do i get to|route to/i.test(normalized)) {
      return { isNav: true, type: 'route' };
    }
    
    // Location queries
    if (/where is|where can i find|location of|find (the |a )?nearest/i.test(normalized)) {
      return { isNav: true, type: 'location' };
    }
    
    // Search queries
    if (/show me|list|find (all )?|search for/i.test(normalized)) {
      return { isNav: true, type: 'search' };
    }
    
    return { isNav: false, type: '' };
  }

  /**
   * NEW: Extract location/facility from query
   */
  private extractSearchTerm(query: string): string {
    const normalized = query.toLowerCase();
    
    // Gate patterns
    const gateMatch = normalized.match(/gate\s*([a-c]\d+)/i);
    if (gateMatch) return `gate ${gateMatch[1]}`;
    
    // Common facilities
    if (normalized.includes('coffee') || normalized.includes('cafe')) return 'coffee';
    if (normalized.includes('restaurant') || normalized.includes('food')) return 'restaurant';
    if (normalized.includes('lounge')) return 'lounge';
    if (normalized.includes('prayer') || normalized.includes('mosque')) return 'prayer';
    if (normalized.includes('pharmacy') || normalized.includes('medicine')) return 'pharmacy';
    if (normalized.includes('duty free') || normalized.includes('shop')) return 'duty free';
    if (normalized.includes('restroom') || normalized.includes('toilet') || normalized.includes('bathroom')) return 'restroom';
    if (normalized.includes('atm') || normalized.includes('money')) return 'atm';
    
    // Extract quoted or capitalized terms
    const quotedMatch = normalized.match(/"([^"]+)"/);
    if (quotedMatch) return quotedMatch[1];
    
    return '';
  }

  /**
   * NEW: Process navigation queries
   */
  private async processNavigation(query: string): Promise<QueryResult> {
    console.log('🗺️  Processing navigation query');
    
    const { type } = this.isNavigationQuery(query);
    const searchTerm = this.extractSearchTerm(query);
    const language = languageDetector.detect(query);
    
    // Type 1: Route request (take me to X)
    if (type === 'route' && searchTerm) {
      const destination = findPOI(searchTerm);
      
      if (destination) {
        // For now, show location (later: calculate route from current position)
        return {
          answer: language === 'ar' 
            ? `وجدت ${destination.name}. يقع في ${destination.terminal}، ${destination.coordinates.level}.`
            : `I found ${destination.name}. It's located in ${destination.terminal}, ${destination.coordinates.level} level.`,
          confidence: 0.95,
          source: 'navigation-engine',
          category: 'navigation',
          processingMode: 'offline',
          timestamp: Date.now(),
          language,
          relatedQuestions: [
            'Show me on the map',
            'What\'s nearby?',
            'How long does it take to walk there?'
          ],
          navigation: {
            type: 'location',
            poi: destination
          }
        };
      }
    }
    
    // Type 2: Location query (where is X)
    if (type === 'location' && searchTerm) {
      const results = navigationEngine.searchPOIs(searchTerm, { limit: 3 });
      
      if (results.length > 0) {
        const locationList = results.map(r => `- ${r.name} (${r.terminal})`).join('\n');
        
        return {
          answer: language === 'ar'
            ? `وجدت ${results.length} موقع:\n${locationList}`
            : `I found ${results.length} location(s):\n${locationList}`,
          confidence: 0.9,
          source: 'navigation-engine',
          category: 'navigation',
          processingMode: 'offline',
          timestamp: Date.now(),
          language,
          relatedQuestions: [
            'Show me the nearest one',
            'Take me there',
            'What else is nearby?'
          ],
          navigation: {
            type: 'search',
            locations: results
          }
        };
      }
    }
    
    // Type 3: Search/browse (show me all X)
    if (type === 'search' && searchTerm) {
      const results = navigationEngine.searchPOIs(searchTerm, { limit: 10 });
      
      if (results.length > 0) {
        const stats = navigationEngine.getStats();
        
        return {
          answer: language === 'ar'
            ? `وجدت ${results.length} من ${searchTerm} في المطار. أقرب واحد هو ${results[0].name}.`
            : `I found ${results.length} ${searchTerm} locations in the airport. The closest one is ${results[0].name}.`,
          confidence: 0.85,
          source: 'navigation-engine',
          category: 'navigation',
          processingMode: 'offline',
          timestamp: Date.now(),
          language,
          relatedQuestions: [
            'Show all on map',
            'Which one is closest?',
            'Filter by concourse'
          ],
          navigation: {
            type: 'search',
            locations: results
          }
        };
      }
    }
    
    // No results found
    return {
      answer: language === 'ar'
        ? 'عذراً، لم أتمكن من العثور على ذلك. هل يمكنك إعادة الصياغة؟'
        : 'Sorry, I couldn\'t find that. Can you rephrase your question?',
      confidence: 0.3,
      source: 'navigation-engine',
      category: 'navigation',
      processingMode: 'offline',
      timestamp: Date.now(),
      language,
      relatedQuestions: [
        'Show me all gates',
        'Find restaurants',
        'Where are the lounges?'
      ]
    };
  }

  /**
   * Determine if query can be handled offline
   */
  private canHandleOffline(query: string): number {
    const normalized = query.toLowerCase();
    
    // Navigation queries are ALWAYS offline (high priority)
    const navCheck = this.isNavigationQuery(query);
    if (navCheck.isNav) return 0.95;
    
    // Known FAQ keywords that offline engine handles well
    const keywords = [
      'wifi', 'prayer', 'food', 'taxi', 'bus', 'lounge', 
      'exchange', 'baggage', 'duty free', 'gate', 'terminal',
      'restaurant', 'shop', 'pharmacy', 'atm', 'currency'
    ];
    
    const hasKnownKeyword = keywords.some(kw => normalized.includes(kw));
    if (hasKnownKeyword) return 0.9;
    
    // Location queries work well offline
    if (/where|location|find|أين|موقع/.test(normalized)) return 0.8;
    
    // Complex queries need online processing
    if (/recommend|suggest|best|compare|why|explain|how to/.test(normalized)) return 0.3;
    
    // Follow-up queries might need context (online better)
    if (contextManager.isFollowUpQuery(query)) return 0.4;
    
    return 0.5;
  }

  /**
   * Determine processing strategy
   */
  private determineStrategy(query: string, forceOffline: boolean): ProcessingMode {
    if (forceOffline) {
      console.log('🔒 Strategy: FORCED OFFLINE');
      return 'offline';
    }
    
    // Check if it's a navigation query first
    const navCheck = this.isNavigationQuery(query);
    if (navCheck.isNav) {
      console.log('🗺️  Strategy: NAVIGATION (offline)');
      return 'offline';
    }
    
    const offlineConfidence = this.canHandleOffline(query);
    console.log(`🔍 Offline confidence: ${offlineConfidence.toFixed(2)}`);
    
    // High confidence - use offline
    if (offlineConfidence > 0.7) return 'offline';
    
    // Low confidence and online - use online
    if (this.isOnline && offlineConfidence < 0.5) return 'online';
    
    // Medium confidence - try online with offline fallback
    return 'hybrid';
  }

  /**
   * Process query using Claude API (online)
   */
  private async processOnline(query: string, useCache: boolean): Promise<QueryResult> {
    // Check cache first
    if (useCache && this.responseCache.has(query)) {
      console.log('📦 Retrieved from cache');
      return this.responseCache.get(query)!;
    }
    
    try {
      console.log('🌐 Processing online with Claude API');
      
      // Enrich query with context
      const enrichedQuery = contextManager.enrichQuery(query);
      console.log('🧠 Context enrichment:', {
        hasFlight: enrichedQuery.context.hasFlight,
        hasHistory: enrichedQuery.context.hasHistory
      });
      
      // Build request with context
      const requestBody = {
        query: enrichedQuery.enrichedQuery,
        originalQuery: query,
        conversationHistory: this.getConversationContext(),
        flightInfo: contextManager.getFlightInfo(),
        userContext: {
          language: contextManager.getContext().preferences.language,
          lastTopic: contextManager.getContext().lastTopic
        }
      };
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Detect language
      const language = languageDetector.detect(query);
      
      const result: QueryResult = {
        answer: data.answer,
        confidence: 0.95,
        source: 'claude-api',
        relatedQuestions: data.relatedQuestions || [],
        category: this.inferCategory(query),
        processingMode: 'online',
        timestamp: Date.now(),
        language
      };
      
      // Cache the result
      this.responseCache.set(query, result);
      
      console.log('✅ Online processing complete');
      return result;
      
    } catch (error) {
      console.error('❌ Online processing failed:', error);
      throw error;
    }
  }

  /**
   * Process query using offline engine
   */
  private async processOffline(query: string): Promise<QueryResult> {
    // Check if it's a navigation query FIRST
    const navCheck = this.isNavigationQuery(query);
    if (navCheck.isNav) {
      return this.processNavigation(query);
    }
    
    console.log('📱 Processing offline');
    
    const result = await offlineEngine.processQuery(query);
    
    // Detect language
    const language = languageDetector.detect(query);
    
    return {
      ...result,
      processingMode: 'offline',
      timestamp: Date.now(),
      language
    };
  }

  /**
   * Process query in hybrid mode (try online, fallback to offline)
   */
  private async processHybrid(query: string, useCache: boolean): Promise<QueryResult> {
    try {
      // Try online first
      const result = await this.processOnline(query, useCache);
      return result;
    } catch (error) {
      console.log('🔄 Online failed, switching to offline fallback');
      
      // Fallback to offline
      const result = await this.processOffline(query);
      return {
        ...result,
        fallbackUsed: true
      };
    }
  }

  /**
   * Main query processing entry point
   */
  async processQuery(
    userQuery: string, 
    options: { forceOffline?: boolean; useCache?: boolean } = {}
  ): Promise<QueryResult> {
    const { forceOffline = false, useCache = true } = options;
    
    console.log(`🔍 Processing query: "${userQuery}"`);
    
    // Determine strategy
    const strategy = this.determineStrategy(userQuery, forceOffline);
    console.log(`🧠 Strategy: ${strategy.toUpperCase()}`);
    
    try {
      let result: QueryResult;
      
      // Route to appropriate processor
      switch (strategy) {
        case 'online':
          result = await this.processOnline(userQuery, useCache);
          break;
          
        case 'offline':
          result = await this.processOffline(userQuery);
          break;
          
        case 'hybrid':
          result = await this.processHybrid(userQuery, useCache);
          break;
      }
      
      // Add to history
      this.addToHistory(userQuery, result);
      
      // Update context manager with conversation turn
      contextManager.updateContext({
        type: 'conversation',
        data: {
          query: userQuery,
          response: result.answer,
          timestamp: Date.now(),
          category: result.category,
          language: result.language
        }
      });
      
      console.log('✅ Query processed successfully');
      return result;
      
    } catch (error) {
      console.error('❌ Query processing error:', error);
      
      // Final fallback to offline if not already tried
      if (strategy !== 'offline') {
        console.log('⚠️ Final fallback to offline mode');
        return this.processOffline(userQuery);
      }
      
      throw error;
    }
  }

  /**
   * Get recent conversation context for Claude API
   */
  private getConversationContext() {
    return this.conversationHistory
      .slice(-5) // Last 5 turns
      .flatMap(item => [
        { role: 'user', content: item.query },
        { role: 'assistant', content: item.response.answer }
      ]);
  }

  /**
   * Infer category from query
   */
  private inferCategory(query: string): string {
    const q = query.toLowerCase();
    
    if (/wifi|internet|connection|واي فاي/.test(q)) return 'connectivity';
    if (/prayer|muslim|salah|صلاة|مصلى/.test(q)) return 'religious';
    if (/food|restaurant|eat|dining|مطعم|طعام/.test(q)) return 'dining';
    if (/taxi|bus|transport|car|metro|مواصلات|تاكسي/.test(q)) return 'transport';
    if (/lounge|rest|relax|استراحة/.test(q)) return 'amenities';
    if (/shop|duty free|buy|shopping|دوتي فري|تسوق/.test(q)) return 'shopping';
    if (/baggage|luggage|claim|حقائب|أمتعة/.test(q)) return 'baggage';
    if (/gate|terminal|departure|بوابة|مبنى/.test(q)) return 'navigation';
    if (/exchange|currency|atm|money|صرف|عملة/.test(q)) return 'financial';
    
    return 'general';
  }

  /**
   * Add query to conversation history
   */
  private addToHistory(query: string, response: QueryResult) {
    this.conversationHistory.push({
      query,
      response,
      timestamp: Date.now()
    });
    
    // Keep only last 20 turns
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  /**
   * Set processing mode
   */
  setMode(mode: ProcessingMode) {
    if (['online', 'offline', 'hybrid'].includes(mode)) {
      this.mode = mode;
      console.log(`🔧 Mode set to: ${mode}`);
    }
  }

  /**
   * Get engine status
   */
  getStatus() {
    const context = contextManager.getContext();
    const navStats = navigationEngine.getStats();
    
    return {
      mode: this.mode,
      isOnline: this.isOnline,
      cacheSize: this.responseCache.size,
      historyLength: this.conversationHistory.length,
      offlineReady: true,
      hasFlightInfo: contextManager.hasFlight(),
      conversationTurns: context.conversationHistory.length,
      userLanguage: context.preferences.language,
      // NEW: Navigation stats
      navigationReady: true,
      totalPOIs: navStats.totalPOIs,
      navigationNodes: navStats.navigationNodes
    };
  }

  /**
   * Clear response cache
   */
  clearCache() {
    this.responseCache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    console.log('🗑️ History cleared');
  }

  /**
   * Get analytics
   */
  getAnalytics() {
    const total = this.conversationHistory.length;
    const online = this.conversationHistory.filter(h => h.response.source === 'claude-api').length;
    const offline = this.conversationHistory.filter(h => h.response.source === 'offline-engine').length;
    const navigation = this.conversationHistory.filter(h => h.response.source === 'navigation-engine').length;
    
    return {
      totalQueries: total,
      onlineQueries: online,
      offlineQueries: offline,
      navigationQueries: navigation,
      onlinePercentage: total > 0 ? ((online / total) * 100).toFixed(1) : '0',
      averageConfidence: this.calculateAverageConfidence(),
      fallbackCount: this.conversationHistory.filter(h => h.response.fallbackUsed).length
    };
  }

  /**
   * Calculate average confidence score
   */
  private calculateAverageConfidence(): string {
    if (this.conversationHistory.length === 0) return '0';
    
    const sum = this.conversationHistory.reduce(
      (acc, item) => acc + item.response.confidence, 
      0
    );
    
    return ((sum / this.conversationHistory.length) * 100).toFixed(1);
  }
}

// Create singleton instance
const hybridEngine = new HybridIntelligenceEngine();

export default hybridEngine;
export { HybridIntelligenceEngine };
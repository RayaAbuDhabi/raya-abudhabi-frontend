// lib/services/contextManager.ts
// Context Manager Service - Remembers flight info, conversation history, preferences

import { 
  FlightInfo, 
  ConversationTurn, 
  UserPreferences, 
  UserContext, 
  ContextUpdate,
  ContextualSuggestion,
  ContextEnrichedQuery 
} from '../types/context';

class ContextManager {
  private context: UserContext;
  private readonly MAX_HISTORY = 20; // Keep last 20 conversations

  constructor() {
    this.context = this.initializeContext();
    console.log('🧠 Context Manager initialized');
  }

  /**
   * Initialize empty context
   */
  private initializeContext(): UserContext {
    return {
      flight: null,
      conversationHistory: [],
      preferences: {
        language: 'en',
        notificationPreferences: {
          gateChanges: true,
          boardingTime: true,
          flightUpdates: true
        }
      },
      sessionStarted: Date.now(),
      lastActivity: Date.now()
    };
  }

  /**
   * Update context with new information
   */
  updateContext(update: ContextUpdate): void {
    console.log('🧠 Updating context:', update.type);
    this.context.lastActivity = Date.now();

    switch (update.type) {
      case 'flight':
        this.context.flight = update.data as FlightInfo;
        console.log('✈️ Flight info stored:', this.context.flight?.flightNumber);
        break;

      case 'conversation':
        this.addConversationTurn(update.data as ConversationTurn);
        break;

      case 'preference':
        this.context.preferences = { ...this.context.preferences, ...update.data };
        console.log('⚙️ Preferences updated');
        break;

      case 'location':
        this.context.currentLocation = update.data;
        console.log('📍 Location updated:', update.data.terminal);
        break;

      case 'reset':
        this.context = this.initializeContext();
        console.log('🔄 Context reset');
        break;
    }
  }

  /**
   * Add a conversation turn to history
   */
  private addConversationTurn(turn: ConversationTurn): void {
    this.context.conversationHistory.push(turn);
    
    // Update last topic/category
    if (turn.category) {
      this.context.lastTopic = turn.category;
      this.context.lastCategory = turn.category;
    }

    // Trim history if too long
    if (this.context.conversationHistory.length > this.MAX_HISTORY) {
      this.context.conversationHistory = this.context.conversationHistory.slice(-this.MAX_HISTORY);
    }

    console.log(`💬 Conversation history: ${this.context.conversationHistory.length} turns`);
  }

  /**
   * Get current context
   */
  getContext(): UserContext {
    return { ...this.context };
  }

  /**
   * Get flight information
   */
  getFlightInfo(): FlightInfo | null {
    return this.context.flight;
  }

  /**
   * Check if user has a flight
   */
  hasFlight(): boolean {
    return this.context.flight !== null;
  }

  /**
   * Get conversation history
   */
  getHistory(): ConversationTurn[] {
    return [...this.context.conversationHistory];
  }

  /**
   * Get last N conversation turns
   */
  getRecentHistory(n: number = 5): ConversationTurn[] {
    return this.context.conversationHistory.slice(-n);
  }

  /**
   * Enrich query with context
   */
  enrichQuery(query: string): ContextEnrichedQuery {
    const context = this.getContext();
    let enrichedQuery = query;
    const relatedTopics: string[] = [];

    // Add flight context if available
    if (context.flight) {
      const flightContext = `User's flight: ${context.flight.flightNumber} from ${context.flight.from} to ${context.flight.to}, Gate ${context.flight.gate}, Seat ${context.flight.seat}`;
      enrichedQuery = `${flightContext}\n\nUser question: ${query}`;
      relatedTopics.push('flight-info');
    }

    // Add recent conversation context
    if (context.conversationHistory.length > 0) {
      const recentTurns = this.getRecentHistory(3);
      const historyContext = recentTurns
        .map(turn => `Q: ${turn.query}\nA: ${turn.response}`)
        .join('\n');
      enrichedQuery += `\n\nRecent conversation:\n${historyContext}`;
      relatedTopics.push('conversation-history');
    }

    // Add last topic if relevant
    if (context.lastTopic) {
      relatedTopics.push(context.lastTopic);
    }

    console.log('🔍 Query enriched with context:', {
      hasFlight: this.hasFlight(),
      hasHistory: context.conversationHistory.length > 0,
      relatedTopics
    });

    return {
      originalQuery: query,
      enrichedQuery,
      context: {
        hasFlight: this.hasFlight(),
        hasHistory: context.conversationHistory.length > 0,
        relatedTopics,
        userLanguage: context.preferences.language
      }
    };
  }

  /**
   * Get contextual suggestions based on current state
   */
  getSuggestions(): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];
    const context = this.getContext();
    const isArabic = context.preferences.language === 'ar';

    // Flight-based suggestions
    if (context.flight) {
      const flight = context.flight;
      const now = Date.now();
      const departureTime = flight.departureTime ? new Date(flight.departureTime).getTime() : now + 7200000; // Default 2 hours
      const timeUntilDeparture = departureTime - now;

      // Suggest gate directions if flight soon
      if (timeUntilDeparture < 3600000 && timeUntilDeparture > 0) { // Within 1 hour
        suggestions.push({
          question: isArabic ? 'كيف أصل إلى بوابتي؟' : 'How do I get to my gate?',
          priority: 10,
          reason: 'Flight departing within 1 hour'
        });
      }

      // Suggest baggage info if not discussed
      const discussedBaggage = context.conversationHistory.some(turn => 
        turn.category === 'baggage' || turn.query.toLowerCase().includes('baggage')
      );
      if (!discussedBaggage) {
        suggestions.push({
          question: isArabic ? 'أين أستلم حقائبي؟' : 'Where is baggage claim?',
          priority: 7,
          reason: 'Baggage not yet discussed'
        });
      }

      // Suggest terminal facilities
      suggestions.push({
        question: isArabic ? 'ما هي المرافق المتاحة في المبنى؟' : 'What facilities are in my terminal?',
        priority: 5,
        reason: 'General terminal info'
      });
    } else {
      // No flight scanned - suggest scanning
      suggestions.push({
        question: isArabic ? 'كيف أمسح بطاقة الصعود؟' : 'How do I scan my boarding pass?',
        priority: 10,
        reason: 'No flight information available'
      });
    }

    // Sort by priority
    suggestions.sort((a, b) => b.priority - a.priority);

    console.log(`💡 Generated ${suggestions.length} contextual suggestions`);
    return suggestions.slice(0, 5); // Return top 5
  }

  /**
   * Detect if query references previous conversation
   */
  isFollowUpQuery(query: string): boolean {
    const followUpPatterns = [
      'tell me more', 'what about', 'and what', 'how about',
      'can you explain', 'what do you mean', 'more info',
      'أخبرني المزيد', 'ماذا عن', 'وماذا', 'كيف',
      'هل يمكنك', 'ماذا تعني', 'مزيد من المعلومات'
    ];

    const lowerQuery = query.toLowerCase();
    return followUpPatterns.some(pattern => lowerQuery.includes(pattern));
  }

  /**
   * Get time until flight departure (in minutes)
   */
  getTimeUntilDeparture(): number | null {
    if (!this.context.flight?.departureTime) return null;
    
    const now = Date.now();
    const departure = new Date(this.context.flight.departureTime).getTime();
    return Math.floor((departure - now) / 60000); // Convert to minutes
  }

  /**
   * Check if user should be at gate
   */
  shouldBeAtGate(): boolean {
    const timeUntilDeparture = this.getTimeUntilDeparture();
    if (timeUntilDeparture === null) return false;
    
    // Suggest going to gate 45 minutes before departure
    return timeUntilDeparture <= 45 && timeUntilDeparture > 0;
  }

  /**
   * Reset context (for new session)
   */
  reset(): void {
    this.updateContext({ type: 'reset', data: null });
  }

  /**
   * Export context for persistence (localStorage, etc.)
   */
  exportContext(): string {
    return JSON.stringify(this.context);
  }

  /**
   * Import context from persistence
   */
  importContext(contextString: string): void {
    try {
      const imported = JSON.parse(contextString);
      this.context = imported;
      console.log('📥 Context imported successfully');
    } catch (error) {
      console.error('❌ Failed to import context:', error);
    }
  }
}

// Create singleton instance
const contextManager = new ContextManager();

// Export both the instance (default) and the class
export default contextManager;
export { ContextManager };
// lib/hooks/useRaya.ts
// React hook for Raya functionality with Context Manager integration

'use client';

import { useState, useEffect, useCallback } from 'react';
import hybridEngine from '../services/hybridEngine';
import speechService from '../services/speechService';
import languageDetector, { SupportedLanguage } from '../services/languageDetector';
import contextManager from '../services/contextManager';
import { arabicQuickQuestions } from '../data/arabicTranslations';
import { FlightInfo } from '../types/context';

interface Message {
  type: 'user' | 'assistant' | 'error';
  text: string;
  timestamp: string;
  source?: 'claude-api' | 'offline-engine';
  mode?: string;
  confidence?: number;
}

interface UseRayaReturn {
  messages: Message[];
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  status: any;
  analytics: any;
  forceOffline: boolean;
  language: SupportedLanguage;
  flightInfo: FlightInfo | null;
  contextualSuggestions: string[];
  sendMessage: (text: string) => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  stopSpeaking: () => void;
  toggleOfflineMode: () => void;
  toggleLanguage: () => void;
  setFlightInfo: (flight: FlightInfo) => void;
  clearFlightInfo: () => void;
  clearHistory: () => void;
}

export function useRaya(): UseRayaReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState(hybridEngine.getStatus());
  const [analytics, setAnalytics] = useState(hybridEngine.getAnalytics());
  const [forceOffline, setForceOffline] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [flightInfo, setFlightInfoState] = useState<FlightInfo | null>(null);
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([]);

  // Initialize - get flight info from context manager on mount
  useEffect(() => {
    const existingFlight = contextManager.getFlightInfo();
    if (existingFlight) {
      setFlightInfoState(existingFlight);
    }
    
    const context = contextManager.getContext();
    setLanguage(context.preferences.language);
    
    console.log('🔴 useRaya hook initialized');
  }, []);

  // Update status and suggestions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(hybridEngine.getStatus());
      setAnalytics(hybridEngine.getAnalytics());
      
      // Update contextual suggestions using correct method name
      const suggestions = contextManager.getSuggestions();
      setContextualSuggestions(suggestions.map(s => s.question));
      
      // Sync flight info state
      const currentFlight = contextManager.getFlightInfo();
      setFlightInfoState(currentFlight);
      
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Send message and get response
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    console.log('🔴 Sending message:', text);
    setIsProcessing(true);
    setTranscript('');

    // Add user message
    const userMessage: Message = {
      type: 'user',
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Process query through hybrid engine (context is added there)
      const result = await hybridEngine.processQuery(text, {
        forceOffline,
        useCache: true
      });

      console.log('🔴 Response received:', {
        source: result.source,
        mode: result.processingMode,
        confidence: result.confidence
      });

      // Add assistant response
      const assistantMessage: Message = {
        type: 'assistant',
        text: result.answer,
        timestamp: new Date().toLocaleTimeString(),
        source: result.source,
        mode: result.processingMode,
        confidence: result.confidence
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Auto-detect language for speech
      const detectedLang = result.language || languageDetector.detect(result.answer);
      const speechLang = languageDetector.getSpeechLanguage(result.answer);
      
      console.log('🔴 Speaking response in:', speechLang);

      // Speak response
      setIsSpeaking(true);
      speechService.speak(
        result.answer,
        { lang: speechLang, rate: 0.9, pitch: 1.0 },
        () => {
          console.log('🔴 Speech completed');
          setIsSpeaking(false);
        },
        () => {
          console.log('🔴 Speech ended');
          setIsSpeaking(false);
        }
      );

    } catch (error) {
      console.error('🔴 Message processing error:', error);
      
      const errorMessage: Message = {
        type: 'error',
        text: language === 'ar' 
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [forceOffline, isProcessing, language]);

  // Start voice recognition
  const startListening = useCallback(() => {
    if (isListening || isProcessing) return;

    console.log('🔴 Starting voice recognition in:', language);

    // Use current language setting for speech recognition
    const speechLang = language === 'ar' ? 'ar-AE' : 'en-US';

    const success = speechService.startListening(
      (text, isFinal) => {
        console.log('🔴 Speech transcript:', text, 'Final:', isFinal);
        setTranscript(text);
        
        if (isFinal) {
          setIsListening(false);
          sendMessage(text);
        }
      },
      (error) => {
        console.error('🔴 Speech recognition error:', error);
        setIsListening(false);
        setTranscript('');
      },
      {
        lang: speechLang,
        continuous: false,
        interimResults: true
      }
    );

    if (success) {
      setIsListening(true);
      console.log('🔴 Voice recognition started');
    } else {
      console.error('🔴 Failed to start voice recognition');
    }
  }, [isListening, isProcessing, sendMessage, language]);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    speechService.stopListening();
    setIsListening(false);
    console.log('🔴 Voice recognition stopped');
  }, []);

  // Stop speech synthesis
  const stopSpeaking = useCallback(() => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
    console.log('🔴 Speech synthesis stopped');
  }, []);

  // Toggle offline mode
  const toggleOfflineMode = useCallback(() => {
    setForceOffline(prev => {
      const newValue = !prev;
      console.log('🔴 Force offline mode:', newValue);
      return newValue;
    });
  }, []);

  // Toggle language
  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    
    // Update context manager preferences
    contextManager.updateContext({
      type: 'preference',
      data: { language: newLang }
    });
    
    console.log('🔴 Language toggled to:', newLang);
  }, [language]);

  // Set flight info from boarding pass scan
  const setFlightInfo = useCallback((flight: FlightInfo) => {
    console.log('🔴 Setting flight info:', flight.flightNumber);
    
    setFlightInfoState(flight);
    
    // Update context manager with flight info
    contextManager.updateContext({
      type: 'flight',
      data: flight
    });
    
    console.log('✈️ Flight info stored in context:', {
      flight: flight.flightNumber,
      gate: flight.gate,
      destination: flight.to
    });
    
    // Update suggestions after flight is set
    const suggestions = contextManager.getSuggestions();
    setContextualSuggestions(suggestions.map(s => s.question));
    
  }, []);

  // Clear flight info
  const clearFlightInfo = useCallback(() => {
    console.log('🔴 Clearing flight info');
    
    setFlightInfoState(null);
    
    // Reset context manager (clears flight and resets context)
    contextManager.reset();
    
    // Update suggestions after clearing
    const suggestions = contextManager.getSuggestions();
    setContextualSuggestions(suggestions.map(s => s.question));
    
  }, []);

  // Clear conversation history
  const clearHistory = useCallback(() => {
    console.log('🔴 Clearing conversation history');
    
    setMessages([]);
    hybridEngine.clearHistory();
    hybridEngine.clearCache();
    
    // Reset context (keeps flight info, clears conversation)
    const currentFlight = contextManager.getFlightInfo();
    contextManager.reset();
    
    // Restore flight if it existed
    if (currentFlight) {
      contextManager.updateContext({
        type: 'flight',
        data: currentFlight
      });
    }
    
    console.log('🔴 History cleared, flight info preserved');
  }, []);

  return {
    messages,
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    status,
    analytics,
    forceOffline,
    language,
    flightInfo,
    contextualSuggestions,
    sendMessage,
    startListening,
    stopListening,
    stopSpeaking,
    toggleOfflineMode,
    toggleLanguage,
    setFlightInfo,
    clearFlightInfo,
    clearHistory
  };
}
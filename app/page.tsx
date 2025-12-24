'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPlayingNews, setIsPlayingNews] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-GB');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const newsAudioRef = useRef<HTMLAudioElement | null>(null);
  const shouldContinueListeningRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.maxAlternatives = 1;
        
        // Add more time for Arabic speech (some browsers need this)
        if (recognitionRef.current.hasOwnProperty('speechTimeout')) {
          recognitionRef.current.speechTimeout = 5000; // 5 seconds
        }

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setCurrentTranscript(transcript);
          handleSendMessage(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          // Log the error for debugging
          console.log('Recognition error details:', {
            error: event.error,
            language: selectedLanguage,
            message: event.message
          });
          
          // Auto-restart if conversation is active and it was just a temporary error
          if (shouldContinueListeningRef.current && event.error !== 'aborted') {
            setTimeout(() => {
              if (shouldContinueListeningRef.current) {
                startListening();
              }
            }, 1000); // Increased to 1 second for Arabic
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          console.log('Recognition ended', {
            shouldContinue: shouldContinueListeningRef.current,
            language: selectedLanguage
          });
          // Don't auto-restart here - we'll restart after Raya speaks
        };
      }

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        if (availableVoices.length > 0 && !selectedVoice) {
          const defaultVoice = availableVoices.find(v => 
            v.lang.toLowerCase().startsWith('en')
          ) || availableVoices[0];
          setSelectedVoice(defaultVoice);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const availableVoices = voices.filter(voice => {
    const lang = voice.lang.toLowerCase();
    
    if (selectedLanguage === 'en-GB') {
      return lang.startsWith('en');
    }
    if (selectedLanguage === 'ar-AE') {
      return lang.startsWith('ar');
    }
    return false;
  });

  useEffect(() => {
    if (availableVoices.length > 0) {
      const currentVoiceStillAvailable = availableVoices.find(v => v.name === selectedVoice?.name);
      if (!currentVoiceStillAvailable) {
        setSelectedVoice(availableVoices[0]);
      }
    }
  }, [selectedLanguage, availableVoices]);

  const startConversation = () => {
    setIsConversationActive(true);
    setConversationHistory([]);
    setCurrentTranscript('');
    shouldContinueListeningRef.current = true;
    startListening();
  };

  const endConversation = () => {
    setIsConversationActive(false);
    shouldContinueListeningRef.current = false;
    stopListening();
    stopSpeaking();
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        // Try multiple Arabic variants for better compatibility
        let langCode = selectedLanguage;
        if (selectedLanguage === 'ar-AE') {
          // Try ar-SA first (better browser support), fallback to ar-AE
          langCode = 'ar-SA';
        }
        
        console.log('Starting recognition with language:', langCode);
        recognitionRef.current.lang = langCode;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        // If it fails, try again after a short delay
        if (shouldContinueListeningRef.current) {
          setTimeout(() => startListening(), 1000);
        }
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      setIsListening(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    // Add user message to history
    const updatedHistory = [...conversationHistory, { role: 'user' as const, content: message }];
    setConversationHistory(updatedHistory);
  
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: message,  // ✅ Changed from 'message' to 'query'
          conversationHistory: updatedHistory 
        }),
      });
  
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
  
      const data = await res.json();
      
      // Add assistant response to history
      const newHistory = [...updatedHistory, { role: 'assistant' as const, content: data.answer }];  // ✅ Changed from data.response to data.answer
      setConversationHistory(newHistory);
      
      speakResponse(data.answer);  // ✅ Changed from data.response to data.answer
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = 'Sorry, there was an error processing your request.';
      const newHistory = [...updatedHistory, { role: 'assistant' as const, content: errorMsg }];
      setConversationHistory(newHistory);
      speakResponse(errorMsg);
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage;
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        // Auto-restart listening after Raya finishes speaking (if conversation is active)
        if (shouldContinueListeningRef.current) {
          setTimeout(() => {
            if (shouldContinueListeningRef.current) {
              startListening();
            }
          }, 500);
        }
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        // Still restart listening even if speech fails
        if (shouldContinueListeningRef.current) {
          setTimeout(() => {
            if (shouldContinueListeningRef.current) {
              startListening();
            }
          }, 500);
        }
      };
      
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const playDailyNews = () => {
    const audioFile = selectedLanguage === 'ar-AE' 
      ? '/news/daily-update-ar.mp3' 
      : '/news/daily-update-en.mp3';
    
    if (newsAudioRef.current) {
      newsAudioRef.current.src = audioFile;
      newsAudioRef.current.play();
      setIsPlayingNews(true);
    }
  };

  const stopNews = () => {
    if (newsAudioRef.current) {
      newsAudioRef.current.pause();
      newsAudioRef.current.currentTime = 0;
      setIsPlayingNews(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audio.onended = () => setIsPlayingNews(false);
      audio.onerror = () => {
        setIsPlayingNews(false);
      };
      newsAudioRef.current = audio;
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-indigo-900 mb-2">RAYA</h1>
          <p className="text-xl text-indigo-700">Your Abu Dhabi Airport AI Assistant</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language / اللغة
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isConversationActive}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="en-GB">🇬🇧 English</option>
                <option value="ar-AE">🇦🇪 العربية (Arabic)</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice / الصوت
              </label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = availableVoices.find(v => v.name === e.target.value);
                  if (voice) setSelectedVoice(voice);
                }}
                disabled={isConversationActive}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              >
                {availableVoices.length === 0 ? (
                  <option>No voices available</option>
                ) : (
                  availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={playDailyNews}
              disabled={isPlayingNews || isConversationActive}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {selectedLanguage === 'ar-AE' ? '📰 أخبار اليوم' : '📰 Today\'s Update'}
            </button>

            {isPlayingNews && (
              <button
                onClick={stopNews}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {selectedLanguage === 'ar-AE' ? '⏹️ إيقاف الأخبار' : '⏹️ Stop News'}
              </button>
            )}
          </div>
          // Add this section to your app/page.tsx after the language/voice selectors
          // and before the "Start Conversation" button
          
          {/* Scanner Button */}
          <div className="mb-6">
            <button
              onClick={() => window.location.href = '/scanner'}
              disabled={isConversationActive}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <span className="text-2xl">📱</span>
              <span>{selectedLanguage === 'ar-AE' ? 'مسح بطاقة الصعود' : 'Scan Boarding Pass'}</span>
            </button>
          </div>
          <div className="flex justify-center mb-6">
            {!isConversationActive ? (
              <button
                onClick={startConversation}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-12 rounded-full text-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🎤 {selectedLanguage === 'ar-AE' ? 'ابدأ المحادثة' : 'Start Conversation'}
              </button>
            ) : (
              <button
                onClick={endConversation}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-12 rounded-full text-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ⏹️ {selectedLanguage === 'ar-AE' ? 'إنهاء المحادثة' : 'End Conversation'}
              </button>
            )}
          </div>

          {isConversationActive && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg border-2 border-indigo-300">
              <div className="flex items-center justify-center gap-3">
                {isListening && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-indigo-700 font-medium">
                      {selectedLanguage === 'ar-AE' ? 'أستمع...' : 'Listening...'}
                    </span>
                  </div>
                )}
                {isSpeaking && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-indigo-700 font-medium">
                      {selectedLanguage === 'ar-AE' ? 'رايا تتحدث...' : 'Raya speaking...'}
                    </span>
                  </div>
                )}
                {!isListening && !isSpeaking && (
                  <span className="text-indigo-600 font-medium">
                    {selectedLanguage === 'ar-AE' ? '💬 المحادثة نشطة' : '💬 Conversation Active'}
                  </span>
                )}
              </div>
            </div>
          )}

          {conversationHistory.length > 0 && (
            <div className="space-y-4 max-h-96 overflow-y-auto mb-6 p-4 bg-gray-50 rounded-lg">
              {conversationHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-100 border-l-4 border-blue-500 ml-8'
                      : 'bg-indigo-100 border-l-4 border-indigo-500 mr-8'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {msg.role === 'user'
                      ? (selectedLanguage === 'ar-AE' ? 'أنت:' : 'You:')
                      : (selectedLanguage === 'ar-AE' ? 'رايا:' : 'Raya:')}
                  </p>
                  <p className="text-gray-800">{msg.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center text-gray-600 text-sm">
          <p>{selectedLanguage === 'ar-AE' ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by AI'}</p>
          <p className="mt-2">
            {selectedLanguage === 'ar-AE' 
              ? 'ابدأ محادثة مفتوحة مع رايا - اسأل عن أي شيء!' 
              : 'Start an open conversation with Raya - ask about anything!'}
          </p>
        </div>
      </div>
    </main>
  );
}
// app/raya/page.tsx
// Raya AI Airport Assistant - Main Interface with Context Manager

'use client';

import { useState } from 'react';
import { useRaya } from '@/lib/hooks/useRaya';
import { useRouter } from 'next/navigation';

export default function RayaPage() {
  const router = useRouter();
  const {
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
    clearFlightInfo,
    clearHistory
  } = useRaya();

  const [textInput, setTextInput] = useState('');
  const isRTL = language === 'ar';

  // Handle text input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && !isProcessing) {
      sendMessage(textInput);
      setTextInput('');
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    if (!isProcessing) {
      sendMessage(suggestion);
    }
  };

  // Handle voice button
  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else if (isSpeaking) {
      stopSpeaking();
    } else {
      startListening();
    }
  };

  // Navigate to scanner
  const handleScanClick = () => {
    router.push('/scanner');
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✈️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {language === 'ar' ? 'رايا - مساعدك الذكي' : 'Raya - Your AI Assistant'}
                </h1>
                <p className="text-sm text-gray-500">
                  {language === 'ar' ? 'مطار أبوظبي الدولي' : 'Abu Dhabi International Airport'}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm font-medium text-blue-700 transition-colors"
                title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
              >
                {language === 'ar' ? 'EN' : 'عربي'}
              </button>

              {/* Offline Toggle */}
              <button
                onClick={toggleOfflineMode}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  forceOffline
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
                title={forceOffline ? 'Online Mode' : 'Offline Mode'}
              >
                {forceOffline ? '📴' : '🌐'}
              </button>

              {/* Clear History */}
              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                title={language === 'ar' ? 'مسح المحادثة' : 'Clear History'}
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        {/* Flight Info Card */}
        {flightInfo && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 mb-4 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">
                  {language === 'ar' ? '✈️ معلومات رحلتك' : '✈️ Your Flight'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {flightInfo.passengerName}
                </p>
              </div>
              <button
                onClick={clearFlightInfo}
                className="text-white/80 hover:text-white text-sm underline"
              >
                {language === 'ar' ? 'مسح' : 'Clear'}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-blue-200 text-xs mb-1">
                  {language === 'ar' ? 'رقم الرحلة' : 'Flight'}
                </p>
                <p className="font-bold text-lg">{flightInfo.flightNumber}</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs mb-1">
                  {language === 'ar' ? 'البوابة' : 'Gate'}
                </p>
                <p className="font-bold text-lg">{flightInfo.gate}</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs mb-1">
                  {language === 'ar' ? 'المقعد' : 'Seat'}
                </p>
                <p className="font-bold text-lg">{flightInfo.seat}</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs mb-1">
                  {language === 'ar' ? 'إلى' : 'To'}
                </p>
                <p className="font-bold text-lg">{flightInfo.to}</p>
              </div>
            </div>

            {flightInfo.departureTime && (
              <div className="mt-4 pt-4 border-t border-blue-400/30">
                <p className="text-blue-100 text-sm">
                  {language === 'ar' ? '🕒 موعد المغادرة: ' : '🕒 Departure: '}
                  <span className="font-semibold text-white">{flightInfo.departureTime}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* No Flight - Scan Prompt */}
        {!flightInfo && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {language === 'ar' ? 'امسح بطاقة الصعود للحصول على مساعدة شخصية' : 'Scan Your Boarding Pass for Personalized Help'}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {language === 'ar' 
                  ? 'سأتمكن من تقديم معلومات دقيقة عن بوابتك، مقعدك، ووقت الصعود'
                  : "I'll provide precise info about your gate, seat, and boarding time"}
              </p>
              <button
                onClick={handleScanClick}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {language === 'ar' ? '📷 مسح بطاقة الصعود' : '📷 Scan Boarding Pass'}
              </button>
            </div>
          </div>
        )}

        {/* Contextual Suggestions */}
        {contextualSuggestions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {language === 'ar' ? '💡 أسئلة مقترحة' : '💡 Suggested Questions'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {contextualSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 min-h-[400px] max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-6xl mb-4">👋</p>
                <p className="text-lg">
                  {language === 'ar' 
                    ? 'مرحباً! كيف يمكنني مساعدتك اليوم؟'
                    : 'Hello! How can I help you today?'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.type === 'user' ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : msg.type === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      <span>{msg.timestamp}</span>
                      {msg.source && (
                        <>
                          <span>•</span>
                          <span>{msg.source === 'claude-api' ? '🌐' : '📱'}</span>
                        </>
                      )}
                      {msg.confidence && (
                        <>
                          <span>•</span>
                          <span>{(msg.confidence * 100).toFixed(0)}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Processing Indicator */}
              {isProcessing && (
                <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            {/* Text Input */}
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={language === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

            {/* Voice Button */}
            <button
              type="button"
              onClick={handleVoiceClick}
              disabled={isProcessing}
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : isSpeaking
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={
                isListening 
                  ? (language === 'ar' ? 'إيقاف التسجيل' : 'Stop Recording')
                  : isSpeaking
                  ? (language === 'ar' ? 'إيقاف التحدث' : 'Stop Speaking')
                  : (language === 'ar' ? 'ابدأ التحدث' : 'Start Speaking')
              }
            >
              {isListening ? '⏹️' : isSpeaking ? '🔊' : '🎤'}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!textInput.trim() || isProcessing}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === 'ar' ? 'إرسال' : 'Send'}
            </button>
          </form>

          {/* Voice Transcript */}
          {transcript && (
            <div className="mt-3 px-4 py-2 bg-blue-50 rounded-lg text-sm text-blue-700">
              <span className="font-medium">
                {language === 'ar' ? 'سماع: ' : 'Hearing: '}
              </span>
              {transcript}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="mt-4 bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>
                {status.isOnline ? '🟢' : '🔴'} {status.isOnline ? 'Online' : 'Offline'}
              </span>
              <span>
                {status.hasFlightInfo ? '✈️' : '📱'} {status.hasFlightInfo ? 'Flight Loaded' : 'No Flight'}
              </span>
              <span>
                💬 {status.conversationTurns || 0} {language === 'ar' ? 'رسائل' : 'messages'}
              </span>
              <span>
                📊 {analytics.totalQueries || 0} {language === 'ar' ? 'استفسارات' : 'queries'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">
                {language === 'ar' ? 'وضع:' : 'Mode:'} {forceOffline ? 'Offline' : 'Hybrid'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
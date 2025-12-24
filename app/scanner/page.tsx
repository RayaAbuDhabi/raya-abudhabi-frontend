'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QRScanner from '@/app/components/QRScanner';
import BoardingPassCard from '@/app/components/BoardingPassCard';
import boardingPassParser from '@/lib/services/boardingPassParser';
import { BoardingPass } from '@/lib/types/boardingPass';

export default function ScannerPage() {
  const router = useRouter();
  const [boardingPass, setBoardingPass] = useState<BoardingPass | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>('en');

  const handleScanSuccess = async (scannedData: string) => {
    setIsProcessing(true);
    setError('');

    console.log('Scanned data:', scannedData);

    // Parse the boarding pass
    const result = boardingPassParser.parse(scannedData);

    if (result.success && result.boardingPass) {
      setBoardingPass(result.boardingPass);
      
      // Announce via speech
      const announcement = selectedLanguage === 'ar'
        ? `تم مسح بطاقة الصعود. رحلة ${result.boardingPass.flightNumber} إلى ${result.boardingPass.destination}. البوابة ${result.boardingPass.gateNumber}.`
        : `Boarding pass scanned. Flight ${result.boardingPass.flightNumber} to ${result.boardingPass.destination}. Gate ${result.boardingPass.gateNumber}.`;
      
      speak(announcement);
    } else {
      setError(result.error || 'Failed to parse boarding pass');
    }

    setIsProcessing(false);
  };

  const handleScanError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'ar' ? 'ar-AE' : 'en-GB';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNavigateToGate = () => {
    if (!boardingPass) return;

    // Navigate to main page with gate query
    const gateQuery = `gate ${boardingPass.gateNumber}`;
    
    // Store boarding pass in session storage for main page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pendingNavigation', gateQuery);
      sessionStorage.setItem('boardingPass', JSON.stringify(boardingPass));
    }

    router.push('/');
  };

  const handleReset = () => {
    setBoardingPass(null);
    setError('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-indigo-900 mb-2">RAYA</h1>
          <p className="text-xl text-indigo-700">
            {selectedLanguage === 'ar' ? 'مسح بطاقة الصعود' : 'Boarding Pass Scanner'}
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setSelectedLanguage('en')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              selectedLanguage === 'en'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => setSelectedLanguage('ar')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              selectedLanguage === 'ar'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🇦🇪 العربية
          </button>
        </div>

        {/* Main Content */}
        {!boardingPass ? (
          <>
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
              language={selectedLanguage}
            />

            {isProcessing && (
              <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded text-center">
                <p className="text-blue-700 font-medium">
                  {selectedLanguage === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                </p>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-red-700">❌ {error}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <BoardingPassCard
              boardingPass={boardingPass}
              onNavigateToGate={handleNavigateToGate}
              language={selectedLanguage}
            />

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {selectedLanguage === 'ar' ? '🔄 مسح جديد' : '🔄 Scan Another'}
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {selectedLanguage === 'ar' ? '🏠 الصفحة الرئيسية' : '🏠 Home'}
              </button>
            </div>
          </>
        )}

        {/* Back Button */}
        {!boardingPass && (
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              ← {selectedLanguage === 'ar' ? 'العودة إلى رايا' : 'Back to Raya'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
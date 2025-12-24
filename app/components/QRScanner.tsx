'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  language?: 'en' | 'ar';
}

export default function QRScanner({ onScanSuccess, onScanError, language = 'en' }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  const text = {
    en: {
      start: 'Start Scanner',
      stop: 'Stop Scanner',
      scanning: 'Scanning...',
      instructions: 'Position the barcode within the frame',
      cameraError: 'Camera access denied or not available',
      success: 'Boarding pass detected!'
    },
    ar: {
      start: 'ابدأ المسح',
      stop: 'إيقاف المسح',
      scanning: 'جاري المسح...',
      instructions: 'ضع الباركود داخل الإطار',
      cameraError: 'تم رفض الوصول إلى الكاميرا أو غير متاحة',
      success: 'تم اكتشاف بطاقة الصعود!'
    }
  };

  const t = text[language];

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      hasScannedRef.current = false;

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' }, // Use back camera on mobile
        {
          fps: 10,
          qrbox: { width: 300, height: 150 }, // Wider box for barcode
          aspectRatio: 2.0
        },
        (decodedText) => {
          // Prevent multiple scans of same barcode
          if (!hasScannedRef.current) {
            hasScannedRef.current = true;
            console.log('Scanned:', decodedText);
            onScanSuccess(decodedText);
            
            // Stop scanner after successful scan
            if (scannerRef.current) {
              scannerRef.current.stop().catch(console.error);
              setIsScanning(false);
            }
          }
        },
        (errorMessage) => {
          // Scanning errors (most are just "no barcode found" which is normal)
          // Only log actual errors, not "NotFoundException"
          if (!errorMessage.includes('NotFoundException')) {
            console.warn('Scan error:', errorMessage);
          }
        }
      );

      setIsScanning(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start camera';
      setError(errorMsg);
      setIsScanning(false);
      
      if (onScanError) {
        onScanError(errorMsg);
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          {language === 'ar' ? '📷 مسح بطاقة الصعود' : '📷 Scan Boarding Pass'}
        </h2>

        {/* Scanner Container */}
        <div className="relative mb-4">
          <div
            id="qr-reader"
            className="w-full rounded-lg overflow-hidden border-4 border-indigo-500"
            style={{ minHeight: isScanning ? '300px' : '100px' }}
          />
          
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-gray-600 mb-4">{t.instructions}</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {isScanning && (
          <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <div className="flex items-center">
              <div className="animate-pulse mr-3 text-blue-500">●</div>
              <p className="text-blue-700 font-medium">{t.scanning}</p>
            </div>
            <p className="text-sm text-blue-600 mt-1">{t.instructions}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-700">❌ {error}</p>
            <p className="text-sm text-red-600 mt-1">{t.cameraError}</p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-4">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📷 {t.start}
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ⏹️ {t.stop}
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {language === 'ar' 
              ? '💡 نصيحة: ضع الباركود الموجود على بطاقة الصعود أمام الكاميرا. يعمل بشكل أفضل في الإضاءة الجيدة.'
              : '💡 Tip: Hold the barcode on your boarding pass in front of the camera. Works best in good lighting.'}
          </p>
        </div>
      </div>
    </div>
  );
}
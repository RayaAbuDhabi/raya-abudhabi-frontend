'use client';

import { BoardingPass } from '@/lib/types/boardingPass';

interface BoardingPassCardProps {
  boardingPass: BoardingPass;
  onNavigateToGate?: () => void;
  language?: 'en' | 'ar';
}

export default function BoardingPassCard({ 
  boardingPass, 
  onNavigateToGate,
  language = 'en' 
}: BoardingPassCardProps) {
  
  const text = {
    en: {
      boardingPass: 'Boarding Pass',
      passenger: 'Passenger',
      flight: 'Flight',
      from: 'From',
      to: 'To',
      gate: 'Gate',
      seat: 'Seat',
      departure: 'Departure',
      boarding: 'Boarding Time',
      class: 'Class',
      booking: 'Booking Ref',
      navigateBtn: '🗺️ Navigate to Gate',
      economy: 'Economy',
      business: 'Business',
      first: 'First Class'
    },
    ar: {
      boardingPass: 'بطاقة الصعود',
      passenger: 'الراكب',
      flight: 'رقم الرحلة',
      from: 'من',
      to: 'إلى',
      gate: 'البوابة',
      seat: 'المقعد',
      departure: 'المغادرة',
      boarding: 'وقت الصعود',
      class: 'الدرجة',
      booking: 'رقم الحجز',
      navigateBtn: '🗺️ الانتقال إلى البوابة',
      economy: 'الاقتصادية',
      business: 'رجال الأعمال',
      first: 'الدرجة الأولى'
    }
  };

  const t = text[language];

  const getClassLabel = () => {
    if (!boardingPass.classOfService) return '';
    switch (boardingPass.classOfService) {
      case 'first': return t.first;
      case 'business': return t.business;
      case 'economy': return t.economy;
      default: return boardingPass.classOfService;
    }
  };

  const getClassColor = () => {
    switch (boardingPass.classOfService) {
      case 'first': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'business': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'economy': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">✈️ {t.boardingPass}</h2>
              <p className="text-indigo-200 text-sm mt-1">
                {boardingPass.airline} {boardingPass.flightNumber}
              </p>
            </div>
            {boardingPass.classOfService && (
              <div className={`px-4 py-2 rounded-lg border-2 ${getClassColor()}`}>
                <span className="font-semibold text-sm">{getClassLabel()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600 mb-1">{t.passenger}</p>
            <p className="text-2xl font-bold text-gray-800">
              {boardingPass.passengerName}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-xs text-gray-500 mb-1">{t.from}</p>
              <p className="text-2xl font-bold text-indigo-600">
                {boardingPass.origin}
              </p>
              {boardingPass.originCity && (
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {boardingPass.originCity}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center">
              <div className="text-4xl text-gray-400">→</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-xs text-gray-500 mb-1">{t.to}</p>
              <p className="text-2xl font-bold text-indigo-600">
                {boardingPass.destination}
              </p>
              {boardingPass.destinationCity && (
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {boardingPass.destinationCity}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 shadow">
              <p className="text-xs text-green-700 mb-1">{t.gate}</p>
              <p className="text-3xl font-bold text-green-700">
                {boardingPass.gateNumber}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow border-2 border-gray-200">
              <p className="text-xs text-gray-600 mb-1">{t.seat}</p>
              <p className="text-3xl font-bold text-gray-800">
                {boardingPass.seatNumber}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow border-2 border-gray-200">
              <p className="text-xs text-gray-600 mb-1">{t.departure}</p>
              <p className="text-2xl font-bold text-gray-800">
                {boardingPass.departureTime}
              </p>
            </div>
          </div>

          {boardingPass.bookingReference && (
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-xs text-gray-500 mb-1">{t.booking}</p>
              <p className="text-lg font-mono font-semibold text-gray-700">
                {boardingPass.bookingReference}
              </p>
            </div>
          )}

          {onNavigateToGate && boardingPass.gateNumber !== 'TBA' && (
            <button
              onClick={onNavigateToGate}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {t.navigateBtn} {boardingPass.gateNumber}
            </button>
          )}
        </div>

        <div className="bg-gray-100 px-6 py-4 border-t-2 border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            {language === 'ar'
              ? 'تأكد من الوصول إلى البوابة قبل 30 دقيقة من المغادرة'
              : 'Please arrive at the gate 30 minutes before departure'}
          </p>
        </div>
      </div>
    </div>
  );
}
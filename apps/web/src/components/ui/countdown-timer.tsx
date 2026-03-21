'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endDate: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endDate: string): TimeLeft | null {
  const difference = new Date(endDate).getTime() - new Date().getTime();

  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export function CountdownTimer({ endDate, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
    calculateTimeLeft(endDate),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          <svg
            className="w-4 h-4 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-red-600 font-semibold text-sm">Time&apos;s Up</span>
        </div>
      </div>
    );
  }

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}>
      {units.map((unit, index) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div
            className={`relative bg-gray-900 text-white rounded-lg p-3 min-w-[56px] text-center shadow-lg ${
              index === units.length - 1 ? 'animate-pulse-subtle' : ''
            }`}
          >
            {/* Top shine effect */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-lg pointer-events-none" />
            <span className="relative text-2xl font-extrabold tabular-nums leading-none tracking-tight">
              {String(unit.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs text-gray-500 uppercase tracking-wider mt-1.5 font-medium">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}

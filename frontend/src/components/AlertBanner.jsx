import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function AlertBanner({ alert, onDismiss }) {
  if (!alert) return null;

  const { type, message } = alert;

  const configs = {
    success: {
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      textColor: 'text-emerald-950',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />,
    },
    error: {
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-300',
      textColor: 'text-rose-950',
      icon: <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />,
    },
    info: {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300',
      textColor: 'text-black',
      icon: <Info className="w-4 h-4 text-black flex-shrink-0" />,
    },
  };

  const current = configs[type] || configs.info;

  return (
    <div
      className={`rounded-lg border p-3 mb-4 flex items-start justify-between gap-2.5 transition-all ${current.bgColor} ${current.borderColor}`}
      role="alert"
    >
      <div className="flex items-start gap-2.5">
        {current.icon}
        <div className={`text-xs sm:text-sm font-medium ${current.textColor} leading-snug`}>
          {message}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          type="button"
          className="p-1 rounded hover:bg-black/5 text-gray-500 hover:text-black transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

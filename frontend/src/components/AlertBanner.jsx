import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function AlertBanner({ alert, onDismiss }) {
  if (!alert) return null;

  const { type, message } = alert;

  const configs = {
    success: {
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    },
    error: {
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      textColor: 'text-rose-800',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
    },
  };

  const current = configs[type] || configs.info;

  return (
    <div
      className={`rounded-xl border p-4 mb-6 flex items-start justify-between gap-3 shadow-sm transition-all duration-200 ${current.bgColor} ${current.borderColor}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {current.icon}
        <div className={`text-sm font-medium ${current.textColor} leading-5`}>
          {message}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          type="button"
          className={`p-1 rounded-lg transition-colors hover:bg-black/5 ${current.textColor}`}
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

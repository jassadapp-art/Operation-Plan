import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, ExternalLink, X, Mail } from 'lucide-react';

export default function LineNotificationToast({ notification, onClose }) {
  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 max-w-md bg-white border border-blue-300 rounded-xl shadow-2xl p-4 z-50 animate-bounce-short">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
          <Mail className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              การแจ้งเตือนทาง Email (ระบบอัตโนมัติ)
            </h4>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-blue-700 font-medium mt-0.5">
            ถึง: {notification.recipientName} ({notification.recipientEmail || notification.recipientLineId})
          </p>
          <div className="mt-2 bg-blue-50 rounded-lg p-2.5 border border-blue-100 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
            {notification.message}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>เวลา: {notification.timestamp}</span>
            <span className="text-blue-600 font-medium">✓ ส่งอีเมลสำเร็จ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { X, Bell, CheckCircle2, MessageSquare, Mail } from 'lucide-react';

export default function NotificationModal({ isOpen, onClose, notifications }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">ประวัติการส่งแจ้งเตือนทาง Email ทั้งหมด</h3>
              <p className="text-[11px] text-slate-500">บันทึกข้อความส่งงาน ขอแก้ไขแผน และผลการตรวจรับงาน</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              ยังไม่มีประวัติการส่งแจ้งเตือน
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    ถึง: {notif.recipientName} ({notif.recipientEmail || notif.recipientLineId})
                  </div>
                  <span className="text-[11px] text-slate-400">{notif.timestamp}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {notif.message}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>โครงการ: {notif.projectName}</span>
                  <span className="text-emerald-700 font-medium">✓ สถานะ: {notif.status}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}

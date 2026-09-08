import React, { useState } from 'react';
import { Lock, User, KeyRound, CheckCircle2, Shield, Calendar, Wrench, SearchCheck } from 'lucide-react';

export default function LoginModal({ onLogin, allUsers }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = allUsers.find(u => u.username === username);
    if (!user || user.password !== password) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      return;
    }
    setError('');
    onLogin(user);
  };

  const handleQuickLogin = (u) => {
    setUsername(u.username);
    setPassword(u.password);
    onLogin(u);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold">เข้าสู่ระบบเพื่อจัดการสิทธิ์</h2>
          <p className="text-blue-200 text-xs mt-1">Project Planning & Schedule System</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้ (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น admin, planner, worker, inspector"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่าน"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-all shadow-md shadow-blue-500/20"
            >
              เข้าสู่ระบบ (Sign In)
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
              คลิกเพื่อเข้าสู่ระบบทดสอบทันที (Quick Login Demo)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin(allUsers.find(u => u.role === 'admin'))}
                className="flex items-center gap-2 p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left transition"
              >
                <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-purple-900">Admin</div>
                  <div className="text-[10px] text-purple-700">จัดการสิทธิ์/ผู้ใช้</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(allUsers.find(u => u.role === 'planner'))}
                className="flex items-center gap-2 p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition"
              >
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-blue-900">Planner</div>
                  <div className="text-[10px] text-blue-700">วางแผนโครงการ</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(allUsers.find(u => u.role === 'worker'))}
                className="flex items-center gap-2 p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-left transition"
              >
                <Wrench className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">Worker</div>
                  <div className="text-[10px] text-emerald-700">ดำเนินการ/ส่งงาน</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(allUsers.find(u => u.role === 'inspector'))}
                className="flex items-center gap-2 p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-left transition"
              >
                <SearchCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-900">Inspector</div>
                  <div className="text-[10px] text-amber-700">ตรวจรับงาน</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

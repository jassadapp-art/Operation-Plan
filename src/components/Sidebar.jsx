import React from 'react';
import { 
  BarChart3, 
  CalendarPlus, 
  Send, 
  CheckSquare, 
  ShieldCheck, 
  LogOut, 
  UserCheck, 
  Bell,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ 
  activePage, 
  setActivePage, 
  currentUser, 
  onLogout,
  onSwitchUser,
  allUsers,
  pendingReviewsCount,
  pendingRevisionsCount,
  openNotifModal
}) {
  const menuItems = [
    {
      id: 1,
      title: 'สถานะโครงการ & ไทม์ไลน์',
      subtitle: 'Dashboard & Gantt Schedule',
      icon: BarChart3,
      roles: ['admin', 'planner', 'worker', 'inspector']
    },
    {
      id: 2,
      title: 'วางแผนโครงการ',
      subtitle: 'เริ่มต้นโครงการ / ขอแก้แผน',
      icon: CalendarPlus,
      roles: ['admin', 'planner', 'inspector'],
      badge: pendingRevisionsCount > 0 ? `${pendingRevisionsCount} คำขอ` : null,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 3,
      title: 'ดำเนินการและส่งงาน',
      subtitle: 'อัปเดตงาน / แนบไฟล์ส่งงาน',
      icon: Send,
      roles: ['admin', 'worker', 'planner']
    },
    {
      id: 4,
      title: 'ตรวจงานและคอนเฟิร์ม',
      subtitle: 'ตรวจรับงาน / ผ่าน-ไม่ผ่าน',
      icon: CheckSquare,
      roles: ['admin', 'inspector'],
      badge: pendingReviewsCount > 0 ? `${pendingReviewsCount} รอตรวจ` : null,
      badgeColor: 'bg-rose-500'
    },
    {
      id: 5,
      title: 'จัดการสิทธิ์ & ข้อมูล Email',
      subtitle: 'Admin จัดการผู้ใช้และรหัสผ่าน',
      icon: ShieldCheck,
      roles: ['admin'],
      adminOnly: true
    }
  ];

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { text: 'ผู้ดูแลระบบ (Admin)', bg: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'planner':
        return { text: 'ผู้วางแผน (Planner)', bg: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'worker':
        return { text: 'ผู้ส่งงาน/ปฏิบัติงาน', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'inspector':
        return { text: 'ผู้ตรวจงาน (Inspector)', bg: 'bg-amber-100 text-amber-700 border-amber-200' };
      default:
        return { text: role, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <aside className="w-72 bg-slate-900 text-slate-100 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 shadow-xl z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white">ProjectPlan Pro</h1>
            <p className="text-[11px] text-slate-400">ระบบวางแผนและติดตามโครงการ</p>
          </div>
        </div>

        <button 
          onClick={openNotifModal}
          title="ประวัติการแจ้งเตือนทาง Email"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-400 absolute top-1.5 right-1.5 animate-pulse"></span>
        </button>
      </div>

      {/* User Profile Card */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border border-slate-600 shrink-0">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">{currentUser?.name}</div>
            <div className="text-[11px] text-slate-400">รหัส: {currentUser?.employeeId}</div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${roleInfo.bg}`}>
            {roleInfo.text}
          </span>
          <span className="text-[11px] text-slate-400 truncate max-w-[120px]" title={currentUser?.email}>
            {currentUser?.email || 'ไม่มีอีเมล'}
          </span>
        </div>

        {/* Quick Role Switcher for Demo */}
        <div className="mt-3 pt-2 border-t border-slate-700/60">
          <label className="text-[10px] text-slate-400 font-medium block mb-1">
            สลับบทบาททดสอบ (Quick Switch):
          </label>
          <select 
            value={currentUser?.id}
            onChange={(e) => onSwitchUser(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 py-1.5 px-2 focus:outline-none focus:border-blue-500"
          >
            {allUsers?.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="px-3 py-2 flex-1 overflow-y-auto space-y-1.5">
        <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          เมนูหลัก (5 หน้า)
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const isAllowed = item.roles.includes(currentUser?.role);

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-150 relative group ${
                isActive 
                  ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-600/30' 
                  : isAllowed 
                    ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white' 
                    : 'text-slate-500 opacity-60 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : isAllowed ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-600'}`} />
              
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium leading-snug flex items-center gap-1.5">
                  <span className="truncate">{item.title}</span>
                  {item.adminOnly && (
                    <span className="text-[9px] bg-purple-900/60 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/30">
                      Admin
                    </span>
                  )}
                </div>
                <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  {item.subtitle}
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full shrink-0 shadow-sm ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}

              {isActive && (
                <ChevronRight className="w-4 h-4 text-blue-200 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs text-rose-300 hover:text-white hover:bg-rose-900/30 rounded-lg transition-colors border border-rose-900/40"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบ (Logout)</span>
        </button>
      </div>
    </aside>
  );
}

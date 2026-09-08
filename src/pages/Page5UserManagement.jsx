import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Key, 
  Edit, 
  Trash2, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Mail
} from 'lucide-react';

export default function Page5UserManagement({ 
  allUsers, 
  currentUser, 
  onSaveUser, 
  onDeleteUser, 
  onTestLineNotif,
  onSwitchUser 
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    username: '',
    password: '',
    email: '',
    role: 'worker'
  });

  const isAdmin = currentUser?.role === 'admin';

  const handleOpenAdd = () => {
    setEditingUser(null);
    const nextEmpNum = 'EMP00' + (allUsers.length + 1);
    setFormData({
      employeeId: nextEmpNum,
      name: '',
      username: '',
      password: '',
      email: '',
      role: 'worker'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      employeeId: user.employeeId,
      name: user.name,
      username: user.username,
      password: user.password || '',
      email: user.email || '',
      role: user.role
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.name || !formData.username) {
      alert('กรุณากรอกรหัสพนักงาน ชื่อ และ Username ให้ครบถ้วน');
      return;
    }
    onSaveUser({
      ...(editingUser ? { id: editingUser.id } : { id: formData.employeeId }),
      ...formData
    });
    setShowModal(false);
    alert('บันทึกข้อมูลผู้ใช้งานเรียบร้อยแล้ว');
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin (ผู้ดูแลระบบ)', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'planner':
        return { label: 'ผู้วางแผนโครงการ (Planner)', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'worker':
        return { label: 'ผู้ปฏิบัติงาน/ส่งงาน (Worker)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'inspector':
        return { label: 'ผู้ตรวจงาน (Inspector)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      default:
        return { label: role, color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center max-w-xl mx-auto shadow-sm my-10 space-y-4">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">สิทธิ์ในการแก้ไข User มีเพียง Admin เท่านั้น</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          ท่านกำลังเข้าใช้งานด้วยบัญชี: <strong>{currentUser?.name}</strong> ซึ่งมีสิทธิ์ <strong>{currentUser?.role}</strong><br />
          เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถจัดการรหัสผ่านและสิทธิ์ผู้ใช้งานได้
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              const adminUser = allUsers.find(u => u.role === 'admin');
              if (adminUser) onSwitchUser(adminUser.id);
            }}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/20"
          >
            สลับเป็นผู้ใช้งาน "สมชาย ผู้ดูแลระบบ (Admin)" ทันที
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            หน้าจัดการสิทธิ์ รหัสผ่าน และข้อมูล Email (Admin Only)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            จัดการรหัสพนักงาน, ชื่อ, ข้อมูล Email สำหรับรับแจ้งเตือน และกำหนดสิทธิ์ในแผนงาน
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          + เพิ่มผู้ใช้งานใหม่
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            รายชื่อผู้ใช้งานทั้งหมดในระบบ ({allUsers.length} คน)
          </h3>
          <span className="text-xs text-slate-500">
            สิทธิ์การแก้ไข: เฉพาะ Admin
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase text-[11px] font-bold">
              <tr>
                <th className="px-4 py-3 text-center w-28">รหัสพนักงาน</th>
                <th className="px-4 py-3">ชื่อ - นามสกุล</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">รหัสผ่าน</th>
                <th className="px-4 py-3">Email (สำหรับแจ้งเตือน)</th>
                <th className="px-4 py-3 text-center">สิทธิ์ในแผนงาน</th>
                <th className="px-4 py-3 text-center w-36">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {allUsers.map((user) => {
                const roleBadge = getRoleLabel(user.role);
                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-center font-bold text-slate-900 font-mono">
                      {user.employeeId}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {user.name}
                      {user.id === currentUser?.id && (
                        <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-normal">
                          (คุณ)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      ••••••••
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {user.email || '-'}
                        </span>
                        <button
                          onClick={() => onTestLineNotif(user)}
                          title="ทดสอบส่งอีเมลแจ้งเตือนไปยังผู้ใช้นี้"
                          className="p-1 hover:bg-blue-100 text-blue-600 rounded transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="แก้ไขสิทธิ์และรหัสผ่าน"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (user.role === 'admin' && allUsers.filter(u => u.role === 'admin').length <= 1) {
                              alert('ไม่สามารถลบ Admin คนสุดท้ายของระบบได้');
                              return;
                            }
                            if (confirm(`คุณต้องการลบผู้ใช้งาน ${user.name} (${user.employeeId}) หรือไม่?`)) {
                              onDeleteUser(user.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="ลบผู้ใช้งาน"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Integration Guide Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200 space-y-3">
        <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          ระบบการแจ้งเตือนทาง Email สำหรับทุกขั้นตอนของโครงการ
        </h4>
        <div className="text-xs text-blue-900 leading-relaxed space-y-1.5">
          <p>
            1. ระบบจะส่งอีเมลแจ้งเตือนอัตโนมัติไปยังที่อยู่ Email ของผู้รับผิดชอบในทุกขั้นตอนงาน เช่น:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>ส่งงานเพื่อรับการตรวจ:</strong> ส่งอีเมลแจ้งเตือนทันทีไปยัง Email ของผู้ตรวจงาน (Inspector) พร้อมชื่อไฟล์หลักฐาน</li>
            <li><strong>ผลการตรวจรับงาน:</strong> ส่งอีเมลแจ้งผลการประเมิน (ผ่าน / ไม่ผ่าน พร้อมข้อเสนอแนะ) ไปยัง Email ของผู้ส่งงาน</li>
            <li><strong>การขอแก้ไขแผนงาน:</strong> ส่งอีเมลแจ้งเตือนไปยังผู้ตรวจงาน และส่งผลการอนุมัติกลับไปยังผู้วางแผนโครงการ</li>
          </ul>
        </div>
      </div>

      {/* Modal: Add/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-800 border-b pb-3 mb-4">
              {editingUser ? `แก้ไขผู้ใช้งาน: ${editingUser.name}` : '+ เพิ่มผู้ใช้งานใหม่ในระบบ'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รหัสพนักงาน *</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="เช่น EMP005"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ - นามสกุล *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น นายเอกชัย ใจดี"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="สำหรับล็อกอิน"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">รหัสผ่าน {editingUser && '(เว้นว่างถ้าไม่เปลี่ยน)'}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="รหัสผ่าน"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                    required={!editingUser}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email (สำหรับรับการแจ้งเตือนงาน) *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="เช่น somchai@company.com"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">สิทธิ์ในแผนงาน (Role) *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white font-semibold"
                >
                  <option value="worker">ผู้ปฏิบัติงาน/ส่งงาน (Worker) - เข้าหน้า 1, 3</option>
                  <option value="planner">ผู้วางแผนโครงการ (Planner) - เข้าหน้า 1, 2</option>
                  <option value="inspector">ผู้ตรวจงาน (Inspector) - เข้าหน้า 1, 2, 4</option>
                  <option value="admin">ผู้ดูแลระบบ (Admin) - เข้าได้ทุกหน้า 1, 2, 3, 4, 5</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20"
                >
                  บันทึกข้อมูลผู้ใช้
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

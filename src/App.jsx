import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoginModal from './components/LoginModal';
import LineNotificationToast from './components/LineNotificationToast';
import NotificationModal from './components/NotificationModal';

import Page1Dashboard from './pages/Page1Dashboard';
import Page2Planning from './pages/Page2Planning';
import Page3Operation from './pages/Page3Operation';
import Page4Inspection from './pages/Page4Inspection';
import Page5UserManagement from './pages/Page5UserManagement';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('proj-001');

  const [activeToast, setActiveToast] = useState(null);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data
  const fetchData = async () => {
    try {
      const [usersRes, projsRes, statsRes, crRes, notifRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/projects'),
        fetch('/api/stats'),
        fetch('/api/change-requests'),
        fetch('/api/notifications')
      ]);

      if (usersRes.ok) {
        const uList = await usersRes.json();
        setAllUsers(uList);
        // Set default logged in user if none yet
        if (!currentUser && uList.length > 0) {
          const savedUser = localStorage.getItem('ppa_user');
          if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
          } else {
            setCurrentUser(uList[0]); // default to admin
          }
        }
      }

      if (projsRes.ok) {
        const pList = await projsRes.json();
        setProjects(pList);
        if (!activeProjectId && pList.length > 0) {
          setActiveProjectId(pList[0].id);
        }
      }

      if (statsRes.ok) setStats(await statsRes.json());
      if (crRes.ok) setChangeRequests(await crRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('ppa_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ppa_user');
  };

  const handleSwitchUser = (userId) => {
    const u = allUsers.find(item => item.id === userId || item.employeeId === userId);
    if (u) {
      setCurrentUser(u);
      localStorage.setItem('ppa_user', JSON.stringify(u));
    }
  };

  const triggerToastNotification = (notif) => {
    setActiveToast(notif);
    setNotifications(prev => [notif, ...prev]);
  };

  // API Action Handlers
  const handleCreateProject = async (projectData) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (res.ok) {
        await fetchData();
        setActivePage(1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitRevision = async (revisionData) => {
    try {
      const res = await fetch(`/api/projects/${revisionData.projectId}/revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(revisionData)
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        await fetchData();
        if (data.changeRequest) {
          triggerToastNotification({
            id: 'toast-' + Date.now(),
            recipientName: 'ผู้ตรวจงาน',
            recipientLineId: '@inspector',
            projectName: data.changeRequest.projectName,
            stepName: 'ขออนุมัติแก้ไขแผนงาน',
            message: `🔔 [คำขออนุมัติแก้ไขแผนงาน]\nโครงการ: ${data.changeRequest.projectName}\nเหตุผล: ${data.changeRequest.reason}`,
            timestamp: new Date().toLocaleTimeString('th-TH')
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveRevision = async (requestId) => {
    try {
      const res = await fetch(`/api/change-requests/${requestId}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchData();
        alert('อนุมัติการแก้ไขแผนงานเรียบร้อยแล้ว แผนงานใหม่มีผลบังคับใช้ทันที');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRevision = async (requestId, reason) => {
    try {
      const res = await fetch(`/api/change-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        await fetchData();
        alert('ปฏิเสธคำขอแก้ไขแผนงานเรียบร้อยแล้ว');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitTask = async (projectId, stepId, formData) => {
    const res = await fetch(`/api/tasks/${projectId}/${stepId}/submit`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to submit task');
    }
    const data = await res.json();
    await fetchData();

    // Trigger local toast notification simulation
    const project = projects.find(p => p.id === projectId);
    const inspector = allUsers.find(u => u.id === project?.inspectorId);
    triggerToastNotification({
      id: 'toast-' + Date.now(),
      recipientName: inspector?.name || 'ดนัย ผู้ตรวจงาน',
      recipientEmail: inspector?.email || 'inspector@company.com',
      projectName: project?.name || 'โครงการ',
      stepName: data.step?.name || 'ขั้นตอนที่ส่ง',
      message: `🔔 [แจ้งเตือนส่งงานใหม่ทาง Email]\n📌 โครงการ: ${project?.name}\n📋 ขั้นตอน: ${data.step?.name}\n👤 ผู้ส่งงาน: ${currentUser?.name}\n📎 เอกสารแนบ: ${data.step?.submittedFileOriginalName || 'evident'}\n🔗 กรุณาเข้าสู่ระบบเพื่อทำการตรวจรับงาน`,
      timestamp: new Date().toLocaleTimeString('th-TH')
    });
  };

  const handleUpdateStepProgress = async (projectId, stepId, updateData) => {
    try {
      const res = await fetch(`/api/tasks/${projectId}/${stepId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmInspection = async (projectId, stepId, confirmData) => {
    const res = await fetch(`/api/inspections/${projectId}/${stepId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(confirmData)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to confirm inspection');
    }
    const data = await res.json();
    await fetchData();

    const project = projects.find(p => p.id === projectId);
    const worker = allUsers.find(u => u.id === data.step?.assignedWorkerId);
    triggerToastNotification({
      id: 'toast-' + Date.now(),
      recipientName: worker?.name || 'ผู้ส่งงาน',
      recipientEmail: worker?.email || 'worker@company.com',
      projectName: project?.name || 'โครงการ',
      stepName: data.step?.name || 'ขั้นตอน',
      message: `📋 [ผลการตรวจงานโครงการ (แจ้งเตือนทาง Email): ${project?.name}]\n📌 ขั้นตอน: ${data.step?.name}\n📊 ผลการตรวจ: ${confirmData.result === 'pass' ? '✅ ผ่าน' : '❌ ไม่ผ่าน'}\n💬 คำแนะนำ: ${confirmData.feedback || '-'}\nผู้ตรวจ: ${currentUser?.name}`,
      timestamp: new Date().toLocaleTimeString('th-TH')
    });
  };

  const handleSaveUser = async (userData) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestLineNotif = (targetUser) => {
    triggerToastNotification({
      id: 'toast-' + Date.now(),
      recipientName: targetUser.name,
      recipientEmail: targetUser.email || 'user@company.com',
      projectName: 'ทดสอบการส่งอีเมล',
      stepName: 'ทดสอบระบบ Email',
      message: `🔔 [ทดสอบการแจ้งเตือนทาง Email สำเร็จ]\nสวัสดีคุณ ${targetUser.name} (${targetUser.employeeId})\nEmail: ${targetUser.email || '-'}\nระบบการแจ้งเตือนพร้อมใช้งานสำหรับการติดตามโครงการ`,
      timestamp: new Date().toLocaleTimeString('th-TH')
    });
  };

  // Badges count
  const pendingReviewsCount = projects.reduce((acc, p) => {
    return acc + p.steps.filter(s => s.status === 'รอตรวจงาน').length;
  }, 0);

  const pendingRevisionsCount = changeRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans antialiased text-slate-800 overflow-x-hidden max-w-full">
      {/* Login Modal if not authenticated */}
      {!currentUser && (
        <LoginModal onLogin={handleLogin} allUsers={allUsers} />
      )}

      {/* Left Sidebar Menu */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
        pendingReviewsCount={pendingReviewsCount}
        pendingRevisionsCount={pendingRevisionsCount}
        openNotifModal={() => setIsNotifModalOpen(true)}
      />

      {/* Main Content Area (Offset for fixed 288px (72) sidebar) */}
      <main className="flex-1 ml-72 p-4 md:p-6 min-h-screen min-w-0 overflow-x-hidden max-w-[calc(100vw-18rem)]">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-500">กำลังโหลดข้อมูลระบบวางแผนงาน...</p>
            </div>
          </div>
        ) : (
          <>
            {activePage === 1 && (
              <Page1Dashboard
                projects={projects}
                allUsers={allUsers}
                stats={stats}
                activeProjectId={activeProjectId}
                setActiveProjectId={setActiveProjectId}
              />
            )}

            {activePage === 2 && (
              <Page2Planning
                projects={projects}
                allUsers={allUsers}
                currentUser={currentUser}
                onCreateProject={handleCreateProject}
                onSubmitRevision={handleSubmitRevision}
                changeRequests={changeRequests}
                onApproveRevision={handleApproveRevision}
                onRejectRevision={handleRejectRevision}
              />
            )}

            {activePage === 3 && (
              <Page3Operation
                projects={projects}
                allUsers={allUsers}
                currentUser={currentUser}
                onSubmitTask={handleSubmitTask}
                onUpdateStepProgress={handleUpdateStepProgress}
              />
            )}

            {activePage === 4 && (
              <Page4Inspection
                projects={projects}
                allUsers={allUsers}
                currentUser={currentUser}
                onConfirmInspection={handleConfirmInspection}
                onSwitchUser={handleSwitchUser}
              />
            )}

            {activePage === 5 && (
              <Page5UserManagement
                allUsers={allUsers}
                currentUser={currentUser}
                onSaveUser={handleSaveUser}
                onDeleteUser={handleDeleteUser}
                onTestLineNotif={handleTestLineNotif}
                onSwitchUser={handleSwitchUser}
              />
            )}
          </>
        )}
      </main>

      {/* Active LINE Notification Toast */}
      <LineNotificationToast
        notification={activeToast}
        onClose={() => setActiveToast(null)}
      />

      {/* Full Notifications History Modal */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={notifications}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { 
  CalendarPlus, 
  FileEdit, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  ShieldCheck,
  Send,
  User,
  UserCheck
} from 'lucide-react';

export default function Page2Planning({ 
  projects, 
  allUsers, 
  currentUser, 
  onCreateProject, 
  onSubmitRevision,
  changeRequests,
  onApproveRevision,
  onRejectRevision 
}) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'revisions' | 'edit'
  
  // New Project Form State
  const [newProject, setNewProject] = useState({
    name: '',
    code: '',
    description: '',
    targetEndDate: '',
    ownerId: currentUser?.id || allUsers.find(u => u.role === 'planner')?.id || '',
    inspectorId: allUsers.find(u => u.role === 'inspector')?.id || '',
    steps: [
      { stepNumber: 1, name: 'ขั้นตอนที่ 1: เตรียมการ', description: 'สำรวจและวางแผนงานเบื้องต้น', evident: 'DOC-01', planStart: '2026-02-01', planEnd: '2026-02-05', assignedWorkerId: 'EMP003' },
      { stepNumber: 2, name: 'ขั้นตอนที่ 2: ดำเนินการติดตั้ง', description: 'ติดตั้งอุปกรณ์ตามมาตรฐาน', evident: 'DOC-02', planStart: '2026-02-06', planEnd: '2026-02-15', assignedWorkerId: 'EMP003' }
    ]
  });

  // Edit / Revision Form State
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [revisionReason, setRevisionReason] = useState('');
  const [editableSteps, setEditableSteps] = useState(projects[0]?.steps ? JSON.parse(JSON.stringify(projects[0].steps)) : []);
  const [rejectReasonInput, setRejectReasonInput] = useState({});

  const handleSelectProjectToEdit = (projId) => {
    setSelectedProjectId(projId);
    const p = projects.find(item => item.id === projId);
    if (p) {
      setEditableSteps(JSON.parse(JSON.stringify(p.steps)));
    }
  };

  const handleAddStepToNew = () => {
    const nextNum = newProject.steps.length + 1;
    setNewProject({
      ...newProject,
      steps: [
        ...newProject.steps,
        {
          stepNumber: nextNum,
          name: `ขั้นตอนที่ ${nextNum}`,
          description: '',
          evident: 'DOC-' + nextNum,
          planStart: '',
          planEnd: '',
          assignedWorkerId: allUsers.find(u => u.role === 'worker')?.id || 'EMP003'
        }
      ]
    });
  };

  const handleRemoveStepFromNew = (idx) => {
    if (newProject.steps.length <= 1) return;
    const filtered = newProject.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNumber: i + 1 }));
    setNewProject({ ...newProject, steps: filtered });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newProject.name) {
      alert('กรุณากรอกชื่อโครงการ');
      return;
    }
    onCreateProject({
      ...newProject,
      ownerId: newProject.ownerId || currentUser?.id,
      creatorId: currentUser?.id
    });
    alert('สร้างโครงการใหม่เรียบร้อยแล้ว!');
  };

  const handleAddStepToEdit = () => {
    const nextNum = editableSteps.length + 1;
    setEditableSteps([
      ...editableSteps,
      {
        id: 'step-' + Date.now(),
        stepNumber: nextNum,
        name: `ขั้นตอนที่ ${nextNum}`,
        description: '',
        evident: 'DOC-' + nextNum,
        status: 'รอขั้นตอนก่อนหน้า',
        planStart: '',
        planEnd: '',
        assignedWorkerId: allUsers.find(u => u.role === 'worker')?.id || 'EMP003'
      }
    ]);
  };

  const handleSubmitRevision = () => {
    if (!revisionReason.trim()) {
      alert('กรุณาระบุเหตุผลในการขอแก้ไขแผนงาน');
      return;
    }
    onSubmitRevision({
      projectId: selectedProjectId,
      proposedSteps: editableSteps,
      reason: revisionReason,
      requestedByUserId: currentUser?.id
    });
    setRevisionReason('');
  };

  const inspectors = allUsers.filter(u => u.role === 'inspector');
  const workers = allUsers.filter(u => u.role === 'worker');

  const activeProject = projects.find(p => p.id === selectedProjectId);
  const pendingRequestsForActiveProject = changeRequests.filter(r => r.projectId === selectedProjectId && r.status === 'pending');

  const isInspector = currentUser?.role === 'inspector' || currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarPlus className="w-6 h-6 text-blue-600" />
            หน้าวางแผนโครงการ (เริ่มต้นโครงการ & อนุมัติการแก้ไขแผน)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            กำหนดขั้นตอนงาน หรือขอแก้ไขแผนงานระหว่างดำเนินโครงการ (ต้องผ่านการอนุมัติจากผู้ตรวจงาน)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'create' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + เริ่มต้นโครงการใหม่
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'edit' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✏️ แก้ไข/ปรับปรุงแผนงาน
          </button>
          <button
            onClick={() => setActiveTab('revisions')}
            className={`px-4 py-2 rounded-lg transition relative ${
              activeTab === 'revisions' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔔 คำขอแก้ไขที่รออนุมัติ
            {changeRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                {changeRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: Create New Project */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
            <span>1. รายละเอียดโครงการเริ่มต้น</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อโครงการ *</label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="เช่น โครงการติดตั้งระบบกล้อง AI"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">รหัสโครงการ</label>
              <input
                type="text"
                value={newProject.code}
                onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
                placeholder="เช่น PRJ-2026-004 (เว้นว่างเพื่อสร้างอัตโนมัติ)"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                เจ้าของโครงการ (Project Owner) *
              </label>
              <select
                value={newProject.ownerId}
                onChange={(e) => setNewProject({ ...newProject, ownerId: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                required
              >
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                ผู้ตรวจงานโครงการ (Inspector) *
              </label>
              <select
                value={newProject.inspectorId}
                onChange={(e) => setNewProject({ ...newProject, inspectorId: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                required
              >
                {inspectors.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียดโครงการ</label>
            <textarea
              rows={2}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="วัตถุประสงค์และขอบเขตของโครงการ..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Steps List */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800">2. ขั้นตอนการวางแผนงาน (Step by Step)</h4>
                <p className="text-[11px] text-slate-500">กำหนดลำดับขั้นตอน, รายละเอียดงาน, วันเริ่ม-สิ้นสุด และรหัส evident</p>
              </div>
              <button
                type="button"
                onClick={handleAddStepToNew}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition"
              >
                <Plus className="w-4 h-4" />
                เพิ่มขั้นตอน
              </button>
            </div>

            <div className="space-y-3">
              {newProject.steps.map((step, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-1 text-center font-bold text-slate-600 text-xs">
                    #{step.stepNumber}
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">ชื่อขั้นตอน</label>
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => {
                        const s = [...newProject.steps];
                        s[idx].name = e.target.value;
                        setNewProject({ ...newProject, steps: s });
                      }}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">รายละเอียดแต่ละขั้นตอน</label>
                    <input
                      type="text"
                      value={step.description}
                      onChange={(e) => {
                        const s = [...newProject.steps];
                        s[idx].description = e.target.value;
                        setNewProject({ ...newProject, steps: s });
                      }}
                      placeholder="เช่น สำรวจหน้างานและส่งรายงาน"
                      className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">evident</label>
                    <input
                      type="text"
                      value={step.evident}
                      onChange={(e) => {
                        const s = [...newProject.steps];
                        s[idx].evident = e.target.value;
                        setNewProject({ ...newProject, steps: s });
                      }}
                      placeholder="A, B, C"
                      className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white text-center font-bold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">วันเริ่ม (Plan)</label>
                    <input
                      type="date"
                      value={step.planStart}
                      onChange={(e) => {
                        const s = [...newProject.steps];
                        s[idx].planStart = e.target.value;
                        setNewProject({ ...newProject, steps: s });
                      }}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">วันสิ้นสุด (Plan)</label>
                      <input
                        type="date"
                        value={step.planEnd}
                        onChange={(e) => {
                          const s = [...newProject.steps];
                          s[idx].planEnd = e.target.value;
                          setNewProject({ ...newProject, steps: s });
                        }}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStepFromNew(idx)}
                      disabled={newProject.steps.length <= 1}
                      className="mt-4 p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              บันทึกเริ่มต้นโครงการ (Create Project)
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Edit & Revision Request (Workflow required by user) */}
      {activeTab === 'edit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="font-bold">กติกาการแก้ไขแผนงานระหว่างดำเนินการ:</strong><br />
              หากโครงการอยู่ระหว่างการดำเนินการ ข้อมูลที่มีการแก้ไขงานจะต้องถูกส่งไปขออนุมัติ และต้องได้รับความยินยอมจาก <strong>ผู้ตรวจงาน (Inspector)</strong> เสียก่อน แผนงานจึงจะเปลี่ยนไปเป็น <strong>"แผนงานใหม่"</strong> ในระบบ
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 shrink-0">เลือกโครงการ:</label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleSelectProjectToEdit(e.target.value)}
                className="text-xs p-2 border border-slate-300 rounded-lg bg-white font-semibold"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code}: {p.name} (ฉบับที่ {p.currentPlanRevision || 1})
                  </option>
                ))}
              </select>
            </div>

            {activeProject && (
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 border border-blue-200 rounded-lg text-blue-800">
                  <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-slate-500 font-medium">เจ้าของโครงการ:</span>
                  <strong className="font-bold text-blue-950">
                    {allUsers.find(u => u.id === (activeProject.ownerId || activeProject.creatorId))?.name || 'สมศักดิ์ วางแผนงาน'}
                  </strong>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-800">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-slate-500 font-medium">ผู้ตรวจงาน:</span>
                  <strong className="font-bold text-emerald-950">
                    {allUsers.find(u => u.id === activeProject.inspectorId)?.name || 'ดนัย ผู้ตรวจงาน'}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Pending notification for this project */}
          {pendingRequestsForActiveProject.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                มีคำขอแก้ไขแผนงานฉบับนี้กำลังรอการพิจารณาจากผู้ตรวจงาน ({pendingRequestsForActiveProject.length} รายการ)
              </span>
              <button
                onClick={() => setActiveTab('revisions')}
                className="underline font-bold text-blue-700 hover:text-blue-900"
              >
                ดูรายละเอียดคำขอ
              </button>
            </div>
          )}

          {/* Editable Steps Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">
                ปรับเปลี่ยนรายละเอียดและกรอบเวลาแต่ละขั้นตอน (ฉบับเสนอแก้ไข)
              </h4>
              <button
                type="button"
                onClick={handleAddStepToEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 hover:bg-blue-100"
              >
                <Plus className="w-4 h-4" /> เพิ่มขั้นตอน
              </button>
            </div>

            {editableSteps.map((step, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                <div className="md:col-span-1 text-center font-bold text-slate-700 text-xs">
                  Step {step.stepNumber}
                </div>
                <div className="md:col-span-4">
                  <input
                    type="text"
                    value={step.name}
                    onChange={(e) => {
                      const s = [...editableSteps];
                      s[idx].name = e.target.value;
                      setEditableSteps(s);
                    }}
                    placeholder="ชื่อขั้นตอน"
                    className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white font-medium"
                  />
                </div>
                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={step.description}
                    onChange={(e) => {
                      const s = [...editableSteps];
                      s[idx].description = e.target.value;
                      setEditableSteps(s);
                    }}
                    placeholder="รายละเอียดงาน"
                    className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="date"
                    value={step.planStart || ''}
                    onChange={(e) => {
                      const s = [...editableSteps];
                      s[idx].planStart = e.target.value;
                      setEditableSteps(s);
                    }}
                    className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="date"
                    value={step.planEnd || ''}
                    onChange={(e) => {
                      const s = [...editableSteps];
                      s[idx].planEnd = e.target.value;
                      setEditableSteps(s);
                    }}
                    className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Reason for Change */}
          <div className="pt-4 border-t">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              เหตุผลและความจำเป็นในการขอแก้ไขแผนงาน * (จะส่งแจ้งเตือนไปที่ LINE ของผู้ตรวจงาน)
            </label>
            <textarea
              rows={3}
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="ระบุเหตุผล เช่น ได้รับอนุมัติปรับสเปกอุปกรณ์ทำให้ระยะเวลาการจัดส่งเลื่อนออกไป 3 วัน..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleSubmitRevision}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              ส่งคำขอแก้ไขแผนงานไปยังผู้ตรวจงาน
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Change Requests Review & Approval */}
      {activeTab === 'revisions' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b pb-3 flex items-center justify-between">
            <span>รายการคำขอแก้ไขแผนงานโครงการ</span>
            <span className="text-xs font-normal text-slate-500">
              {isInspector ? 'คุณมีสิทธิ์อนุมัติ/ไม่อนุมัติแผนงานในฐานะผู้ตรวจงาน' : 'ผู้ตรวจงานเท่านั้นที่มีสิทธิ์กดอนุมัติ'}
            </span>
          </h3>

          {changeRequests.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              ยังไม่มีคำขอแก้ไขแผนงานในระบบ
            </div>
          ) : (
            <div className="space-y-4">
              {changeRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{req.projectName}</div>
                      <div className="text-[11px] text-slate-500">
                        ผู้ขอแก้ไข: <span className="font-semibold text-slate-700">{req.requestedBy}</span> | ยื่นเมื่อ: {req.requestedAt}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold self-start ${
                      req.status === 'pending' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : req.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {req.status === 'pending' ? '⏳ รอผู้ตรวจงานอนุมัติ' : req.status === 'approved' ? '✓ ได้รับอนุมัติแล้ว' : '✗ ไม่อนุมัติ'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-800 mb-1">เหตุผลการขอแก้ไข:</div>
                    <p className="text-slate-600">{req.reason}</p>
                  </div>

                  {/* Proposed Changes Preview */}
                  <div className="text-xs">
                    <div className="font-semibold text-slate-700 mb-1">ขั้นตอนงานฉบับใหม่ที่เสนอ ({req.proposedSteps?.length} ขั้นตอน):</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px] border border-slate-200 bg-white rounded-lg">
                        <thead className="bg-slate-100 border-b">
                          <tr>
                            <th className="p-1.5 text-left">Step</th>
                            <th className="p-1.5 text-left">ชื่อขั้นตอน</th>
                            <th className="p-1.5 text-left">รายละเอียด</th>
                            <th className="p-1.5 text-center">Plan เริ่มต้น</th>
                            <th className="p-1.5 text-center">Plan สิ้นสุด</th>
                          </tr>
                        </thead>
                        <tbody>
                          {req.proposedSteps?.map((st, i) => (
                            <tr key={i} className="border-b">
                              <td className="p-1.5 font-bold">{st.stepNumber}</td>
                              <td className="p-1.5 font-medium">{st.name}</td>
                              <td className="p-1.5 text-slate-500">{st.description || '-'}</td>
                              <td className="p-1.5 text-center">{st.planStart}</td>
                              <td className="p-1.5 text-center">{st.planEnd}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Inspector Action Buttons */}
                  {req.status === 'pending' && (
                    <div className="pt-2 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                      {isInspector ? (
                        <>
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="เหตุผล (กรณีไม่อนุมัติ)..."
                              value={rejectReasonInput[req.id] || ''}
                              onChange={(e) => setRejectReasonInput({ ...rejectReasonInput, [req.id]: e.target.value })}
                              className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => onRejectRevision(req.id, rejectReasonInput[req.id])}
                            className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" /> ไม่อนุมัติ
                          </button>
                          <button
                            type="button"
                            onClick={() => onApproveRevision(req.id)}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" /> ยอมรับเป็นแผนงานใหม่
                          </button>
                        </>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic">
                          * ผู้ตรวจงาน ({inspectors[0]?.name || 'Inspector'}) เป็นผู้มีสิทธิ์กดอนุมัติการแก้ไขแผนงานนี้
                        </div>
                      )}
                    </div>
                  )}

                  {req.status === 'approved' && (
                    <div className="text-[11px] text-emerald-700 font-medium bg-emerald-50 p-2 rounded border border-emerald-200">
                      ✓ ได้รับการอนุมัติและปรับใช้เป็นแผนงานหลักเรียบร้อยแล้ว เมื่อ: {req.approvedAt}
                    </div>
                  )}

                  {req.status === 'rejected' && (
                    <div className="text-[11px] text-rose-700 font-medium bg-rose-50 p-2 rounded border border-rose-200">
                      ✗ ไม่อนุมัติ: {req.rejectReason || '-'} (เมื่อ {req.rejectedAt})
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

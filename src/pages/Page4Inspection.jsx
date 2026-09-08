import React, { useState } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Download, 
  Clock, 
  ShieldAlert, 
  User, 
  Send,
  AlertTriangle,
  FolderKanban
} from 'lucide-react';

export default function Page4Inspection({ 
  projects, 
  allUsers, 
  currentUser, 
  onConfirmInspection,
  onSwitchUser 
}) {
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const isInspector = currentUser?.role === 'inspector' || currentUser?.role === 'admin';

  // Extract all pending and completed steps needing or having review
  const inspectionItems = [];
  projects.forEach(p => {
    if (selectedProjectId === 'all' || p.id === selectedProjectId) {
      // If inspector is not admin, only show projects assigned to this inspector
      if (currentUser?.role === 'admin' || p.inspectorId === currentUser?.id) {
        p.steps.forEach(st => {
          if (st.status === 'รอตรวจงาน' || st.reviewResult) {
            const worker = allUsers.find(u => u.id === st.assignedWorkerId);
            inspectionItems.push({
              projectId: p.id,
              projectName: p.name,
              projectCode: p.code,
              step: st,
              worker
            });
          }
        });
      }
    }
  });

  const handleDecision = async (projectId, stepId, result) => {
    const feedback = feedbackInputs[stepId] || '';
    if (result === 'fail' && !feedback.trim()) {
      alert('หากผลการตรวจ "ไม่ผ่าน" กรุณาระบุคำแนะนำในการแก้ไข เพื่อให้ผู้ส่งงานทราบแนวทางปรับปรุง');
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirmInspection(projectId, stepId, {
        result,
        feedback,
        inspectorUserId: currentUser?.id
      });
      alert(`บันทึกผลการตรวจงาน (${result === 'pass' ? 'ผ่าน' : 'ไม่ผ่าน'}) เรียบร้อยแล้ว! ระบบได้ส่งข้อความแจ้งเตือนไปที่ LINE ของผู้ส่งงานแล้ว`);
      setFeedbackInputs({ ...feedbackInputs, [stepId]: '' });
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // If user does not have inspection role
  if (!isInspector) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center max-w-xl mx-auto shadow-sm my-10 space-y-4">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">ไม่มีสิทธิ์ในการตรวจงาน</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          หน้านี้จำกัดเฉพาะผู้ใช้งานที่ได้รับอนุญาตให้เป็น <strong>"ผู้ตรวจงาน (Inspector)"</strong> หรือ <strong>Admin</strong> เท่านั้น<br />
          User ปัจจุบันของท่าน ({currentUser?.name}) มีสิทธิ์: <strong>{currentUser?.role}</strong>
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              const insp = allUsers.find(u => u.role === 'inspector');
              if (insp) onSwitchUser(insp.id);
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-600/20"
          >
            สลับเป็นผู้ใช้งาน "ดนัย ผู้ตรวจงาน (Inspector)" ทันที
          </button>
        </div>
      </div>
    );
  }

  const pendingItems = inspectionItems.filter(i => i.step.status === 'รอตรวจงาน');
  const reviewedItems = inspectionItems.filter(i => i.step.status !== 'รอตรวจงาน');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            หน้าตรวจงานและคอนเฟิร์มผล (Inspection & Approval)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            พิจารณางานที่ส่งมอบ คอนเฟิร์มผล ผ่าน / ไม่ผ่าน (พร้อมคำแนะนำ) และแจ้งเตือนผลตรวจไปยัง Email ผู้ส่งงาน
          </p>
        </div>

        {/* Project Filter */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">กรองตามโครงการ:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-xs p-2 border border-slate-300 rounded-xl bg-slate-50 font-semibold focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทุกโครงการที่รับผิดชอบ</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.code}: {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pending Reviews Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            รายการที่รอตรวจรับงาน ({pendingItems.length} รายการ)
          </h3>
          <span className="text-xs text-slate-400">
            เฉพาะโครงการที่ท่านเป็นผู้ตรวจงาน
          </span>
        </div>

        {pendingItems.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            🎉 ไม่มีงานค้างรอการตรวจในขณะนี้ ทุกรายการได้รับการตรวจครบถ้วนแล้ว
          </div>
        ) : (
          <div className="space-y-5">
            {pendingItems.map((item) => {
              const st = item.step;
              const feedbackValue = feedbackInputs[st.id] || '';

              return (
                <div key={st.id} className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-4 shadow-sm">
                  {/* Top Details */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full mr-2">
                        {item.projectCode}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{item.projectName}</span>
                      <div className="text-xs font-bold text-slate-700 mt-1">
                        {st.name} ({st.description})
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 self-start animate-pulse">
                      ⏳ รอการตรวจรับงาน
                    </span>
                  </div>

                  {/* Submitter & Evidence Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="text-slate-500 font-semibold flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        ข้อมูลผู้ส่งงาน:
                      </div>
                      <div className="font-bold text-slate-800 pl-5">
                        {item.worker?.name || 'วิชัย ผู้ส่งงาน/ปฏิบัติงาน'} ({item.worker?.employeeId})
                      </div>
                      <div className="text-[11px] text-slate-600 pl-5">
                        Email: <span className="font-mono text-blue-700 font-semibold">{item.worker?.email || 'worker@company.com'}</span> | ส่งเมื่อ: {st.submittedAt || '-'}
                      </div>
                      {st.submissionNotes && (
                        <div className="mt-2 p-2 bg-slate-50 rounded text-slate-700 text-[11px] border">
                          <strong>บันทึกจากผู้ส่งงาน:</strong> {st.submissionNotes}
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <div className="text-slate-500 font-semibold flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          เอกสารหรือไฟล์หลักฐานส่งมอบ (evident: {st.evident}):
                        </div>
                        <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 font-medium">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="truncate flex-1 text-xs">{st.submittedFileOriginalName || st.submittedFile || 'เอกสารหลักฐาน.pdf'}</span>
                          <a
                            href={`/uploads/${st.submittedFile}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] flex items-center gap-1 font-semibold shrink-0"
                          >
                            <Download className="w-3 h-3" /> ดาวน์โหลด
                          </a>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400">
                        * กรุณาเปิดตรวจสอบความถูกต้องของเอกสารก่อนทำการตัดสินผล
                      </div>
                    </div>
                  </div>

                  {/* Feedback Notes Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      คำแนะนำในการแก้ไข (จำเป็นต้องระบุหากเลือก "ไม่ผ่าน") *
                    </label>
                    <textarea
                      rows={2}
                      value={feedbackValue}
                      onChange={(e) => setFeedbackInputs({ ...feedbackInputs, [st.id]: e.target.value })}
                      placeholder="ระบุสิ่งที่ต้องแก้ไขเพิ่มเติม เช่น ปรับปรุงแบบจุดต่อสายสัญญาณให้ชัดเจน หรือพิมพ์เอกสารรายงานฉบับสมบูรณ์..."
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Actions Confirmation Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-amber-200">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Send className="w-3 h-3 text-emerald-600" />
                      ผลการตรวจจะส่งข้อความแจ้งเตือนไปที่ LINE ของ {item.worker?.name} ทันที
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleDecision(item.projectId, st.id, 'fail')}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 transition"
                      >
                        <XCircle className="w-4 h-4" />
                        ไม่ผ่าน (ส่งกลับแก้ไข)
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleDecision(item.projectId, st.id, 'pass')}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        คอนเฟิร์มผ่าน (Approve)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reviewed History Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ประวัติการตรวจรับงานที่ผ่านมา ({reviewedItems.length} รายการ)
        </h3>

        <div className="space-y-3">
          {reviewedItems.map((item) => {
            const st = item.step;
            const isPass = st.reviewResult === 'pass';

            return (
              <div key={st.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{st.name}</span>
                    <span className="text-slate-500 font-normal">({item.projectName})</span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">
                    ผู้ตรวจ: {currentUser?.name} | ตรวจเมื่อ: {st.reviewedAt || '-'}
                  </div>
                  {st.feedback && (
                    <div className="mt-1 text-[11px] text-slate-700 bg-white px-2 py-1 rounded border inline-block">
                      ข้อเสนอแนะ: {st.feedback}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isPass 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}>
                    {isPass ? '✓ ผ่านการตรวจรับ' : '✗ ไม่ผ่าน'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

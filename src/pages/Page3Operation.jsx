import React, { useState } from 'react';
import { 
  Send, 
  UploadCloud, 
  FileCheck, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FolderKanban,
  FileText,
  User,
  MessageSquare,
  Mail
} from 'lucide-react';

export default function Page3Operation({ 
  projects, 
  allUsers, 
  currentUser, 
  onSubmitTask,
  onUpdateStepProgress 
}) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [activeStepId, setActiveStepId] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const inspector = allUsers.find(u => u.id === currentProject?.inspectorId);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartWork = (stepId) => {
    const today = new Date().toISOString().split('T')[0];
    onUpdateStepProgress(currentProject.id, stepId, {
      actualStart: today,
      status: 'กำลังดำเนินการ'
    });
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!activeStepId) {
      alert('กรุณาเลือกขั้นตอนงานที่ต้องการส่ง');
      return;
    }
    if (!selectedFile) {
      alert('กรุณาแนบเอกสารหรือไฟล์หลักฐาน (evident) เพื่อส่งงาน');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('evidentFile', selectedFile);
      formData.append('notes', submissionNotes);
      formData.append('workerId', currentUser?.id);

      await onSubmitTask(currentProject.id, activeStepId, formData);
      alert('ส่งงานเรียบร้อยแล้ว! ระบบได้ส่งข้อความแจ้งเตือนไปที่ Email ของผู้ตรวจงานแล้ว');
      setSelectedFile(null);
      setSubmissionNotes('');
      setActiveStepId('');
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการส่งงาน: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Send className="w-6 h-6 text-blue-600" />
            หน้าดำเนินการและส่งมอบงาน (Operation & Submission)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            อัปเดตความคืบหน้า แนบเอกสารหลักฐาน และส่งงานเพื่อแจ้งเตือนไปยัง Email ผู้ตรวจงาน
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">โครงการ:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-xs p-2 border border-slate-300 rounded-xl bg-slate-50 font-semibold focus:ring-2 focus:ring-blue-500"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.code}: {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inspector Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">
              ผู้ตรวจงานประจำโครงการนี้: <span className="text-blue-800">{inspector?.name || 'ดนัย ผู้ตรวจงาน'}</span>
            </div>
            <div className="text-[11px] text-slate-600">
              Email: <span className="font-mono font-semibold text-blue-900">{inspector?.email || 'inspector@company.com'}</span> | ระบบจะส่งอีเมลแจ้งเตือนทันทีเมื่อท่านกดส่งงาน
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Steps List & Status */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <span>ขั้นตอนงานในโครงการ ({currentProject?.steps?.length} ขั้นตอน)</span>
            <span className="text-[11px] text-slate-500">คลิกที่ขั้นตอนเพื่อเลือกส่งงาน</span>
          </h3>

          <div className="space-y-3">
            {currentProject?.steps?.map((step) => {
              const isSelected = activeStepId === step.id;
              const isCompleted = step.status === 'เสร็จสิ้น';
              const isWaitingReview = step.status === 'รอตรวจงาน';
              const isInProgress = step.status === 'กำลังดำเนินการ';

              return (
                <div
                  key={step.id}
                  onClick={() => !isCompleted && setActiveStepId(step.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20' 
                      : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100'
                  } ${isCompleted ? 'opacity-75 cursor-default' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCompleted ? 'bg-emerald-600 text-white' : isInProgress ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'
                      }`}>
                        {step.stepNumber}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{step.name}</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">{step.description}</p>
                        
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-slate-200 font-mono text-slate-700 font-bold">
                            Evident: {step.evident}
                          </span>
                          <span className="text-slate-500">
                            Plan: {step.planStart} ถึง {step.planEnd}
                          </span>
                          {step.actualStart && (
                            <span className="text-emerald-700 font-medium">
                              (เริ่มจริง: {step.actualStart})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 border ${
                      isCompleted 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : isWaitingReview
                          ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                          : isInProgress
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}>
                      {step.status}
                    </span>
                  </div>

                  {/* Attachment & Feedback Info if exists */}
                  {step.submittedFile && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5 text-blue-700">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{step.submittedFileOriginalName || step.submittedFile}</span>
                      </div>
                      <span className="text-slate-400">ส่งเมื่อ: {step.submittedAt}</span>
                    </div>
                  )}

                  {step.feedback && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                      <strong>ข้อเสนอแนะจากผู้ตรวจงาน:</strong> {step.feedback}
                    </div>
                  )}

                  {/* Action row for in-progress step */}
                  {!isCompleted && !isWaitingReview && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      {!step.actualStart ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleStartWork(step.id); }}
                          className="text-[11px] text-blue-700 hover:text-blue-900 font-bold underline"
                        >
                          ▶ บันทึกเริ่มทำงานวันนี้
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          ✓ กำลังดำเนินการ
                        </span>
                      )}

                      <span className="text-[11px] font-bold text-blue-600">
                        {isSelected ? '✓ เลือกขั้นตอนนี้แล้ว' : 'คลิกเพื่อส่งงาน ➔'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Submission Form */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            แบบฟอร์มส่งงานและแนบเอกสาร (Submit Work)
          </h3>

          <form onSubmit={handleSubmitWork} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ขั้นตอนงานที่ต้องการส่งมอบ *
              </label>
              <select
                value={activeStepId}
                onChange={(e) => setActiveStepId(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 font-semibold focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- กรุณาเลือกขั้นตอนงาน --</option>
                {currentProject?.steps
                  ?.filter(s => s.status !== 'เสร็จสิ้น')
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.evident}) - {s.status}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รายละเอียดสรุปความคืบหน้าในการส่งงาน
              </label>
              <textarea
                rows={3}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="ระบุรายละเอียดผลการปฏิบัติงาน สิ่งที่ได้ดำเนินการเสร็จสิ้น หรือหมายเหตุเพิ่มเติม..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* File Upload Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                แนบเอกสาร หรือไฟล์หลักฐาน (evident) *
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/60 relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  required={!selectedFile}
                />
                <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-1.5" />
                <div className="text-xs font-semibold text-slate-700">
                  {selectedFile ? selectedFile.name : 'คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่'}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  รองรับไฟล์ PDF, Word, Excel, รูปภาพ (PNG, JPG) หรือ ZIP
                </p>
              </div>
            </div>

            {/* Pre-notification Summary */}
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                เมื่อกดส่งงาน ระบบจะส่งแจ้งเตือนทาง LINE ดังนี้:
              </div>
              <p className="text-slate-500 pl-5">
                • ส่งถึง: {inspector?.name || 'ผู้ตรวจงาน'} ({inspector?.lineId || '@line'})<br />
                • ชื่อโครงการ: {currentProject?.name}<br />
                • ขั้นตอน: {currentProject?.steps?.find(s => s.id === activeStepId)?.name || 'ขั้นตอนที่เลือก'}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !activeStepId || !selectedFile}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'กำลังส่งงานและแจ้งเตือน LINE...' : 'ส่งงานเพื่อรับการตรวจ (Submit for Review)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

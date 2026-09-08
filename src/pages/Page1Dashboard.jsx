import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FolderKanban, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  SlidersHorizontal, 
  ChevronDown, 
  Layers, 
  FileText, 
  CalendarDays, 
  ArrowLeft, 
  ArrowRight, 
  MoveHorizontal,
  User,
  UserCheck
} from 'lucide-react';

export default function Page1Dashboard({ projects, allUsers = [], stats, activeProjectId, setActiveProjectId }) {
  const [timeScale, setTimeScale] = useState('day'); // 'day' | 'week' | 'month'
  const timelineScrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || projects[0];
  }, [projects, activeProjectId]);

  const projectOwner = useMemo(() => {
    if (!selectedProject) return null;
    const ownerId = selectedProject.ownerId || selectedProject.creatorId;
    return allUsers.find(u => u.id === ownerId || u.employeeId === ownerId);
  }, [selectedProject, allUsers]);

  const projectInspector = useMemo(() => {
    if (!selectedProject) return null;
    return allUsers.find(u => u.id === selectedProject.inspectorId || u.employeeId === selectedProject.inspectorId);
  }, [selectedProject, allUsers]);

  // Real today date string in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Format today for display
  const todayDisplay = useMemo(() => {
    const now = new Date();
    const d = now.getDate();
    const m = now.toLocaleDateString('en-US', { month: 'short' });
    return `${d}-${m}`;
  }, []);

  // Calculate project progress percentage
  const progressPercent = useMemo(() => {
    if (!selectedProject || !selectedProject.steps || selectedProject.steps.length === 0) return 0;
    const completed = selectedProject.steps.filter(s => s.status === 'เสร็จสิ้น').length;
    return Math.round((completed / selectedProject.steps.length) * 100);
  }, [selectedProject]);

  // Current Project Status (เสร็จสิ้น / ตรงตามแผน On Plan / ล่าช้า)
  const projectCurrentStatus = useMemo(() => {
    if (!selectedProject || !selectedProject.steps || selectedProject.steps.length === 0) {
      return { 
        label: 'รอดำเนินการ', 
        english: 'Pending', 
        icon: '⏳', 
        color: 'bg-slate-100 text-slate-700 border-slate-300' 
      };
    }

    const allCompleted = selectedProject.steps.every(s => s.status === 'เสร็จสิ้น');
    if (allCompleted || progressPercent === 100) {
      return { 
        label: 'เสร็จสิ้น', 
        english: 'Completed', 
        icon: '✅', 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400' 
      };
    }

    // Check if any step or project is delayed
    let isDelayed = selectedProject.status === 'ล่าช้า';
    if (!isDelayed) {
      for (const step of selectedProject.steps) {
        if (step.status !== 'เสร็จสิ้น' && step.planEnd && todayStr > step.planEnd) {
          isDelayed = true;
          break;
        }
      }
    }

    if (isDelayed) {
      return { 
        label: 'ล่าช้า', 
        english: 'Delayed', 
        icon: '⚠️', 
        color: 'bg-rose-100 text-rose-800 border-rose-300 ring-1 ring-rose-400' 
      };
    }

    return { 
      label: 'ตรงตามแผน', 
      english: 'On Plan', 
      icon: '⏱️', 
      color: 'bg-blue-100 text-blue-800 border-blue-300 ring-1 ring-blue-400' 
    };
  }, [selectedProject, progressPercent, todayStr]);

  // Compute Project Real Date Boundaries
  const projectDateRange = useMemo(() => {
    if (!selectedProject?.steps?.length) {
      return { min: todayStr, max: todayStr };
    }

    const allDates = [];
    selectedProject.steps.forEach(s => {
      if (s.planStart) allDates.push(s.planStart);
      if (s.planEnd) allDates.push(s.planEnd);
      if (s.actualStart) allDates.push(s.actualStart);
      if (s.actualEnd) allDates.push(s.actualEnd);
      if (s.status === 'กำลังดำเนินการ') {
        allDates.push(todayStr);
      }
    });

    if (allDates.length === 0) {
      return { min: todayStr, max: todayStr };
    }

    allDates.sort();
    return {
      min: allDates[0],
      max: allDates[allDates.length - 1]
    };
  }, [selectedProject, todayStr]);

  const parseDate = (dStr) => {
    if (!dStr) return null;
    const [y, m, d] = dStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const formatDateToISO = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Generate dynamic timeline columns matching real project dates & real execution date
  const timelineColumns = useMemo(() => {
    if (!selectedProject) return [];

    const minDateObj = parseDate(projectDateRange.min) || new Date();
    const maxDateObj = parseDate(projectDateRange.max) || new Date();

    if (timeScale === 'day') {
      const dates = [];
      const curr = new Date(minDateObj);
      const end = new Date(maxDateObj);

      curr.setDate(curr.getDate() - 1);
      end.setDate(end.getDate() + 1);

      // Ensure at least 25 days so user always has the 20-day viewport + slider capability
      const diffTime = Math.abs(end - curr);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 25) {
        end.setDate(curr.getDate() + 25);
      }

      let count = 0;
      while (curr <= end && count < 80) {
        const iso = formatDateToISO(curr);
        const day = curr.getDate();
        const monthShort = curr.toLocaleDateString('en-US', { month: 'short' });
        const dayOfWeek = curr.getDay(); // 0 is Sunday (วันอาทิตย์)
        const isSunday = dayOfWeek === 0;
        
        dates.push({
          key: iso,
          label: `${day}-${monthShort}`,
          iso: iso,
          isToday: iso === todayStr,
          isSunday: isSunday // วันหยุดประจำสัปดาห์
        });

        curr.setDate(curr.getDate() + 1);
        count++;
      }
      return dates;
    } else if (timeScale === 'week') {
      const weeks = [];
      const curr = new Date(minDateObj);
      const end = new Date(maxDateObj);

      const dayOfWeek = curr.getDay() || 7;
      curr.setDate(curr.getDate() - (dayOfWeek - 1));

      let wIdx = 1;
      while (curr <= end && wIdx <= 25) {
        const wStart = new Date(curr);
        const wEnd = new Date(curr);
        wEnd.setDate(wEnd.getDate() + 6);

        const startISO = formatDateToISO(wStart);
        const endISO = formatDateToISO(wEnd);
        const isToday = todayStr >= startISO && todayStr <= endISO;

        const label = `W${wIdx} (${wStart.getDate()} ${wStart.toLocaleDateString('en-US', { month: 'short' })}-${wEnd.getDate()} ${wEnd.toLocaleDateString('en-US', { month: 'short' })})`;

        weeks.push({
          key: `w-${startISO}`,
          label,
          start: startISO,
          end: endISO,
          isToday,
          isSunday: false
        });

        curr.setDate(curr.getDate() + 7);
        wIdx++;
      }
      return weeks;
    } else {
      // Month scale
      const months = [];
      const curr = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1);
      const end = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), 1);

      let mIdx = 0;
      while (curr <= end && mIdx < 24) {
        const y = curr.getFullYear();
        const m = curr.getMonth();
        const monthEnd = new Date(y, m + 1, 0);

        const startISO = formatDateToISO(curr);
        const endISO = formatDateToISO(monthEnd);
        const isToday = todayStr >= startISO && todayStr <= endISO;

        const label = `${curr.toLocaleDateString('en-US', { month: 'short' })} ${y}`;

        months.push({
          key: `m-${startISO}`,
          label,
          start: startISO,
          end: endISO,
          isToday,
          isSunday: false
        });

        curr.setMonth(curr.getMonth() + 1);
        mIdx++;
      }
      return months;
    }
  }, [selectedProject, projectDateRange, timeScale, todayStr]);

  const isCellActive = (col, startDateStr, endDateStr) => {
    if (!startDateStr) return false;
    const endStr = endDateStr || startDateStr;

    if (timeScale === 'day') {
      return col.iso >= startDateStr && col.iso <= endStr;
    } else {
      return !(endStr < col.start || startDateStr > col.end);
    }
  };

  const formatDisplayDate = (dStr) => {
    if (!dStr) return '-';
    if (dStr === 'กำลังดำเนินการ') return 'กำลังดำเนินการ';
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const d = parseDate(dStr);
      if (!d) return dStr;
      const day = d.getDate();
      const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
      return `${day}-${monthShort}`;
    }
    return dStr;
  };

  const getStepActualEnd = (step) => {
    if (step.actualEnd) return step.actualEnd;
    if (step.status === 'กำลังดำเนินการ') {
      return todayStr;
    }
    return null;
  };

  // Sync scroll with slider
  const handleTimelineScroll = () => {
    if (!timelineScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = timelineScrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress((scrollLeft / maxScroll) * 100);
    } else {
      setScrollProgress(0);
    }
  };

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setScrollProgress(val);
    if (timelineScrollRef.current) {
      const { scrollWidth, clientWidth } = timelineScrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      timelineScrollRef.current.scrollLeft = (val / 100) * maxScroll;
    }
  };

  const handleScrollStep = (px) => {
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollBy({ left: px, behavior: 'smooth' });
    }
  };

  const handleScrollToToday = () => {
    if (timelineScrollRef.current) {
      const todayEl = timelineScrollRef.current.querySelector('.today-column');
      if (todayEl) {
        todayEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  // Enable mouse wheel horizontal scrolling on the timeline
  useEffect(() => {
    const el = timelineScrollRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (e.deltaY !== 0 && !e.shiftKey) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      {/* Top Header & Project Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm min-w-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-blue-600" />
            สถานะของแต่ละโครงการ และ Schedule Gantt Chart
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ระบุวันหยุด (วันอาทิตย์) ชัดเจน, Freeze คอลัมน์ข้อมูลถึง End date และสไลด์ดูแผนงานอย่างเป็นระเบียบ
          </p>
        </div>

        {/* Project Selector & Real Today Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
            <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
            <span>วันนี้: <strong className="text-slate-900 font-bold">{todayDisplay}</strong> ({todayStr})</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">โครงการ:</label>
            <div className="relative">
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 pr-9 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm min-w-[240px]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code}: {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Project Owner & Inspector Badges */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/90 border border-blue-200 rounded-xl text-xs text-blue-900 shadow-xs">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-500 font-medium">เจ้าของโครงการ:</span>
              <strong className="font-bold">{projectOwner?.name || 'สมศักดิ์ วางแผนงาน'}</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs text-emerald-900 shadow-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-500 font-medium">ผู้ตรวจงาน:</span>
              <strong className="font-bold">{projectInspector?.name || 'ดนัย ผู้ตรวจงาน'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Top Summary Stats Cards (4 Status Bars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">โครงการทั้งหมด</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{stats?.total ?? projects.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">ในระบบทั้งหมด</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-600">กำลังดำเนินการ</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{stats?.inProgress ?? 0}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">โครงการที่กำลังปฏิบัติงาน</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-600">เสร็จสิ้น</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats?.completed ?? 0}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">ส่งมอบและตรวจรับแล้ว</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-rose-600">ล่าช้า</div>
            <div className="text-2xl font-black text-rose-700 mt-1">{stats?.delayed ?? 0}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">เกินกรอบเวลาแผนงาน</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Schedule & Gantt Container */}
      <div className="w-full min-w-0 max-w-full bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
        {/* Top Controls: Progress Bar & Time Scale Switcher */}
        <div className="p-4 bg-slate-50 border-b border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-slate-800 text-sm md:text-base">ความคืบหน้าโครงการ</span>
            <div className="flex items-center gap-3">
              <div className="w-48 md:w-60 bg-slate-200 rounded-md h-7 overflow-hidden border border-slate-300 flex items-center relative">
                <div 
                  className="bg-[#10B981] h-full transition-all duration-500 ease-out flex items-center justify-center text-white font-bold text-xs"
                  style={{ width: `${progressPercent}%` }}
                >
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-800 drop-shadow-sm">
                  {progressPercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* สถานะปัจจุบันของโครงการ (หลังแถบแสดงความคืบหน้า) */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300">
              <span className="text-xs text-slate-500 font-semibold">สถานะปัจจุบัน:</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${projectCurrentStatus.color}`}>
                <span>{projectCurrentStatus.icon}</span>
                <span>{projectCurrentStatus.label}</span>
                <span className="text-[10px] font-semibold opacity-80">({projectCurrentStatus.english})</span>
              </span>
            </div>
          </div>

          {/* Time Scale Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Time Scale:
            </span>
            <div className="inline-flex bg-slate-200 p-1 rounded-lg border border-slate-300 text-xs font-semibold">
              <button
                onClick={() => setTimeScale('day')}
                className={`px-3 py-1 rounded-md transition ${
                  timeScale === 'day' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                วัน (Day)
              </button>
              <button
                onClick={() => setTimeScale('week')}
                className={`px-3 py-1 rounded-md transition ${
                  timeScale === 'week' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                สัปดาห์ (Week)
              </button>
              <button
                onClick={() => setTimeScale('month')}
                className={`px-3 py-1 rounded-md transition ${
                  timeScale === 'month' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                เดือน (Month)
              </button>
            </div>
          </div>
        </div>

        {/* แท่นสไลด์ควบคุมไทม์ไลน์ (Interactive Slider Bar) */}
        <div className="p-3 bg-slate-100/90 border-b border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold shrink-0">
            <MoveHorizontal className="w-4 h-4 text-blue-600" />
            <span>
              แท็บสไลด์เลื่อนดูแผนงาน ({timelineColumns.length} วัน • แสดงช่วงละ ~20 ช่อง):
            </span>
          </div>

          {/* Range Slider for smooth timeline sliding */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-xl mx-2">
            <button
              type="button"
              onClick={() => handleScrollStep(-160)}
              title="เลื่อนไปทางซ้าย"
              className="p-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg border border-slate-300 transition shrink-0 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={scrollProgress}
              onChange={handleSliderChange}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-300 rounded-lg"
              title="ลากสไลด์เพื่อเลื่อนดูไทม์ไลน์"
            />

            <button
              type="button"
              onClick={() => handleScrollStep(160)}
              title="เลื่อนไปทางขวา"
              className="p-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg border border-slate-300 transition shrink-0 shadow-xs"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleScrollToToday}
              className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs shrink-0 transition flex items-center gap-1"
            >
              <span>🎯</span>
              <span>วันนี้</span>
            </button>
          </div>
        </div>

        {/* Split-pane Gantt Architecture:
            Left Pane: 100% Frozen (Freeze up to End Date: step, Status, evident, Type, start, End)
            Right Pane: Scrollable Timeline with Slider (shows ~20 days viewport with min-w-0) */}
        <div className="flex w-full min-w-0 max-w-full overflow-hidden bg-white">
          
          {/* ================= LEFT FROZEN PANE (คอลัมน์ที่ Freeze ไว้จนถึง End date: รวม 510px จัดระเบียบไม่ทับขอบ) ================= */}
          <div className="w-[510px] min-w-[510px] shrink-0 border-r-2 border-slate-600 shadow-md bg-white z-20 select-none">
            <table className="w-full border-collapse text-xs table-fixed">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-800 h-[46px]">
                  <th className="border border-slate-400 px-2 py-1 text-center font-bold text-slate-900 w-[80px]">
                    step
                  </th>
                  <th className="border border-slate-400 px-2 py-1 text-center font-bold text-slate-900 w-[100px]">
                    Status
                  </th>
                  <th className="border border-slate-400 px-2 py-1 text-center font-bold text-slate-900 w-[130px] bg-blue-50/40">
                    evident
                  </th>
                  <th className="border border-slate-400 px-1 py-1 text-center font-bold text-slate-900 w-[50px]">
                    Type
                  </th>
                  <th className="border border-slate-400 px-2 py-1 text-center font-bold text-slate-900 w-[75px]">
                    start
                  </th>
                  <th className="border border-slate-400 px-2 py-1 text-center font-bold text-slate-900 w-[75px] bg-slate-200/50">
                    End
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedProject?.steps?.map((step) => {
                  const isCompleted = step.status === 'เสร็จสิ้น';

                  return (
                    <React.Fragment key={step.id}>
                      {/* Row 1: Plan */}
                      <tr className="border-t-2 border-slate-700 h-[38px]">
                        {/* step column (spans 2 rows) */}
                        <td
                          rowSpan={2}
                          className="border border-slate-400 px-2 py-1 text-center font-bold text-slate-900 align-middle bg-white"
                        >
                          <div className="font-bold text-slate-800">{step.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal mt-0.5 truncate max-w-[76px] mx-auto" title={step.description}>
                            {step.description}
                          </div>
                        </td>

                        {/* Status column (spans 2 rows) */}
                        <td
                          rowSpan={2}
                          className="border border-slate-400 px-1.5 py-1 text-center font-medium align-middle bg-white"
                        >
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                            step.status === 'เสร็จสิ้น' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : step.status === 'กำลังดำเนินการ'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : step.status === 'รอตรวจงาน'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}>
                            {step.status}
                          </span>
                        </td>

                        {/* evident column (spans 2 rows):
                            - ชื่อ evident ให้เป็นไปตามชื่อไฟล์ที่แนบมา
                            - ถ้ายังไม่แล้วเสร็จ: ให้ว่างไว้ */}
                        <td
                          rowSpan={2}
                          className="border border-slate-400 p-1.5 text-center align-middle bg-white overflow-hidden"
                          title={isCompleted ? `เอกสารหลักฐาน: ${step.submittedFileOriginalName || step.submittedFile || step.evident}` : ''}
                        >
                          {isCompleted ? (
                            step.submittedFile ? (
                              <a
                                href={`/uploads/${step.submittedFile}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md border border-blue-200 transition shadow-xs w-full max-w-[120px] mx-auto group"
                                title={`เปิดเอกสาร: ${step.submittedFileOriginalName || step.submittedFile}`}
                              >
                                <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-semibold truncate text-slate-800 group-hover:text-blue-700">
                                  {step.submittedFileOriginalName || step.submittedFile}
                                </span>
                              </a>
                            ) : (
                              <div className="inline-flex items-center justify-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold max-w-[120px] truncate">
                                <FileText className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="truncate">{step.evident || 'เอกสารหลักฐาน'}</span>
                              </div>
                            )
                          ) : (
                            /* ยังไม่แล้วเสร็จ: เว้นว่างไว้ */
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Type: Plan */}
                        <td className="border border-slate-400 px-1 py-1 text-center font-medium text-slate-700 bg-white text-[11px]">
                          Plan
                        </td>

                        {/* Plan Start */}
                        <td className="border border-slate-400 px-1 py-1 text-center font-mono text-slate-700 bg-white text-[11px]">
                          {formatDisplayDate(step.planStart)}
                        </td>

                        {/* Plan End */}
                        <td className="border border-slate-400 px-1 py-1 text-center font-mono text-slate-700 bg-slate-100/60 text-[11px]">
                          {formatDisplayDate(step.planEnd)}
                        </td>
                      </tr>

                      {/* Row 2: Actual */}
                      <tr className="border-b border-slate-400 h-[38px]">
                        {/* Type: Actual */}
                        <td className="border border-slate-400 px-1 py-1 text-center font-medium text-slate-700 bg-white text-[11px]">
                          Actual
                        </td>

                        {/* Actual Start */}
                        <td className="border border-slate-400 px-1 py-1 text-center font-mono text-slate-700 bg-white text-[11px]">
                          {step.actualStart ? formatDisplayDate(step.actualStart) : (step.status === 'กำลังดำเนินการ' ? 'ทำอยู่' : '-')}
                        </td>

                        {/* Actual End */}
                        <td className="border border-slate-400 px-1 py-1 text-center font-mono text-slate-700 bg-slate-100/60 text-[11px]">
                          {step.status === 'กำลังดำเนินการ' ? 'ทำอยู่' : (step.actualEnd ? formatDisplayDate(step.actualEnd) : '-')}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ================= RIGHT SCROLLABLE TIMELINE PANE (Strictly constrained with min-w-0) ================= */}
          <div 
            ref={timelineScrollRef}
            onScroll={handleTimelineScroll}
            className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden bg-slate-50 relative select-none scrollbar-thin"
          >
            <table className="border-collapse text-xs min-w-max">
              <thead>
                <tr className="bg-white border-b-2 border-slate-800 h-[46px]">
                  {timelineColumns.map((col) => (
                    <th
                      key={col.key}
                      className={`border border-slate-400 px-0.5 py-1 text-center font-bold min-w-[42px] w-[42px] ${
                        col.isToday 
                          ? 'today-column bg-slate-300 text-slate-900 font-black shadow-inner ring-1 ring-slate-400' 
                          : col.isSunday
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-white text-slate-800'
                      }`}
                    >
                      <div className={`text-[10px] leading-tight rotate-0 whitespace-nowrap ${col.isSunday ? 'text-rose-700 font-black' : ''}`}>
                        {col.label}
                      </div>
                      {col.isToday ? (
                        <div className="text-[9px] text-blue-800 font-extrabold tracking-tighter">
                          วันนี้
                        </div>
                      ) : col.isSunday ? (
                        <div className="text-[9px] text-rose-600 font-bold">
                          อา. (หยุด)
                        </div>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedProject?.steps?.map((step) => {
                  const stepActualEnd = getStepActualEnd(step);

                  return (
                    <React.Fragment key={step.id}>
                      {/* Row 1: Plan Bars */}
                      <tr className="border-t-2 border-slate-700 h-[38px]">
                        {timelineColumns.map((col) => {
                          const active = isCellActive(col, step.planStart, step.planEnd);
                          return (
                            <td
                              key={`plan-${col.key}`}
                              className={`border border-slate-400 p-0 text-center relative h-[38px] min-w-[42px] w-[42px] ${
                                col.isToday 
                                  ? 'bg-slate-200' 
                                  : col.isSunday
                                    ? 'bg-rose-50/70'
                                    : 'bg-white'
                              }`}
                            >
                              {active && (
                                <div 
                                  className="w-full h-full bg-[#60A5FA] border-x border-blue-500/60 flex items-center justify-center shadow-xs"
                                  title={`Plan: ${step.planStart} ถึง ${step.planEnd}`}
                                >
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Row 2: Actual Bars */}
                      <tr className="border-b border-slate-400 h-[38px]">
                        {timelineColumns.map((col) => {
                          const active = isCellActive(col, step.actualStart, stepActualEnd);
                          return (
                            <td
                              key={`actual-${col.key}`}
                              className={`border border-slate-400 p-0 text-center relative h-[38px] min-w-[42px] w-[42px] ${
                                col.isToday 
                                  ? 'bg-slate-200' 
                                  : col.isSunday
                                    ? 'bg-rose-50/70'
                                    : 'bg-white'
                              }`}
                            >
                              {active && (
                                <div 
                                  className="w-full h-full bg-[#10B981] border-x border-emerald-600/60 flex items-center justify-center shadow-xs"
                                  title={`Actual: ${step.actualStart} ถึง ${stepActualEnd || 'ปัจจุบัน'}`}
                                >
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Legend Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-300 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[#60A5FA] border border-blue-500 inline-block"></span>
              <span className="font-semibold text-slate-700">Plan (แผนงาน)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[#10B981] border border-emerald-600 inline-block"></span>
              <span className="font-semibold text-slate-700">Actual (ดำเนินการจริง)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-rose-100 border border-rose-300 inline-block"></span>
              <span className="font-semibold text-rose-800">วันหยุดประจำสัปดาห์ (วันอาทิตย์ - Sunday)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-slate-300 border border-slate-400 inline-block"></span>
              <span className="font-semibold text-slate-700">เส้นวันที่ปัจจุบัน ({todayDisplay} Today Line)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded text-[10px] font-bold">
                📎 evident
              </span>
              <span className="text-slate-600">ไฟล์แนบที่ผ่านการตรวจแล้ว (ขั้นตอนที่ยังไม่เสร็จจะเว้นว่างไว้)</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            * คอลัมน์ข้อมูลถึง End date ถูก Freeze ไว้ด้านซ้ายอย่างเป็นระเบียบ
          </div>
        </div>
      </div>
    </div>
  );
}

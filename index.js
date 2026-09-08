import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { sendEmailNotification } from './emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

// Serve static uploaded files
app.use('/uploads', express.static(uploadsDir));

// --- Auth Endpoints ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้' });
  }

  const cleanUsername = username.trim();
  const isViewer = cleanUsername.toLowerCase() === 'viewer';

  let user = db.getUserByUsername(cleanUsername);
  if (!user && isViewer) {
    user = {
      id: 'VIEWER001',
      employeeId: 'VIEWER',
      name: 'ผู้เข้าชมทั่วไป (Viewer)',
      username: 'viewer',
      password: '',
      email: 'viewer@company.com',
      role: 'viewer'
    };
    db.saveUser(user);
  }

  if (!user) {
    return res.status(401).json({ error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้' });
  }

  // Viewer login requires NO password
  if (isViewer || user.role === 'viewer') {
    const { password: _, ...userWithoutPass } = user;
    return res.json({ user: userWithoutPass, token: 'mock-jwt-token-' + user.id });
  }

  if (!password) {
    return res.status(400).json({ error: 'กรุณากรอกรหัสผ่าน' });
  }

  const isInspectorAlias = cleanUsername.toLowerCase() === 'inspector';
  const isPasswordMatch = user.password === password || 
    (isInspectorAlias && (password === 'inspect123' || password === 'C270908' || password === user.password));

  if (!isPasswordMatch) {
    return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง' });
  }

  const { password: _, ...userWithoutPass } = user;
  res.json({ user: userWithoutPass, token: 'mock-jwt-token-' + user.id });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const users = db.getUsers();
  // Return the first user or matched
  res.json({ user: users[0] });
});

// --- User Management (Admin Only) ---
app.get('/api/users', (req, res) => {
  const users = db.getUsers().map(({ password, ...u }) => u);
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { id, employeeId, name, username, password, lineId, lineToken, role } = req.body;
  if (!employeeId || !name || !username || !role) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }
  const existing = db.getUserById(id || employeeId);
  const newUserData = {
    id: id || employeeId,
    employeeId,
    name,
    username,
    password: password || existing?.password || '123456',
    lineId: lineId || '',
    lineToken: lineToken || '',
    role
  };
  db.saveUser(newUserData);
  const { password: _, ...safeUser } = newUserData;
  res.json(safeUser);
});

app.delete('/api/users/:id', (req, res) => {
  db.deleteUser(req.params.id);
  res.json({ success: true });
});

// --- Stats & Overview ---
app.get('/api/stats', (req, res) => {
  const projects = db.getProjects().filter(p => p.status !== 'ยกเลิก');
  const total = projects.length;
  const inProgress = projects.filter(p => p.status === 'กำลังดำเนินการ').length;
  const completed = projects.filter(p => p.status === 'เสร็จสิ้น').length;
  const delayed = projects.filter(p => p.status === 'ล่าช้า').length;
  res.json({ total, inProgress, completed, delayed, cancelled: 0 });
});

// --- Projects & Gantt ---
app.get('/api/projects', (req, res) => {
  const { includeCancelled } = req.query;
  let projects = db.getProjects();
  if (!includeCancelled) {
    projects = projects.filter(p => p.status !== 'ยกเลิก');
  }
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const project = db.getProjectById(req.params.id);
  if (!project || project.status === 'ยกเลิก') return res.status(404).json({ error: 'ไม่พบโครงการ' });
  res.json(project);
});

app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const project = db.getProjectById(id);
  if (!project) return res.status(404).json({ error: 'ไม่พบโครงการ' });
  db.deleteProject(id);
  res.json({ success: true, message: `ลบโครงการ ${project.name} ออกจากระบบเรียบร้อยแล้ว` });
});

app.post('/api/projects', (req, res) => {
  const { name, code, description, targetEndDate, inspectorId, ownerId, creatorId, steps } = req.body;
  if (!name || !steps || steps.length === 0) {
    return res.status(400).json({ error: 'กรุณาระบุชื่อโครงการและขั้นตอนงาน' });
  }
  const newProject = {
    id: 'proj-' + Date.now(),
    code: code || `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    name,
    description: description || '',
    status: 'กำลังดำเนินการ',
    createdAt: new Date().toISOString().split('T')[0],
    targetEndDate: targetEndDate || '',
    ownerId: ownerId || creatorId || 'EMP002',
    inspectorId: inspectorId || 'EMP004',
    creatorId: creatorId || ownerId || 'EMP002',
    currentPlanRevision: 1,
    steps: steps.map((s, idx) => ({
      id: `step-${Date.now()}-${idx + 1}`,
      stepNumber: idx + 1,
      name: s.name || `ขั้นตอนที่ ${idx + 1}`,
      description: s.description || '',
      status: idx === 0 ? 'กำลังดำเนินการ' : 'รอขั้นตอนก่อนหน้า',
      evident: s.evident || 'DOC',
      evidentDescription: s.evidentDescription || '',
      planStart: s.planStart,
      planEnd: s.planEnd,
      actualStart: idx === 0 ? s.planStart : null,
      actualEnd: null,
      assignedWorkerId: s.assignedWorkerId || 'EMP003',
      submittedFile: null,
      submittedAt: null,
      reviewedAt: null,
      reviewResult: null,
      feedback: null
    }))
  };

  db.saveProject(newProject);
  res.status(201).json(newProject);
});

// Request Plan Change (If project is already in progress, requires Inspector approval)
app.post('/api/projects/:id/revision', async (req, res) => {
  const { id } = req.params;
  const { proposedSteps, reason, requestedByUserId } = req.body;
  const project = db.getProjectById(id);
  if (!project) return res.status(404).json({ error: 'ไม่พบโครงการ' });

  const inspector = db.getUserById(project.inspectorId);
  const requester = db.getUserById(requestedByUserId);
  const isCancel = req.body.type === 'cancel_project' || (reason && reason.includes('ขอยกเลิกโครงการ'));

  const changeRequest = {
    id: 'cr-' + Date.now(),
    type: isCancel ? 'cancel_project' : 'plan_revision',
    projectId: id,
    projectName: project.name,
    projectCode: project.code,
    requestedBy: requester?.name || 'ผู้วางแผนงาน',
    requestedByUserId,
    requestedAt: new Date().toLocaleString('th-TH'),
    reason: reason || (isCancel ? 'ขอยกเลิกโครงการเนื่องจากเหตุจำเป็น' : 'ขอปรับปรุงกรอบเวลาขั้นตอนงานตามสภาพความเป็นจริง'),
    status: 'pending', // 'pending', 'approved', 'rejected'
    proposedSteps: proposedSteps || null,
    previousSteps: project.steps,
    inspectorId: project.inspectorId
  };

  db.saveChangeRequest(changeRequest);

  // Send Email notification to Inspector
  if (inspector) {
    await sendEmailNotification({
      recipientUser: inspector,
      projectName: project.name,
      stepName: isCancel ? 'ขอยกเลิกโครงการ' : 'ขออนุมัติแก้ไขแผนงาน',
      action: isCancel ? 'ขอยกเลิกโครงการ' : 'ขออนุมัติแก้ไขแผนงาน',
      message: isCancel
        ? `🚨 [คำขอยกเลิกโครงการ]\n📌 โครงการ: ${project.name} (${project.code})\n👤 ผู้ขอยกเลิก: ${changeRequest.requestedBy}\n📝 เหตุผลที่ขอยกเลิก: ${changeRequest.reason}\n🔗 กรุณาเข้าสู่ระบบเพื่อพิจารณาอนุมัติหรือปฏิเสธคำขอยกเลิกโครงการนี้`
        : `🔔 [คำขออนุมัติแก้ไขแผนงานใหม่]\n📌 โครงการ: ${project.name}\n👤 ผู้ขอแก้ไข: ${changeRequest.requestedBy}\n📝 เหตุผล: ${changeRequest.reason}\n🔗 กรุณาเข้าสู่ระบบเพื่อตรวจสอบและอนุมัติแผนงานใหม่`
    });
  }

  res.json({ 
    success: true,
    message: isCancel 
      ? 'ส่งคำขอยกเลิกโครงการไปยัง Email ผู้ตรวจงานเรียบร้อยแล้ว (รอการอนุมัติ)' 
      : 'ส่งคำขอแก้ไขแผนงานไปยัง Email ผู้ตรวจงานเรียบร้อยแล้ว', 
    changeRequest 
  });
});

// Request Project Cancellation (Requires Inspector approval)
app.post('/api/projects/:id/cancel-request', async (req, res) => {
  const { id } = req.params;
  const { reason, requestedByUserId } = req.body;
  const project = db.getProjectById(id);
  if (!project) return res.status(404).json({ error: 'ไม่พบโครงการ' });

  if (project.status === 'ยกเลิก') {
    return res.status(400).json({ error: 'โครงการนี้ถูกยกเลิกไปแล้ว' });
  }

  const inspector = db.getUserById(project.inspectorId);
  const requester = db.getUserById(requestedByUserId);

  const changeRequest = {
    id: 'cr-' + Date.now(),
    type: 'cancel_project',
    projectId: id,
    projectName: project.name,
    projectCode: project.code,
    requestedBy: requester?.name || 'ผู้วางแผนงาน',
    requestedByUserId,
    requestedAt: new Date().toLocaleString('th-TH'),
    reason: reason || 'ขอยกเลิกโครงการเนื่องจากเหตุจำเป็น',
    status: 'pending', // 'pending', 'approved', 'rejected'
    inspectorId: project.inspectorId
  };

  db.saveChangeRequest(changeRequest);

  // Send Email notification to Inspector
  if (inspector) {
    await sendEmailNotification({
      recipientUser: inspector,
      projectName: project.name,
      stepName: 'ขอยกเลิกโครงการ',
      action: 'ขอยกเลิกโครงการ',
      message: `🚨 [คำขอยกเลิกโครงการ]\n📌 โครงการ: ${project.name} (${project.code})\n👤 ผู้ขอยกเลิก: ${changeRequest.requestedBy}\n📝 เหตุผลที่ขอยกเลิก: ${changeRequest.reason}\n🔗 กรุณาเข้าสู่ระบบเพื่อพิจารณาอนุมัติหรือปฏิเสธคำขอยกเลิกโครงการนี้`
    });
  }

  res.json({ 
    success: true, 
    message: 'ส่งคำขอยกเลิกโครงการไปยัง Email ผู้ตรวจงานเรียบร้อยแล้ว (รอการอนุมัติ)', 
    changeRequest 
  });
});

// Get Change Requests for Inspector
app.get('/api/change-requests', (req, res) => {
  const { inspectorId, status } = req.query;
  let requests = db.getChangeRequests();
  if (inspectorId) {
    requests = requests.filter(r => r.inspectorId === inspectorId);
  }
  if (status) {
    requests = requests.filter(r => r.status === status);
  }
  res.json(requests);
});

// Inspector Approve Change Request (Plan Revision or Project Cancellation)
app.post('/api/change-requests/:id/approve', async (req, res) => {
  const { id } = req.params;
  const requests = db.getChangeRequests();
  const cr = requests.find(r => r.id === id);
  if (!cr) return res.status(404).json({ error: 'ไม่พบคำขอ' });

  cr.status = 'approved';
  cr.approvedAt = new Date().toLocaleString('th-TH');
  db.saveChangeRequest(cr);

  const project = db.getProjectById(cr.projectId);
  if (project) {
    // Check if this is a project cancellation request
    if (cr.type === 'cancel_project' || (cr.reason && cr.reason.includes('ขอยกเลิกโครงการ'))) {
      const projectName = project.name;
      const projectCode = project.code;

      // Delete project completely from database so it no longer appears anywhere in the system
      db.deleteProject(cr.projectId);

      // Notify requester via Email
      const requester = db.getUserById(cr.requestedByUserId);
      if (requester) {
        await sendEmailNotification({
          recipientUser: requester,
          projectName: projectName,
          stepName: 'ผลการขอยกเลิกโครงการ',
          action: 'อนุมัติยกเลิกและลบโครงการ',
          message: `✅ [อนุมัติการยกเลิกโครงการ]\n📌 โครงการ: ${projectName} (${projectCode})\nสถานะโครงการได้รับการอนุมัติให้ยกเลิก และโครงการถูกลบออกจากระบบเรียบร้อยแล้ว`
        });
      }

      return res.json({ 
        success: true, 
        message: `อนุมัติการยกเลิกโครงการเรียบร้อยแล้ว (โครงการ "${projectName}" ถูกลบออกจากระบบแล้ว)` 
      });
    }

    // Standard plan revision
    project.currentPlanRevision = (project.currentPlanRevision || 1) + 1;
    project.steps = cr.proposedSteps;
    db.saveProject(project);

    // Notify requester via Email
    const requester = db.getUserById(cr.requestedByUserId);
    if (requester) {
      await sendEmailNotification({
        recipientUser: requester,
        projectName: project.name,
        stepName: 'ผลการขอแก้ไขแผนงาน',
        action: 'อนุมัติแก้ไขแผนงาน',
        message: `✅ [อนุมัติการแก้ไขแผนงาน]\n📌 โครงการ: ${project.name}\n📊 แผนงานฉบับใหม่ได้รับการอนุมัติแล้ว และมีผลบังคับใช้ในระบบทันที`
      });
    }
  }

  res.json({ success: true, message: 'อนุมัติแผนงานใหม่เรียบร้อยแล้ว' });
});

// Inspector Reject Change Request (Plan Revision or Project Cancellation)
app.post('/api/change-requests/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const requests = db.getChangeRequests();
  const cr = requests.find(r => r.id === id);
  if (!cr) return res.status(404).json({ error: 'ไม่พบคำขอ' });

  const isCancel = cr.type === 'cancel_project';
  cr.status = 'rejected';
  cr.rejectReason = reason || (isCancel ? 'ไม่อนุมัติการยกเลิกโครงการ' : 'ไม่อนุมัติการแก้ไขแผนงาน');
  cr.rejectedAt = new Date().toLocaleString('th-TH');
  db.saveChangeRequest(cr);

  // Notify requester via Email
  const project = db.getProjectById(cr.projectId);
  const requester = db.getUserById(cr.requestedByUserId);
  if (requester) {
    const actionTitle = isCancel ? 'ไม่อนุมัติยกเลิกโครงการ' : 'ไม่อนุมัติแก้ไขแผนงาน';
    await sendEmailNotification({
      recipientUser: requester,
      projectName: project?.name || 'โครงการ',
      stepName: isCancel ? 'ผลการขอยกเลิกโครงการ' : 'ผลการขอแก้ไขแผนงาน',
      action: actionTitle,
      message: `❌ [${actionTitle}]\n📌 โครงการ: ${project?.name}\n💬 เหตุผล: ${cr.rejectReason}\nโครงการยังคงดำเนินงานตามเดิม`
    });
  }

  res.json({ 
    success: true, 
    message: isCancel 
      ? 'ปฏิเสธคำขอยกเลิกโครงการเรียบร้อยแล้ว (โครงการยังคงดำเนินงานตามเดิม)' 
      : 'ปฏิเสธคำขอเรียบร้อยแล้ว' 
  });
});

// --- Page 3: Operation & Task Submission ---
app.post('/api/tasks/:projectId/:stepId/submit', upload.single('evidentFile'), async (req, res) => {
  const { projectId, stepId } = req.params;
  const { notes, workerId } = req.body;
  const project = db.getProjectById(projectId);
  if (!project) return res.status(404).json({ error: 'ไม่พบโครงการ' });

  const step = project.steps.find(s => s.id === stepId);
  if (!step) return res.status(404).json({ error: 'ไม่พบขั้นตอนงาน' });

  const uploadedFileName = req.file ? req.file.filename : (step.submittedFile || 'document_evident.pdf');
  const originalName = req.file ? req.file.originalname : uploadedFileName;

  step.status = 'รอตรวจงาน';
  step.submittedFile = uploadedFileName;
  step.submittedFileOriginalName = originalName;
  step.submittedAt = new Date().toLocaleString('th-TH');
  step.submissionNotes = notes || '';
  if (!step.actualStart) {
    step.actualStart = new Date().toISOString().split('T')[0];
  }
  step.actualEnd = new Date().toISOString().split('T')[0];

  db.saveProject(project);

  // Send Email Notification to Inspector
  const inspector = db.getUserById(project.inspectorId);
  const worker = db.getUserById(workerId || step.assignedWorkerId);

  if (inspector) {
    await sendEmailNotification({
      recipientUser: inspector,
      projectName: project.name,
      stepName: step.name,
      action: 'ส่งงานเพื่อรับการตรวจ',
      message: `🔔 [แจ้งเตือนส่งงานใหม่]\n📌 โครงการ: ${project.name}\n📋 ขั้นตอน: ${step.name} (${step.description})\n👤 ผู้ส่งงาน: ${worker?.name || 'ผู้ปฏิบัติงาน'}\n📎 เอกสารแนบ: ${originalName}\n🔗 กรุณาเข้าสู่ระบบเพื่อทำการตรวจรับงานในหน้าตรวจงาน`
    });
  }

  res.json({ success: true, message: 'ส่งงานและส่งการแจ้งเตือนไปยัง Email ผู้ตรวจงานเรียบร้อยแล้ว', step });
});

// Update progress or status directly
app.put('/api/tasks/:projectId/:stepId/progress', (req, res) => {
  const { projectId, stepId } = req.params;
  const { actualStart, status } = req.body;
  const project = db.getProjectById(projectId);
  if (!project) return res.status(404).json({ error: 'ไม่พบโครงการ' });

  const step = project.steps.find(s => s.id === stepId);
  if (!step) return res.status(404).json({ error: 'ไม่พบขั้นตอนงาน' });

  if (actualStart) step.actualStart = actualStart;
  if (status) step.status = status;

  db.saveProject(project);
  res.json({ success: true, step });
});

// --- Page 4: Review & Inspection ---
app.get('/api/inspections', (req, res) => {
  const { inspectorId } = req.query;
  const projects = db.getProjects();
  let pendingTasks = [];

  projects.forEach(proj => {
    if (!inspectorId || proj.inspectorId === inspectorId) {
      proj.steps.forEach(st => {
        if (st.status === 'รอตรวจงาน' || st.reviewResult) {
          pendingTasks.push({
            projectId: proj.id,
            projectCode: proj.code,
            projectName: proj.name,
            inspectorId: proj.inspectorId,
            step: st
          });
        }
      });
    }
  });

  res.json(pendingTasks);
});

app.post('/api/inspections/:projectId/:stepId/confirm', async (req, res) => {
  const { projectId, stepId } = req.params;
  const { result, feedback, inspectorUserId } = req.body; // result: 'pass' | 'fail'
  
  if (!result || (result === 'fail' && !feedback?.trim())) {
    return res.status(400).json({ error: 'หากไม่ผ่านการตรวจงาน จำเป็นต้องระบุคำแนะนำในการแก้ไข' });
  }

  const project = db.getProjectById(projectId);
  if (!project) return res.status(404).json({ error: 'ไม่พบโครงการ' });

  const stepIndex = project.steps.findIndex(s => s.id === stepId);
  if (stepIndex < 0) return res.status(404).json({ error: 'ไม่พบขั้นตอนงาน' });

  const step = project.steps[stepIndex];
  step.reviewedAt = new Date().toLocaleString('th-TH');
  step.reviewResult = result;
  step.feedback = feedback || '';

  if (result === 'pass') {
    step.status = 'เสร็จสิ้น';
    // Unlock next step if exists
    if (stepIndex + 1 < project.steps.length) {
      const nextStep = project.steps[stepIndex + 1];
      if (nextStep.status === 'รอขั้นตอนก่อนหน้า') {
        nextStep.status = 'กำลังดำเนินการ';
        nextStep.actualStart = new Date().toISOString().split('T')[0];
      }
    }
    // Check if all steps completed
    const allCompleted = project.steps.every(s => s.status === 'เสร็จสิ้น');
    if (allCompleted) {
      project.status = 'เสร็จสิ้น';
    }
  } else {
    // Fail: return to 'กำลังดำเนินการ' so worker can revise and re-submit
    step.status = 'กำลังดำเนินการ';
  }

  db.saveProject(project);

  // Send Email Notification to Worker
  const worker = db.getUserById(step.assignedWorkerId);
  if (worker) {
    const isPass = result === 'pass';
    const statusText = isPass ? '✅ ผ่านการประเมิน (Pass)' : '❌ ไม่ผ่านการประเมิน (Need Revision)';
    const feedbackText = feedback ? `\n💬 คำแนะนำจากผู้ตรวจงาน: ${feedback}` : '';

    await sendEmailNotification({
      recipientUser: worker,
      projectName: project.name,
      stepName: step.name,
      action: 'แจ้งผลการตรวจงาน',
      message: `📋 [ผลการตรวจงานโครงการ: ${project.name}]\n📌 ขั้นตอน: ${step.name}\n📊 ผลการตรวจ: ${statusText}${feedbackText}\n${!isPass ? '⚠️ กรุณาดำเนินการแก้ไขและส่งงานใหม่' : '🎉 สามารถดำเนินงานขั้นตอนถัดไปได้'}`
    });
  }

  res.json({ success: true, message: 'บันทึกผลการตรวจและแจ้งเตือน Email ไปยังผู้ส่งงานแล้ว', step });
});

// --- LINE Notifications Logs ---
app.get('/api/notifications', (req, res) => {
  res.json(db.getLineNotifications());
});

// Serve frontend build if exists (support ../client/dist, ../dist, ./dist, etc.)
const possibleDistPaths = [
  path.join(__dirname, '../client/dist'),
  path.join(__dirname, '../dist'),
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'public'),
  path.join(process.cwd(), 'client/dist'),
  path.join(process.cwd(), 'dist')
];

let clientDist = possibleDistPaths.find(p => fs.existsSync(path.join(p, 'index.html')));

if (clientDist) {
  console.log(`📦 Serving static frontend from: ${clientDist}`);
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  console.warn('⚠️ No frontend build found in any expected location.');
}

app.listen(PORT, () => {
  console.log(`🚀 Project Planning Server running at http://localhost:${PORT}`);
});


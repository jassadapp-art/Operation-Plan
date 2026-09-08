import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

const INITIAL_DATA = {
  users: [
    {
      id: 'EMP001',
      employeeId: 'EMP001',
      name: 'สมชาย ผู้ดูแลระบบ',
      username: 'admin',
      password: 'admin123',
      email: 'admin.somchai@company.com',
      role: 'admin' // 'admin', 'planner', 'worker', 'inspector'
    },
    {
      id: 'EMP002',
      employeeId: 'EMP002',
      name: 'สมศักดิ์ วางแผนงาน',
      username: 'planner',
      password: 'plan123',
      email: 'planner.somsak@company.com',
      role: 'planner'
    },
    {
      id: 'EMP003',
      employeeId: 'EMP003',
      name: 'วิชัย ผู้ส่งงาน/ปฏิบัติงาน',
      username: 'worker',
      password: 'work123',
      email: 'worker.wichai@company.com',
      role: 'worker'
    },
    {
      id: 'EMP004',
      employeeId: 'C270908',
      name: 'Jassada',
      username: 'inspector',
      password: 'C270908',
      email: 'jassada@company.com',
      role: 'inspector'
    }
  ],
  projects: [
    {
      id: 'proj-001',
      code: 'PRJ-2026-001',
      name: 'โครงการติดตั้งระบบควบคุมการผลิตอัตโนมัติ (Automation Line)',
      description: 'ติดตั้งระบบควบคุม PLC และเซนเซอร์ตรวจสอบคุณภาพผลิตภัณฑ์',
      status: 'กำลังดำเนินการ', // 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ล่าช้า', 'รอดำเนินการ'
      createdAt: '2026-01-01',
      targetEndDate: '2026-01-16',
      inspectorId: 'EMP004',
      creatorId: 'EMP002',
      currentPlanRevision: 1,
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          name: 'ขั้นตอนที่ 1',
          description: 'สำรวจพื้นที่และจัดทำพิมพ์เขียวงานระบบ',
          status: 'เสร็จสิ้น', // 'เสร็จสิ้น', 'กำลังดำเนินการ', 'รอขั้นตอนก่อนหน้า', 'รอตรวจงาน'
          evident: 'A',
          evidentDescription: 'เอกสารแบบพิมพ์เขียว Blueprint ลงนามอนุมัติ (A)',
          planStart: '2026-01-08',
          planEnd: '2026-01-09',
          actualStart: '2026-01-08',
          actualEnd: '2026-01-09',
          assignedWorkerId: 'EMP003',
          submittedFile: 'blueprint_approval_A.pdf',
          submittedAt: '2026-01-09 16:30',
          reviewedAt: '2026-01-09 17:00',
          reviewResult: 'pass',
          feedback: 'แบบพิมพ์เขียวถูกต้องครบถ้วน อนุมัติผ่าน'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          name: 'ขั้นตอนที่ 2',
          description: 'จัดซื้อและนำเข้าอุปกรณ์คอนโทรลเลอร์',
          status: 'เสร็จสิ้น',
          evident: 'B',
          evidentDescription: 'ใบตรวจรับพัสดุและใบรับรองคุณภาพอุปกรณ์ (B)',
          planStart: '2026-01-09',
          planEnd: '2026-01-11',
          actualStart: '2026-01-09',
          actualEnd: '2026-01-10',
          assignedWorkerId: 'EMP003',
          submittedFile: 'po_delivery_inspection_B.pdf',
          submittedAt: '2026-01-10 15:45',
          reviewedAt: '2026-01-10 16:30',
          reviewResult: 'pass',
          feedback: 'อุปกรณ์มาครบตรงตามสเปก ตรวจรับเรียบร้อย'
        },
        {
          id: 'step-3',
          stepNumber: 3,
          name: 'ขั้นตอนที่ 3',
          description: 'ติดตั้งตู้คอนโทรลและเดินสายไฟสัญญาณ',
          status: 'เสร็จสิ้น',
          evident: 'C',
          evidentDescription: 'ภาพถ่ายการติดตั้งตู้คอนโทรลและการทดสอบฉนวนสายไฟ (C)',
          planStart: '2026-01-11',
          planEnd: '2026-01-12',
          actualStart: '2026-01-10',
          actualEnd: '2026-01-10',
          assignedWorkerId: 'EMP003',
          submittedFile: 'wiring_installation_photos_C.pdf',
          submittedAt: '2026-01-10 17:15',
          reviewedAt: '2026-01-10 18:00',
          reviewResult: 'pass',
          feedback: 'งานเดินสายไฟเรียบร้อย ปลอดภัยตามมาตรฐาน'
        },
        {
          id: 'step-4',
          stepNumber: 4,
          name: 'ขั้นตอนที่ 4',
          description: 'ลงโปรแกรม PLC และทดสอบระบบสัญญาณ IO',
          status: 'กำลังดำเนินการ',
          evident: 'XXX',
          evidentDescription: 'รายงานผลการทดสอบ I/O Signal Test Sheet',
          planStart: '2026-01-12',
          planEnd: '2026-01-14',
          actualStart: '2026-01-12',
          actualEnd: null,
          assignedWorkerId: 'EMP003',
          submittedFile: null,
          submittedAt: null,
          reviewedAt: null,
          reviewResult: null,
          feedback: null
        },
        {
          id: 'step-5',
          stepNumber: 5,
          name: 'ขั้นตอนที่ 5',
          description: 'ทดสอบการทำงานจริงร่วมกับสายการผลิต (Commissioning)',
          status: 'รอขั้นตอนก่อนหน้า',
          evident: 'XXX',
          evidentDescription: 'เอกสารผลการทดสอบ Commissioning และส่งมอบงานขั้นสุดท้าย',
          planStart: '2026-01-14',
          planEnd: '2026-01-16',
          actualStart: null,
          actualEnd: null,
          assignedWorkerId: 'EMP003',
          submittedFile: null,
          submittedAt: null,
          reviewedAt: null,
          reviewResult: null,
          feedback: null
        }
      ]
    },
    {
      id: 'proj-002',
      code: 'PRJ-2026-002',
      name: 'โครงการปรับปรุงระบบคลังสินค้าอัจฉริยะ (Smart Warehouse)',
      description: 'ติดตั้งระบบ Barcode & RFID Scanner เชื่อมต่อระบบ ERP',
      status: 'เสร็จสิ้น',
      createdAt: '2025-12-01',
      targetEndDate: '2026-01-05',
      inspectorId: 'EMP004',
      creatorId: 'EMP002',
      currentPlanRevision: 1,
      steps: [
        {
          id: 'p2-s1',
          stepNumber: 1,
          name: 'ขั้นตอนที่ 1',
          description: 'จัดซื้อเครื่องอ่าน RFID',
          status: 'เสร็จสิ้น',
          evident: 'DOC-01',
          planStart: '2025-12-05',
          planEnd: '2025-12-15',
          actualStart: '2025-12-05',
          actualEnd: '2025-12-14',
          assignedWorkerId: 'EMP003',
          reviewResult: 'pass'
        },
        {
          id: 'p2-s2',
          stepNumber: 2,
          name: 'ขั้นตอนที่ 2',
          description: 'ทดสอบเชื่อมต่อ API ERP',
          status: 'เสร็จสิ้น',
          evident: 'DOC-02',
          planStart: '2025-12-16',
          planEnd: '2026-01-05',
          actualStart: '2025-12-16',
          actualEnd: '2026-01-04',
          assignedWorkerId: 'EMP003',
          reviewResult: 'pass'
        }
      ]
    },
    {
      id: 'proj-003',
      code: 'PRJ-2026-003',
      name: 'โครงการติดตั้ง Solar Rooftop โรงงานผลิต 2',
      description: 'ติดตั้งแผงโซลาร์เซลล์ 150kW เพื่อประหยัดพลังงาน',
      status: 'ล่าช้า',
      createdAt: '2026-01-02',
      targetEndDate: '2026-01-12',
      inspectorId: 'EMP004',
      creatorId: 'EMP002',
      currentPlanRevision: 1,
      steps: [
        {
          id: 'p3-s1',
          stepNumber: 1,
          name: 'ขั้นตอนที่ 1',
          description: 'ขออนุญาตการไฟฟ้าและสิ่งแวดล้อม',
          status: 'เสร็จสิ้น',
          evident: 'PERMIT-A',
          planStart: '2026-01-02',
          planEnd: '2026-01-06',
          actualStart: '2026-01-02',
          actualEnd: '2026-01-06',
          assignedWorkerId: 'EMP003',
          reviewResult: 'pass'
        },
        {
          id: 'p3-s2',
          stepNumber: 2,
          name: 'ขั้นตอนที่ 2',
          description: 'ติดตั้งโครงสร้างหลังคาและแผงเซลล์',
          status: 'กำลังดำเนินการ',
          evident: 'MOUNT-B',
          planStart: '2026-01-07',
          planEnd: '2026-01-10',
          actualStart: '2026-01-08',
          actualEnd: null,
          assignedWorkerId: 'EMP003',
          reviewResult: null
        }
      ]
    }
  ],
  planChangeRequests: [
    // Requests for revising plan when project is already in progress
  ],
  submissions: [
    // Submissions waiting for or reviewed by inspector
  ],
  lineNotifications: [
    {
      id: 'notif-1',
      recipientName: 'ดนัย ผู้ตรวจงาน',
      recipientLineId: '@inspector_danai',
      projectName: 'โครงการติดตั้งระบบควบคุมการผลิตอัตโนมัติ (Automation Line)',
      stepName: 'ขั้นตอนที่ 3',
      action: 'ส่งงานเพื่อรับการตรวจ',
      message: '🔔 [แจ้งเตือนส่งงานใหม่]\n📌 โครงการ: โครงการติดตั้งระบบควบคุมการผลิตอัตโนมัติ\n📋 ขั้นตอน: ขั้นตอนที่ 3 (ติดตั้งตู้คอนโทรลและเดินสายไฟสัญญาณ)\n👤 ผู้ส่งงาน: วิชัย ผู้ส่งงาน/ปฏิบัติงาน\n📎 เอกสารแนบ: wiring_installation_photos_C.pdf\n🔗 กรุณาเข้าสู่ระบบเพื่อทำการตรวจรับงาน',
      timestamp: '2026-01-10 17:15',
      status: 'delivered'
    },
    {
      id: 'notif-2',
      recipientName: 'วิชัย ผู้ส่งงาน/ปฏิบัติงาน',
      recipientLineId: '@worker_wichai',
      projectName: 'โครงการติดตั้งระบบควบคุมการผลิตอัตโนมัติ (Automation Line)',
      stepName: 'ขั้นตอนที่ 3',
      action: 'แจ้งผลการตรวจงาน',
      message: '✅ [ผลการตรวจงานโครงการ: ผ่านการประเมิน]\n📌 โครงการ: โครงการติดตั้งระบบควบคุมการผลิตอัตโนมัติ\n📋 ขั้นตอน: ขั้นตอนที่ 3 (ติดตั้งตู้คอนโทรลและเดินสายไฟสัญญาณ)\n📊 ผลการตรวจ: ผ่าน (Pass)\n💬 คำแนะนำ: งานเดินสายไฟเรียบร้อย ปลอดภัยตามมาตรฐาน',
      timestamp: '2026-01-10 18:00',
      status: 'delivered'
    }
  ]
};

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
        this.data = INITIAL_DATA;
      } else {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error initializing database:', err);
      this.data = INITIAL_DATA;
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  getUsers() { return this.data.users; }
  getUserById(id) { return this.data.users.find(u => u.id === id || u.employeeId === id); }
  getUserByUsername(username) { return this.data.users.find(u => u.username === username); }
  
  saveUser(userData) {
    const existingIndex = this.data.users.findIndex(u => u.id === userData.id || u.employeeId === userData.employeeId);
    if (existingIndex >= 0) {
      this.data.users[existingIndex] = { ...this.data.users[existingIndex], ...userData };
    } else {
      this.data.users.push(userData);
    }
    this.save();
    return userData;
  }

  deleteUser(id) {
    this.data.users = this.data.users.filter(u => u.id !== id && u.employeeId !== id);
    this.save();
  }

  getProjects() { return this.data.projects; }
  getProjectById(id) { return this.data.projects.find(p => p.id === id); }
  
  saveProject(project) {
    const idx = this.data.projects.findIndex(p => p.id === project.id);
    if (idx >= 0) {
      this.data.projects[idx] = project;
    } else {
      this.data.projects.push(project);
    }
    this.save();
    return project;
  }

  getChangeRequests(projectId = null) {
    if (!projectId) return this.data.planChangeRequests || [];
    return (this.data.planChangeRequests || []).filter(r => r.projectId === projectId);
  }

  saveChangeRequest(req) {
    if (!this.data.planChangeRequests) this.data.planChangeRequests = [];
    const idx = this.data.planChangeRequests.findIndex(r => r.id === req.id);
    if (idx >= 0) {
      this.data.planChangeRequests[idx] = req;
    } else {
      this.data.planChangeRequests.unshift(req);
    }
    this.save();
    return req;
  }

  addLineNotification(notif) {
    if (!this.data.lineNotifications) this.data.lineNotifications = [];
    this.data.lineNotifications.unshift(notif);
    this.save();
    return notif;
  }

  getLineNotifications() {
    return this.data.lineNotifications || [];
  }
}

export const db = new Database();

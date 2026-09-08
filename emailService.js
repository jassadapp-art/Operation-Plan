import { db } from './db.js';

export async function sendEmailNotification({ recipientUser, projectName, stepName, action, message }) {
  const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  const notifRecord = {
    id: 'notif-' + Date.now(),
    recipientName: recipientUser?.name || 'ไม่ระบุผู้รับ',
    recipientEmail: recipientUser?.email || 'general@company.com',
    projectName,
    stepName,
    action,
    message,
    timestamp,
    status: 'delivered'
  };

  db.addLineNotification(notifRecord);
  console.log(`\n📧 [EMAIL NOTIFICATION SENT] To: ${notifRecord.recipientName} <${notifRecord.recipientEmail}>\nAction: ${action}\n${message}\n`);
  return notifRecord;
}

export const sendLineNotification = sendEmailNotification;

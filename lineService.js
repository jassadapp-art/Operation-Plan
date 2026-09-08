import { db } from './db.js';

export async function sendLineNotification({ recipientUser, projectName, stepName, action, message }) {
  const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  const notifRecord = {
    id: 'notif-' + Date.now(),
    recipientName: recipientUser?.name || 'ไม่ระบุผู้รับ',
    recipientLineId: recipientUser?.lineId || '@general',
    projectName,
    stepName,
    action,
    message,
    timestamp,
    status: 'delivered'
  };

  // If user has a real LINE Notify token, attempt to send via LINE Notify API
  if (recipientUser?.lineToken && recipientUser.lineToken.trim() !== '') {
    try {
      const response = await fetch('https://notify-api.line.me/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${recipientUser.lineToken.trim()}`
        },
        body: new URLSearchParams({ message: '\n' + message })
      });
      if (response.ok) {
        notifRecord.status = 'sent_to_line_notify';
      } else {
        notifRecord.status = 'line_notify_error';
      }
    } catch (err) {
      console.warn('LINE Notify network call failed (using simulated log):', err.message);
      notifRecord.status = 'simulated_due_to_network';
    }
  }

  db.addLineNotification(notifRecord);
  console.log(`\n📨 [LINE NOTIFICATION SENT] To: ${notifRecord.recipientName} (${notifRecord.recipientLineId})\n${message}\n`);
  return notifRecord;
}

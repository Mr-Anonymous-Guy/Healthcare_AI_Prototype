import { Resend } from 'resend';

let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface AppointmentEmailParams {
  toEmail: string;
  patientName: string;
  doctorName: string;
  department?: string | null;
  appointmentDate: string;
  notes?: string | null;
}

/**
 * Send appointment confirmation email via Resend
 */
export async function sendAppointmentConfirmationEmail({
  toEmail,
  patientName,
  doctorName,
  department,
  appointmentDate,
  notes,
}: AppointmentEmailParams) {
  try {
    const resend = getResendClient();
    const formattedDate = new Date(appointmentDate).toLocaleString(undefined, {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
            .card { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: bold; color: #1e3a8a; margin: 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .label { font-weight: 600; color: #64748b; }
            .value { font-weight: 500; color: #0f172a; text-align: right; }
            .notes-box { background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 13px; color: #334155; margin-top: 16px; }
            .footer { margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2 class="title">HealthAI — Appointment Confirmed</h2>
            </div>
            <p>Hello <strong>${patientName || 'Patient'}</strong>,</p>
            <p>Your appointment has been successfully scheduled. Here are the details:</p>
            
            <div class="detail-row">
              <span class="label">Doctor</span>
              <span class="value">${doctorName}</span>
            </div>
            ${
              department
                ? `<div class="detail-row"><span class="label">Department</span><span class="value">${department}</span></div>`
                : ''
            }
            <div class="detail-row">
              <span class="label">Date & Time</span>
              <span class="value">${formattedDate}</span>
            </div>
            
            ${
              notes
                ? `<div class="notes-box"><strong>Notes:</strong> ${notes}</div>`
                : ''
            }
            
            <div class="footer">
              <p>HealthAI Prototype • Medical Assistant (Not a diagnosis tool)</p>
              <p>If you need to reschedule, please visit your account dashboard.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: 'HealthAI Assistant <onboarding@resend.dev>',
      to: [toEmail],
      subject: `Appointment Confirmed: ${doctorName} - ${formattedDate}`,
      html: htmlContent,
    });

    return { success: true, id: result.data?.id };
  } catch (error: any) {
    console.warn('Resend email notice (non-fatal):', error.message);
    return { success: false, error: error.message };
  }
}

import { Resend } from 'resend';
// The RESEND_API_KEY should be in your .env file
const resend = new Resend(process.env.RESEND_API_KEY || 're_ffymwusp_JRuHDd7YPZ9QBMUhQSP4QvRa');
export const EmailService = {
    /**
     * Sends an approval email when the admin approves the account
     */
    sendApprovalEmail: async (email, name = 'User') => {
        try {
            const { data, error } = await resend.emails.send({
                from: 'ZYVORA <onboarding@resend.dev>', // Resend's default testing domain
                to: [email],
                subject: 'Your ZYVORA Account is Approved! 🎉',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #2e7d32;">Great news, ${name}!</h2>
            <p>Your account has been fully verified and approved by our administration team.</p>
            <p>You can now log in to your dashboard and start making an impact immediately.</p>
            <a href="http://localhost:5173" style="display: inline-block; background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">Login to ZYVORA</a>
            <br/><br/>
            <p>Best regards,</p>
            <p><strong>The ZYVORA Team</strong></p>
          </div>
        `,
            });
            if (error) {
                console.error('Resend API Error:', error);
                return false;
            }
            console.log('Approval email sent successfully:', data);
            return true;
        }
        catch (err) {
            console.error('Failed to send email:', err);
            return false;
        }
    }
};

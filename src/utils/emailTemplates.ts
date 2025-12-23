import { IEmailTemplate } from "../app/modules/support/support.interface";
export class EmailTemplates {
    private static escapeHtml(text: string): string {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    static userConfirmation(name: string, subject: string): IEmailTemplate {
        return {
            subject: "We received your message - Support",
            html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Thank you for contacting us!</h2>
                        <p>Hi ${this.escapeHtml(name)},</p>
                        <p>We've received your message regarding: <strong>${this.escapeHtml(subject)}</strong></p>
                        <p>Our support team will review your message and get back to you soon.</p>
                        <br>
                        <p>Best regards,<br>Support Team</p>
                    </div>
                  `

        }
    }

    static adminReply(name: string, subject: string, originalMessage: string, reply: string): IEmailTemplate {
        return {
            subject: `Re: ${subject} `,
            html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Response from Support Team</h2>
                        <p>Hi ${this.escapeHtml(name)},</p>
                        <p>Thank you for your patience. Here's our response to your inquiry:</p>
                    
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <strong>Admin Reply:</strong>
                            <p style="margin-top: 10px;">${this.escapeHtml(reply).replace(/\n/g, '<br>')}</p>
                        </div>
                    
                        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <strong>Your Original Message:</strong>
                            <p style="margin-top: 10px; color: #666;">${this.escapeHtml(originalMessage).replace(/\n/g, '<br>')}</p>
                        </div>
                    
                        <p>If you have any further questions, feel free to reach out again.</p>
                        <br>
                        <p>Best regards,<br>Support Team</p>
                    </div>
                  `,
        }
    }
}
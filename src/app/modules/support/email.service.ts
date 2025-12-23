
import { Transporter } from "nodemailer";
import { createEmailTransporter } from "../../config/email.config";
import { IEmailResult, IEmailTemplate } from "./support.interface";
import { enVars } from "../../config/env";

export class EmailService {
    private transporter: Transporter;
    
    constructor() {
        this.transporter = createEmailTransporter();
    }
    
    async sendEmail(to: string, template: IEmailTemplate): Promise<IEmailResult> {
        try {
            const mailOptions = {
                from: `Support Team <${enVars.EMAIL_SENDER.SMTP_USER}>`,
                to,
                subject: template.subject,
                html: template.html
            };
            
            const info = await this.transporter.sendMail(mailOptions);
            
            return {
                success: true,
                messageId: info.messageId
            };
        } catch (error) {
            console.error('Email sending error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error"
            };
        }
    }
}
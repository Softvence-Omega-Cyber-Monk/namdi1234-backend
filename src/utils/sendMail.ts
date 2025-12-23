import nodemailer from "nodemailer"
import { enVars } from "../app/config/env"

const transporter = nodemailer.createTransport({
    secure: true,
    auth: {
        user: enVars.EMAIL_SENDER.SMTP_USER,
        pass: enVars.EMAIL_SENDER.SMTP_PASS
    },
    port: Number(enVars.EMAIL_SENDER.SMTP_PORT),
    host: enVars.EMAIL_SENDER.SMTP_HOST
})

interface SendEmailOptions {
    to: string,
    subject: string,
    template: string,
    templateData ?: Record<string, any>
    attachments?: {
        filename: string,
        content: Buffer | string,
        contentType: string
    }[]
}

export const sendEmail = async({to, subject, template,templateData, attachments} : SendEmailOptions) => {
    const info = await transporter.sendMail({
        from: enVars.EMAIL_SENDER.SMTP_FROM,
        to: to,
        subject: subject,
        html: template,
        attachments: attachments?.map(attachment => ({
            filename: attachment.filename,
            content: attachment.content,
            contentType: attachment.contentType
        }))
    })
}

import nodemailer, {Transporter} from 'nodemailer'
import { enVars } from './env'
export const createEmailTransporter = () : Transporter => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: enVars.EMAIL_SENDER.SMTP_USER as string,
            pass: enVars.EMAIL_SENDER.SMTP_PASS as string
        }
    })
    transporter.verify((error, success) => {
        if(error){
            console.error(error)
        }
        console.log("Email server is ready")
    })
    return transporter
}
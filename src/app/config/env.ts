import dotenv from "dotenv"
dotenv.config()


interface EnvConfig {
    PORT: string,
    DB_URL: string,
    NODE_ENV: "development" | "production",
    CLOUDINARY : {
        CLOUDINARY_API_KEY : string,
        CLOUDINARY_CLOUD_NAME : string,
        CLOUDINARY_API_SECRET : string
    },
    EMAIL_SENDER: {
        SMTP_USER: string,
        SMTP_PASS: string,
        SMTP_PORT: string,
        SMTP_HOST: string,
        SMTP_FROM: string,
    }
}


export const enVars:EnvConfig = {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    CLOUDINARY: {
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string
    },
    EMAIL_SENDER: {
        SMTP_USER: process.env.SMTP_USER as string,
        SMTP_PASS: process.env.SMTP_PASS as string,
        SMTP_PORT: process.env.SMTP_PORT as string,
        SMTP_HOST: process.env.SMTP_HOST as string,
        SMTP_FROM: process.env.SMTP_FROM as string,
    }
}

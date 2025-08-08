import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string,
    name: string,
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user:IEmail) => {
        // Enviamos el Email
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Confirma Tu Cuenta',
            text: 'UpTask - Confirma Tu Cuenta',
            html: `<p>Hola: ${user.name}, has creado tu cuenta en UpTask, ya casi esta todo listo, como ultimo paso
                solo debes confirmar tu cuenta</p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm_account">Confirmar Cuenta</a>
                <p>El ingresa el codigo: <b>${user.token}</b></p>
                <p>¡Este Token expira en  10 minutos!</p>
                `
        })

        console.log('Mensaje enviado', info.messageId)
    }

    static sendPasswordResetToken = async (user:IEmail) => {
        // Enviamos el Email
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Reestablece tu password',
            text: 'UpTask - Confirma Tu Cuenta',
            html: `<p>Hola: ${user.name}, has solicitado reestablecer tu password. Visita el siguiente enlace
                para reestablecerla:</p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer Password</a>
                <p>El ingresa el codigo: <b>${user.token}</b></p>
                <p>¡Este Token expira en  10 minutos!</p>
                `
        })

        console.log('Mensaje enviado', info.messageId)
    }
}
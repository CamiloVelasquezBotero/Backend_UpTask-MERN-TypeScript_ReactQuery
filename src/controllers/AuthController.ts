import { Request, Response } from 'express'
import User from '../models/User'
import Token from '../models/Token'
import { checkPassword, hashPassword } from '../utils/auth'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'
import { generateJWT } from '../utils/jwt'

export class AuthController {

    static createAccount = async (req:Request, res:Response) => {
        try {
            const { password, email } = req.body

            // Prevenir Duplicados
            const userExists = await User.findOne({email})
            if(userExists) {
                const error = new Error('El usuario ya se encuentra registrado')
                return res.status(409).json({error: error.message})
            } 

            // Crea un usuario
            const user = new User(req.body)

            // Hasheamos con la funcion creada aparte de bcrypt
            user.password = await hashPassword(password)
            await user.save() /* Guardamos el nuevo usuario */

            // Generamos el Token
            const token = new Token() // Creamos el modelo del token
            token.token = generateToken() // Le generamos el token al modelo
            token.user = user.id // Le guardamos el ID del user al que pertenece al Token

            AuthEmail.sendConfirmationEmail({ // Enviamso el correo de confirmacion
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()]) // Guardamos los dos modelos instanciados

            res.send('Cuenta Creada, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static confirmAccount = async (req:Request, res:Response) => {
        try {
            // Verificamos que exista el token
            const { token } = req.body
            const tokenExists = await Token.findOne({token})
            if(!tokenExists) {
                const error = new Error('Token no valido')
                return res.status(404).json({error: error.message})
            }

            // Buscamso el usuario correspondiente para confirmarlo
            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            // Guardamos los cambios del usuario y eliminamos el token
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Cuenta confirmada correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static login = async (req:Request, res:Response) => {
        try {
            // Instanciamos lo que viene ene l body y el usuario buscado por su Email
            const { email, password } = req.body
            const user = await User.findOne({email})

            // Verificamos la existencia del usuario y su confirmacion
            if(!user) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({error: error.message})
            }
            if(!user.confirmed) {
                const token = new Token()   // Creamos el modelo del token
                token.user = user.id    // Le agregamos el usuario al que le corresponde este token
                token.token = generateToken()   // Agregamos el token generado al modelo
                token.save()

                // Volvemos enviar Email de confirmacion
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                }) 

                // Lanzamos el error
                const error = new Error('Tu cuenta no ha sido confirmada, hemos enviado un e-mail de confirmacion')
                return res.status(404).json({error: error.message})
            }

            // Verificamos el password como ultimo paso
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect) {
                const error = new Error('Password incorrecto')
                return res.status(401).json({error: error.message})
            }

            const token = generateJWT({id:user.id})

            res.send(token)
            
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static requestConfirmationCode = async (req:Request, res:Response) => {
        try {
            const { email } = req.body

            // Validar existencia de usuario
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error('El usuario no esta registrado')
                return res.status(409).json({error: error.message})
            }

            // Revisamos si ya esta confirmado
            if(user.confirmed) {
                const error = new Error('El usuario ya esta confirmado')
                return res.status(409).json({error: error.message})
            }

            // Generamos un nuevo Token
            const token = new Token() // Creamos el modelo del token
            token.token = generateToken() // Le generamos el token al modelo
            token.user = user.id // Le guardamos el ID del user al que pertenece al Token
            await token.save()

            AuthEmail.sendConfirmationEmail({ // Enviamso el correo de confirmacion
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send('Hemos enviado un nuevo token, revisa tu E-mail para confirmar')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static forgotPassword = async (req:Request, res:Response) => {
        try {
            const { email } = req.body

            // Validar existencia de usuario
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error('El usuario no esta registrado')
                return res.status(409).json({error: error.message})
            }

            // Generamos El token para generar el new password
            const token = new Token() // Creamos el modelo del token
            token.token = generateToken() // Le generamos el token al modelo
            token.user = user.id // Le guardamos el ID del user al que pertenece al Token
            await token.save()

            AuthEmail.sendPasswordResetToken({ // Enviamso el correo de confirmacion
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send('Revisa tu Email para las instrucciones')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static validateToken = async (req:Request, res:Response) => {
        try {
            // Verificamos que exista el token
            const { token } = req.body
            const tokenExists = await Token.findOne({token})
            if(!tokenExists) {
                const error = new Error('Token no valido')
                return res.status(404).json({error: error.message})
            }

            res.send('Token Valido, Define tu nuevo password')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updatePasswordWithToken = async (req:Request, res:Response) => {
        try {
            // Verificamos que exista el token
            const { token } = req.params
            const { password } = req.body

            const tokenExists = await Token.findOne({token})
            if(!tokenExists) {
                const error = new Error('Token no valido')
                return res.status(404).json({error: error.message})
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(password)
            
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send('El password ha sido modificado correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static user = async (req:Request, res:Response) => {
        return res.json(req.user) // Solo retornaremos el usuario autenticado
    }

    static updateProfile = async (req:Request, res:Response) => {
        const { name, email } = req.body

        // Comprobamos si ya existe el email y si es el mismo usuario el que intenta ingresarlo
        const userExists = await User.findOne({email})
        if(userExists && userExists._id.toString() !== req.user._id.toString()) {
            const error = new Error('El Email ya se encuentra registrado')
            return res.status(409).json({error: error.message})
        }

        // Actualizamos
        req.user.name = name
        req.user.email = email

        // Guardamos
        try {
            await req.user.save()
            res.send('Actualizado correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateCurrentUserPassword = async (req:Request, res:Response) => {
        const { currentPassword, password } = req.body

        const user = await User.findById(req.user._id)

        // Verificacion si es correcto el currenPassword
        const isPasswordCorrect = await checkPassword(currentPassword, user.password)
        if(!isPasswordCorrect) {
            const error = new Error('The current Passowrd is incorrect')
            return res.status(401).json({error: error.message})
        }
        
        // Hasheamos y guardamos el password
        user.password = await hashPassword(password)
        try {
            await user.save()
            res.send('The password was changed successfully')
        } catch (error) {
            res.status(500).json({error: 'There was an error'})
        }
        
    }

    static checkPassword = async (req:Request, res:Response) => {
        const { password } = req.body
        const user = await User.findById(req.user._id)

        // Verificacion si es correcto el currenPassword
        const isPasswordCorrect = await checkPassword(password, user.password)
        if(!isPasswordCorrect) {
            const error = new Error('El Password actual es incorrecto')
            return res.status(401).json({error: error.message})
        }

        res.send('Password Correcto')
    }
}
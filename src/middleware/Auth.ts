import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'

declare global { /* Configuracion el type de Request de express para que acepte pasar el usuario por el req */
    namespace Express { // Elegimos la libreria
        interface Request { // Elegimos el tipado a sobreescribir
            user?:IUser // sobreescribimo y Le ponemos el (?) para decirle que no siempre estara en Request
        }
    }
}

export const authenticate = async (req:Request, res:Response, next:NextFunction) => {
    // Comprobamos que venga por Bearer Token
    const bearer = req.headers.authorization
    if(!bearer) {
        const error = new Error('No Autorizado')
        return res.status(401).json({error: error.message})
    }

    // Eliminamos el Bearer del token
    const token = bearer.split(' ')[1] // Separamos en arreglo cuando encuentre el espacio, y tomamos la posicion 1

    try {
        // Verificamos el token, pasando los 2 parametros necesarios
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // Verificamos la existencia del usuario
        if(typeof decoded === 'object' && decoded.id) { // Comprobamos para ts
            const user = await User.findById(decoded.id).select('_id name email') // Seleccionamos solo los valores que queremos
            if(user) {
                req.user = user // Si existe enviamso el usuario en el Request
                next() // Enviamos al siguinte middleware
            } else {
                res.status(500).json({error: 'Token No Valido'})
            }
        }
    } catch (error) {
        res.status(500).json({error: 'Token No Valido'})
    }
}
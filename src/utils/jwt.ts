import jwt from 'jsonwebtoken'
import Types from 'mongoose'

type UserPayload = {
    id: Types.ObjectId
}

export const generateJWT = (payload:UserPayload) => {
    // Creamos la firma del JWT, al cual se le pasa 3 parametros (datos, palabrasecreta, opciones)
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '180d' // 6 meses
    })
    return token
}
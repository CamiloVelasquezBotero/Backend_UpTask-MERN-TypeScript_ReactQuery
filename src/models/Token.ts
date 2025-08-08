import mongoose, { Document, Schema, Types } from "mongoose";

export interface IToken extends Document {
    token: string,
    user: Types.ObjectId,
    createdAt: Date
}

const tokenSchema:Schema = new Schema({
    token: {
        type: String,
        required: true
    },
    user: {
        type: String,
        ref: 'User'
    },
    expiresAt: { // Al colocar un expires, se recomienda usar mejor (expiresAt) que createdAt
        type: Date,
        default: Date.now(),  // Creamos la fecha actual
        expires: '10m'   // Le pondemos poner '1d' de un dia, o en este caso de 10 minutos
    }
})

const Token = mongoose.model<IToken>('Token', tokenSchema)
export default Token
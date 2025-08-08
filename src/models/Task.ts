import mongoose, { Schema, Document, Types} from 'mongoose'
import Note from './Note'

const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: 'onHold',
    IN_PROGRESS: 'inProgress',
    UNDER_REVIEW: 'underReview',
    COMPLETE: 'complete'
} as const

export type TaskStatus = typeof taskStatus[keyof typeof taskStatus] /* Establecemos el type con los valores de las keys de taskStatus */

// export type TaskType = Document & Document {}    /* Con type */
export interface ITask extends Document {
    name: string,
    description: string,
    project: Types.ObjectId,
    status: TaskStatus,
    completedBy: { // Sera un array de arreglos que llevara el user y el status modificado
        user: Types.ObjectId,
        status: TaskStatus
    }[]
    notes: Types.ObjectId[]
}

export const TaskSchema:Schema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    project: {
        type: Types.ObjectId,
        ref: 'Project'  // Referencia al modelo que pertenece
    },
    status: {
        type: String,
        enum: Object.values(taskStatus),
        default: taskStatus.PENDING
    },
    completedBy: [
        {
            user: {
                type: Types.ObjectId,
                ref: 'User',
                default: null // Cuando se cree quedara como null, por que aun nadie la ha modificado
            },
            status: {
                type: String,
                enum: Object.values(taskStatus),
                default: taskStatus.PENDING
            }
        }
    ],
    notes: [
        {
            type: Types.ObjectId,
            ref: 'Note'
        }
    ]
}, {timestamps: true}) /* Habilitar lineas de actualizaciones */

// Middleware de mongoose, para los modelos, cuando se haga uso de un metodo del modelo, en este caso (deleteOne)
// (document) retorna el documento que estamos eliminando o manejando en este (pre)
// (query) middleware se ejecuta sobre la consulta que elimina, this es la consulta, no el documento.
TaskSchema.pre('deleteOne', {document: true}, async function() { // NO puede ser un Arrow-Function por que usaremos this
    const taskId = this._id // Instanciamos la tare que eliminamos
    if(!taskId) return // por alguna  razon no esta retornamos
    await Note.deleteMany({task: taskId}) // Eliminamos todas las que esten relacionadas con este taskId
    
})

const Task = mongoose.model<ITask>('Task', TaskSchema)
export default Task
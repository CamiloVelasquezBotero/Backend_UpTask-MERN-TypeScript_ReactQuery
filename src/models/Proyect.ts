import mongoose, { Schema, Document, PopulatedDoc, Types } from 'mongoose'
import Task, { ITask } from './Task'
import { IUser } from './User'
import Note from './Note'

// export type ProjectType = Document & {}      /* Con Type */
export interface IProject extends Document {    /* Con interface */
    projectName: string
    clientName: string
    description: string
    tasks: PopulatedDoc<ITask & Document>[]     // Como arreglo por que seran muchas
    manager: PopulatedDoc<IUser & Document>
    team: PopulatedDoc<IUser & Document>[] // Seran varios en el equipo entonces como arreglo
}

const ProjectSchema:Schema = new Schema({
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    tasks: [
        {
            type: Types.ObjectId,
            ref: 'Task'
        }
    ],
    manager: {
        type: Types.ObjectId,
        ref: 'User'
    },
    team: [
        {
            type: Types.ObjectId,
            ref: 'User'
        }
    ]
}, {timestamps: true}) /* Habilitar lineas de actualizaciones */

// Middleware de mongoose, para los modelos, cuando se haga uso de un metodo del modelo, en este caso (deleteOne)
// (document) retorna el documento que estamos eliminando o manejando en este (pre)
// (query) middleware se ejecuta sobre la consulta que elimina, this es la consulta, no el documento.
ProjectSchema.pre('deleteOne', {document: true}, async function() { // NO puede ser un Arrow-Function por que usaremos this
    const projectId = this._id // Instanciamos la tare que eliminamos
    if(!projectId) return // por alguna  razon no esta retornamos

    // Buscamos todas las tareas que pertenezcan a aest eproyecto antes de eliminarlo para eliminar sus notas
    const tasks = await Task.find({project: projectId})
    for(const task of tasks) {
        await Note.deleteMany({task: task._id})
    }

    // Una vez eliminadas las ntoas eliminamos las tareas
    await Task.deleteMany({project: projectId}) // Eliminamos todas las que esten relacionadas con este projectId
})

const Project = mongoose.model<IProject>('Project', ProjectSchema)
export default Project
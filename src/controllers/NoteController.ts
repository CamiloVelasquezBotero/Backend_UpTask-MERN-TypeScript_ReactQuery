import type { Request, Response } from 'express'
import Note, { INote } from '../models/Note'
import { Types } from 'mongoose'

type NoteParams = {
    noteId: Types.ObjectId
}

export class NoteController {
    // <Params, ResBody, ReqBody, ReqQuery> estos son los 4 parametros que se le pasa en el generic para tiparlo
    static createNote = async (req:Request<{}, {}, INote>, res:Response) => {
        // Creamos la instnacia de la nota
        const { content } = req.body
        const note = new Note 
         
        // Llenamos la nota
        note.content = content
        note.createdBy = req.user.id
        note.task = req.task.id
        // Registramos tambien la nota a la tarea que pertenece
        req.task.notes.push(note.id)

        // Gurdamos ambos modelos
        try {
            await Promise.allSettled([note.save(), req.task.save()])
            res.send('Nota creada correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }

    }

    static getTaskNotes = async (req:Request<{}, {}, {}>, res:Response) => {
        try {
            const notes = await Note.find({task: req.task.id})
            res.json(notes)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static deleteNote = async (req:Request<NoteParams>, res:Response) => {
        // Instanciamos
        const { noteId } = req.params
        const note = await Note.findById(noteId)

        // Comprobamos que exista la nota
        if(!note) {
            const error = new Error('Nota no encontrada')
            return res.status(404).json({error: error.message})
        }
        // Verificamos que la persona que eliminara es quien la creo
        if(note.createdBy.toString() !== req.user.id.toString()) {
            const error = new Error('Accion no valida')
            return res.status(401).json({error: error.message})
        }

        // Filtramos la nota que eliminamos de la tarea para que no aparezca
        req.task.notes = req.task.notes.filter(note => note.toString() !== noteId.toString())
        try {
            // Eliminamos y guardamos
            await Promise.allSettled([req.task.save(), note.deleteOne()])
            res.send('Nota eliminada')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
    
}
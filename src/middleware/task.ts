import type { Request, Response, NextFunction } from 'express'
import Task, { ITask } from '../models/Task'

// Reeescribimos el request para pode pasar informacion ya que estamos usando TypeScript
declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function taskExists(req:Request, res:Response, next:NextFunction) {
    try {
        const { taskId } = req.params
        const task = await Task.findById(taskId)
        if(!task) {
            const error = new Error('Tarea no encontrado')
            return res.status(404).json({error: error.message})
        }
        
        req.task = task // Enviamos el proyecto al la sigueinte funcion
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

export function taskBeLongsToProject(req:Request, res:Response, next:NextFunction) {
    // Validacion si la tarea a buscar existe en el proyecto
    if (req.task.project.toString() !== req.project.id.toString()) { // lo convertimos a string para poder que la lea correctamente como viene de mongo
        const error = new Error('Accion no valida')
        return res.status(400).json({ error: error.message })
    }
    next()
}

export function hasAuthorization(req:Request, res:Response, next:NextFunction) {
    // Validamos si el usuario registrado es el manager del project
    if (req.user.id.toString() !== req.project.manager.toString()) { // El usuario autenticado es diferente al manager del project?
        const error = new Error('Accion no valida')
        return res.status(400).json({ error: error.message })
    }
    next()
}
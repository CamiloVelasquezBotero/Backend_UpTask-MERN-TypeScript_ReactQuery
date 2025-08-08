import type { Request, Response } from 'express'
import Task from '../models/Task'
import { IUser } from '../models/User'

export class TaskController {

    static createTask = async (req: Request, res: Response) => {

        try {
            const task = new Task(req.body) // Creamos tarea
            task.project = req.project.id // Agregamos id del proyecto al que pertenecera
            req.project.tasks.push(task.id) // Agregamos la tarea al proyecto

            // await task.save()       // Guardamos tarea
            // await req.project.save()    // Guardamos cambios en el projecto instanciado
            Promise.allSettled([task.save(), req.project.save()]) /* Mejoramos performance, sin tener que hacer 2 await a la vez */
            res.send('Tarea creada correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getProjectTask = async (req: Request, res: Response) => {
        try {
            /* En las llaves, (project: id) funciona como un tipo where para traerse todo lo relacinado con esa key */
            /* Nos traemos toda la informacion del proyecto tambin con (populate*/
            const tasks = await Task.find({ project: req.project.id }).populate('project')
            res.json(tasks)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try {
            // Aunque ya estamos pasando la tarea por el req, la necesitamos instanciar para usar el meetodo (populate) y traernos al usuario que la modifico
            const task = await Task.findById(req.task._id)
                        // Hacemos un populate para traernos los valores del path, y le indicamos que el del user tambien
                            .populate({path: 'completedBy.user', select: 'id name email'})
                            .populate({path: 'notes', populate: {path: 'createdBy', select: 'id name email'}}) // Populate dentro de un populate

            res.json(task)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {
            req.task.name = req.body.name
            req.task.description = req.body.description
            await req.task.save()
            res.send('Tarea actualizada correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static deleteTask = async (req: Request, res: Response) => {
        try {
            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task.id.toString()) /* Actualizamos la instancia del proyecto */
            await Promise.allSettled([req.task.deleteOne(), req.project.save()])
            res.send('Tarea Eliminada correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updateStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body
            req.task.status = status
            const data = {
                user: req.user.id,
                status
            }

            req.task.completedBy.push(data)
            await req.task.save()
            res.send('Tarea Actualizada')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }


}
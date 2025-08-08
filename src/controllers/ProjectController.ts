import type { Request, Response } from 'express'
import Project from '../models/Proyect'

export class ProjectController {

    static createProject = async (req:Request, res:Response) => {
        const project = new Project(req.body) /* Creamos la instancia del modelo con los datos del body */

        // Asignamos el manager que creo este proyecto
        project.manager = req.user.id
        
        try {
            await project.save() /* Guardamos en Mongo */
            // await Project.create(req.body)
            res.send('Project created successfully')
        } catch (error) {
            console.log(error)
        }
    }

    static getAllProjects = async (req:Request, res:Response) => {
        try {
            // const projects = await Project.find({manager: req.user.id}) // opcion 1
            const projects = await Project.find({
                $or: [
                    {manager: {$in: req.user.id}}, // Si es manager
                    {team: {$in: req.user.id}} // O si esta en el team como colaborador
                ]
            })
            res.json(projects)
        } catch (error) {
            console.log(error)
        }
    }

    static getProjectById = async (req:Request, res:Response) => {
        const { id } = req.params
        try {
            // Buscamos el projecto por su id y nos traemos sus tareas
            const project = await (await Project.findById(id))?.populate('tasks') /* Nos traemos tambien las tareas relacionadas con (populate) */
            if(!project) {
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({error: error.message})
            }

            // Verificamos si la persona que accede es el manager o alguien que este en el team
            if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
                const error = new Error('Accion no valida')
                return res.status(404).json({error: error.message})
            }

            res.json(project)
        } catch (error) {
            console.log(error)
        }
    }

    static UpdateProject = async (req:Request, res:Response) => {
        try {
            req.project.projectName = req.body.projectName
            req.project.clientName = req.body.clientName
            req.project.description = req.body.description
            await req.project.save()
            res.send('Proyecto actualizado')
        } catch (error) {
            console.log(error)
        }
    }
    static deleteProject = async (req:Request, res:Response) => {
        try {
            await req.project.deleteOne()
            res.send('Proyecto Eliminado')
        } catch (error) {
            console.log(error)
        }
    }

}

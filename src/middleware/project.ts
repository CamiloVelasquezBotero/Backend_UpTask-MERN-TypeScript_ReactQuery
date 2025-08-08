import type { Request, Response, NextFunction } from 'express'
import Project, { IProject } from '../models/Proyect'

// Reeescribimos el request para pode pasar informacion ya que estamos usando TypeScript
declare global {
    namespace Express {
        interface Request {
            project: IProject
        }
    }
}

export async function ProjectExists(req:Request, res:Response, next:NextFunction) {
    try {
        const { projectId } = req.params
        const project = await Project.findById(projectId)
        if(!project) {
            const error = new Error('Proyecto no encontrado')
            return res.status(404).json({error: error.message})
        }
        
        req.project = project // Enviamos el proyecto al la sigueinte funcion
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}
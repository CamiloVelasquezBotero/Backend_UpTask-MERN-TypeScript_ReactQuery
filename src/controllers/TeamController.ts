import { Request, Response } from "express"
import User from "../models/User"
import Project from "../models/Proyect"

export class TeamController {

    static findMemberByEmail = async (req:Request, res:Response) => {
        const { email } = req.body

        // Buscamos al usuario
        const user = await User.findOne({email}).select('id email name') // Con findOne nos traemos el primero que se encuentre
        if(!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({error: error.message})
        }
        return res.json(user)
    }

    static getProjectTeam = async (req:Request, res:Response) => {
        // Aunque ya enviamos una instancia del project pro el req, para poder obtener el populate tenemos que hacer la consulta
        const project = await Project.findById(req.project.id).populate({
            path: 'team',
            select: 'id email name'
        })

        res.json(project.team)
    }

    static addMemberById = async (req:Request, res:Response) => {
        const { id } = req.body
        
        // Buscamos al usuario
        const user = await User.findById(id).select('id')
        if(!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({error: error.message})
        }
        // Cmprobamos que el mismo manager no pueda agregarse como colaborador
        if(req.project.manager.toString() === user.id.toString()) {
           const error = new Error('El manager no puede agregarse como colaborador')
           return res.status(409).json({error: error.message})
        }
        // Comprobamos que el usuario ya no exista en el team
        if(req.project.team.some(team => team.toString() === user.id.toString())) {
           const error = new Error('El usuario ya existe en el proyecto')
           return res.status(409).json({error: error.message})
        }

        // Agregamos a la persona en el projecto que viene instandicado en el req gracias al middleware
        req.project.team.push(user.id) // Agregamos el nuevo usuario al projecto
        await req.project.save() // Guardamos

        res.json('Usuario agregado correctamente')
    }

    static removeMemberById = async (req:Request, res:Response) => {
        const { userId } = req.params

        // Comprobamos que el usuario ya no exista en el team
        if(!req.project.team.some(teamMember => teamMember.toString() === userId)) {
           const error = new Error('El usuario no existe en el proyecto')
           return res.status(409).json({error: error.message})
        }
        
        // Filtramos en el team y sacamos al usuario
        req.project.team = req.project.team.filter(teamMember => teamMember.toString() !== userId)
        await req.project.save()

        res.json('Colaborador eliminado correctamente')
    }
}
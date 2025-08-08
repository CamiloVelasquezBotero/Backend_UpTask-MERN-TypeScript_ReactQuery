import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { corsConfig } from './config/cors'
import { connectDB } from './config/db'
import authRoutes from './routes/authRoutes'
import projectRoutes from './routes/projectRoutes'

dotenv.config() /* Iniciamos configuraciones de las variables de entorno */

connectDB() /* Conectamos la base de datos antes de iniciar el servidor */
const app = express() /* Intancia del servidor */
app.use(cors(corsConfig)) /* Usamos cors para permitir el acceso del frontend */
app.use(express.json() /* Habilitamos la lectura de json en el server */)

// Logging
app.use(morgan('dev'))

//Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes) /* Direccion principal, que usaran las rutas que usaremos para projects */

export default app
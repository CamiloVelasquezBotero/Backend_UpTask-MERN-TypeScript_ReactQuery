import mongoose from "mongoose";
import colors from 'colors'

export const connectDB =  async () => {
    try {
        const connection = await mongoose.connect(process.env.DATABASE_URL)
        const url = `${connection.connection.host}:${connection.connection.port}`
        console.log(colors.magenta.bold(`MongoDB connected to ${url}`))
    } catch (error) {
        console.log(colors.red.bold('Bad connection to the MongoDB'))
        process.exit(1)
    }
}
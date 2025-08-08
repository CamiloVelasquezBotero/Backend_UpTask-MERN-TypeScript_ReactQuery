import { CorsOptions } from 'cors'

export const corsConfig:CorsOptions = {
    origin: function(origin, callback) {
        const whiteList = [process.env.FRONTEND_URL]

        // En caso de que estemos en desarrollo, y lo tome como undefined le permitimos las peticiones
        if(process.argv[2] === '--api') {
            whiteList.push(undefined)
        }

        // Proceso para aceptar entradas
        if(whiteList.includes(origin)) {
            callback(null, true) /* El primer parametro es un error y el segundo el acceso */
        } else {
            callback(new Error('Error de CORS'))
        }
    }
}
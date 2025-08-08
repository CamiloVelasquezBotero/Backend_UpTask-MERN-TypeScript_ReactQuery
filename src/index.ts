import colors from 'colors'
import server from './server' /* Traemos el servidor para inicializarlo */

const port = process.env.PORT || 4000

server.listen(port, () => {
    console.log(colors.cyan.bold('REST API FUNCIONANDO EN EL PUERTO' + port))
})
import { Router } from 'express'
import { body, param } from 'express-validator'
import { ProjectController } from '../controllers/ProjectController'
import { handleInputErrors } from '../middleware/validation'
import { TaskController } from '../controllers/TaskController'
import { ProjectExists } from '../middleware/project'
import { hasAuthorization, taskBeLongsToProject, taskExists } from '../middleware/task'
import { authenticate } from '../middleware/Auth'
import { TeamController } from '../controllers/TeamController'
import { NoteController } from '../controllers/NoteController'

const router = Router()

router.use(authenticate) // De esta forma nos ahorramos de ponerlo en todos los endpoinst y asi se pasara a cada uno

/** -------------------------------  ROUTES FOR *    PROJECTS    * ----- */

router.post('/',
    // authenticate, // Autenticamos JsonWebToken primero antes de las demas comprobaciones
    body('projectName')
        .notEmpty().withMessage('El nombre del Proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del Cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripcion del proyecto es obligatoria'),
    handleInputErrors,
    ProjectController.createProject
)

router.get('/', 
    // authenticate, // Podemos poner atheticate al inicio para que lo use en todos los endpoints
    ProjectController.getAllProjects
)

router.get('/:id',
    param('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    ProjectController.getProjectById
)

// ---MIDDLEWARE 'projectId' para los siguientes endpoints
router.param('projectId', ProjectExists) // Valida la existencia del proyecto

router.put('/:projectId',
    hasAuthorization,
    param('projectId').isMongoId().withMessage('ID no valido'),
    body('projectName')
        .notEmpty().withMessage('El nombre del Proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del Cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripcion del proyecto es obligatoria'),
    handleInputErrors,
    ProjectController.UpdateProject
)

router.delete('/:projectId',
    hasAuthorization,
    param('projectId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    ProjectController.deleteProject
)

/** -------------------------------  ROUTES FOR *    TASKS    * ----- */

// Cada vez que se utilice algun parametro dinamico:
/** ------ MIDDLEWARES "taskId" Para los siguientes endpoints */
router.param('taskId', taskExists) // Valida la existencia de la tarea
router.param('taskId', taskBeLongsToProject) // Valida si el la tarea corresponde al proyecto

router.post('/:projectId/tasks',
    hasAuthorization,
    // validateProjectExists, // Middleware: valida que el proyecto si exista
    body('name')
        .notEmpty().withMessage('El nombre de la Tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripcion de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.createTask
)
router.get('/:projectId/tasks',
    TaskController.getProjectTask
)

router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('name')
        .notEmpty().withMessage('El nombre de la Tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripcion de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('status').notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)

/** -------------------------------  ROUTES FOR *    TEAMS    * ----- */
router.post('/:projectId/team/find',
    body('email')
        .isEmail().toLowerCase().withMessage('E-mail no valido'),
    handleInputErrors,
    TeamController.findMemberByEmail
)

router.get('/:projectId/team',
    TeamController.getProjectTeam
)

router.post('/:projectId/team',
    body('id')
        .isMongoId().withMessage('Id no valido'),
        handleInputErrors,
        TeamController.addMemberById
)

router.delete('/:projectId/team/:userId',
    param('userId')
        .isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    TeamController.removeMemberById
)

/** -------------------------------  ROUTES FOR *    NOTES    * ----- */

router.post('/:projectId/tasks/:taskId/notes',
    body('content')
        .notEmpty().withMessage('El contenido de la nota es obligatorio'),
    handleInputErrors,
    NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId')
        .isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    NoteController.deleteNote
)


export default router
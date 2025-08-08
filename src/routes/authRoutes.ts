import { Router } from 'express'
import { body, param } from 'express-validator'
import { AuthController } from '../controllers/AuthController'
import { handleInputErrors } from '../middleware/validation'
import { authenticate } from '../middleware/Auth'

const router = Router()

router.post('/create-account',
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacio'), 
    body('password')
        .isLength({min: 8}).withMessage('El password es nuy corto, minimo 8 caracteres'), 
    body('passwordConfirmation').custom((value, {req}) => { // Personalizacion de validacion
        if(value !== req.body.password) {
            throw new Error('Los passwords no son iguales')
        }
        return true // Si sn iguales le decimos que se vaya al siguiente middleware
    }),
    body('email')
        .isEmail().withMessage('Email no valido'),
    handleInputErrors, 
    AuthController.createAccount
)

router.post('/confirm-account',
    body('token')
        .notEmpty().withMessage('El Token no puede ir vacio'),
    handleInputErrors,
    AuthController.confirmAccount 
)

router.post('/login',
    body('email')
        .isEmail().withMessage('E-mail no valido'),
    body('password')
        .notEmpty().withMessage('El password no puede ir vacio'),
    handleInputErrors,
    AuthController.login
)

router.post('/request-code',
    body('email')
        .isEmail().withMessage('E-mail no valido'),
    handleInputErrors,
    AuthController.requestConfirmationCode
)

router.post('/forgot-password',
    body('email')
        .isEmail().withMessage('E-mail no valido'),
    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token')
        .notEmpty().withMessage('El Token no puede ir vacio'),
        handleInputErrors,
        AuthController.validateToken
)

router.post('/update-password/:token',
    param('token')
        .isNumeric().withMessage('Token no valido'),
    body('password')
        .isLength({min: 8}).withMessage('El password es nuy corto, minimo 8 caracteres'), 
    body('passwordConfirmation').custom((value, {req}) => { // Personalizacion de validacion
        if(value !== req.body.password) {
            throw new Error('Los passwords no son iguales')
        }
        return true // Si sn iguales le decimos que se vaya al siguiente middleware
    }),
    handleInputErrors,
    AuthController.updatePasswordWithToken
)

router.get('/user',
    authenticate,
    AuthController.user
)

/******************************* --- PROFILE ---- ************************************ */

router.put('/profile',
    authenticate,
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacio'),
    body('email')
        .isEmail().withMessage('Email no valido'),
    handleInputErrors,
    AuthController.updateProfile
)

router.put('/update-password',
    authenticate,
    body('currentPassword')
        .notEmpty().withMessage('El password actual no puede ir vacio'), 
    body('password')
        .isLength({min: 8}).withMessage('El password es nuy corto, minimo 8 caracteres'), 
    body('passwordConfirmation').custom((value, {req}) => { // Personalizacion de validacion
        if(value !== req.body.password) {
            throw new Error('Los passwords no son iguales')
        }
        return true // Si sn iguales le decimos que se vaya al siguiente middleware
    }),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)

router.post('/check-password',
    authenticate,
    body('password')
        .notEmpty().withMessage('El password no puede ir vacio'),
    handleInputErrors,
    AuthController.checkPassword
)

export default router
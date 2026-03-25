import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticated } from "../middlewares/authentication";
import { returnValidationErrors } from "../middlewares/validation";
import { body, param } from "express-validator";
import { isAdmin } from "../middlewares/roles";

const router = Router();

router.post('/login',
    body('email').notEmpty().withMessage('El correo es requerido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    returnValidationErrors,
    AuthController.login
);

router.use(authenticated);

router.post('/register',
    isAdmin,
    body('name').notEmpty().withMessage('El nombre del usuario es requerido'),
    body('lastName').notEmpty().withMessage('El apellido del usuario es requerido'),
    body('email').notEmpty().withMessage('El email del usuario es requerido'),
    body('password').notEmpty().withMessage('La contraseña del usuario es requerida'),
    body('role').notEmpty().withMessage('El role del usuario es requerido'),
    body('clients').notEmpty().withMessage('Los clientes son requeridos').isArray().withMessage('Los clientes deben de ser un arreglo'),
    returnValidationErrors,
    AuthController.register
);

router.get('/getUser/:id',
    isAdmin,
    param('id').isNumeric().withMessage('El ID debe de ser un dato núemerico'),
    returnValidationErrors,
    AuthController.getUserById
);

router.get('/getUsers',
    isAdmin,
    AuthController.getUsers
);

router.patch('/updateUser/:id',
    isAdmin,
    param('id').isNumeric().withMessage('El ID debe de ser un dato núemerico'),
    body('name').notEmpty().withMessage('El nombre del usuario es requerido'),
    body('lastName').notEmpty().withMessage('El apellido del usuario es requerido'),
    body('email').notEmpty().withMessage('El email del usuario es requerido'),
    body('password').optional(),
    body('role').notEmpty().withMessage('El role del usuario es requerido'),
    returnValidationErrors,
    AuthController.updateUserById
);

router.get('/check-status',
    AuthController.checkstatus
);

export default router;
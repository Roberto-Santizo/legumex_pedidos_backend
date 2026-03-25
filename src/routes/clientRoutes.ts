import { Router } from "express";
import { authenticated } from "../middlewares/authentication";
import { ClientController } from "../controllers/ClientController";
import { isAdmin } from "../middlewares/roles";
import { body, param } from "express-validator";
import { returnValidationErrors } from "../middlewares/validation";

const router = Router();

router.use(authenticated);

router.post('/',
    isAdmin,
    body('name').notEmpty().withMessage('El nombre es requerido'),
    returnValidationErrors,
    ClientController.store
);

router.get('/',
    ClientController.index
);

router.get('/getUserClients',
    ClientController.getUserClients
);

router.get('/:id',
    isAdmin,
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe de ser un dato númerico'),
    returnValidationErrors,
    ClientController.get
);

router.patch('/:id',
    isAdmin,
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe de ser un dato númerico'),
    body('name').notEmpty().withMessage('El nombre es requerido'),
    returnValidationErrors,
    ClientController.update
);

export default router;
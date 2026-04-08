import { Router } from "express";
import { DcController } from "../controllers/DcController";
import { body, query } from "express-validator";
import { returnValidationErrors } from "../middlewares/validation";
import { authenticated } from "../middlewares/authentication";

const router = Router();

router.use(authenticated);

router.post('/',
    body('name').notEmpty().withMessage('El nombre del dc es requerido'),
    body('client_id').notEmpty().withMessage('El client del dc es requerido'),
    returnValidationErrors,
    DcController.store
);


router.get('/',
    DcController.index
);


export default router;
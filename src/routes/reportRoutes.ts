import { Router } from "express";
import { authenticated } from "../middlewares/authentication";
import { isAdministrativeUser } from "../middlewares/roles";
import { ReportController } from "../controllers/ReportController";
import { param } from "express-validator";
import { returnValidationErrors } from "../middlewares/validation";

const router = Router();

router.use(authenticated);
router.use(isAdministrativeUser);

router.get('/transport-cost', ReportController.getTransportCostReport);

router.post('/getOrdersReportByClientDate/:id',
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe de ser un dato númerico'),
    returnValidationErrors,
    ReportController.getOrdersReportByClientDate
);


export default router;
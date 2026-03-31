import { authenticated } from "../middlewares/authentication";
import { body, param, query } from "express-validator";
import { isAdministrativeUser } from "../middlewares/roles";
import { ProductController } from "../controllers/ProductController";
import { returnValidationErrors } from "../middlewares/validation";
import { Router } from "express";

const router = Router();

router.use(authenticated);

router.post('/',
    isAdministrativeUser,
    body('name').notEmpty().withMessage('El nombre del producto es requerido'),
    body('localCode').notEmpty().withMessage('El código local del producto es requerido'),
    body('internationalCode').notEmpty().withMessage('El código internacional del producto es requerido'),
    body('presentation').notEmpty().withMessage('La presentación del producto es requerida').isNumeric().withMessage('La presentación debe de ser un dato númerico'),
    body('price').notEmpty().withMessage('El precio del producto es requerido').isNumeric().withMessage('El precio del producto debe de ser un dato númerico'),
    body('units_per_box').notEmpty().withMessage('Las unidades por caja son requeridas').isNumeric().withMessage('Las unidades por caja debe de ser un dato númerico'),
    body('boxes_per_pallet').notEmpty().withMessage('Las cajas por pallet son requeridas').isNumeric().withMessage('Las cajas por pallet debe de ser un dato númerico'),
    body('client_id').notEmpty().withMessage('El cliente es requerido').isNumeric().withMessage('El cliente debe de ser un dato númerico'),
    body('dc').notEmpty().withMessage('El código de distribución es requerido'),
    body('transportType').notEmpty().withMessage('El tipo de transporte es requerido'),
    returnValidationErrors,
    ProductController.store
);

router.get('/',
    ProductController.index
);

router.get('/getPaginatedProducts',
    query('limit').notEmpty().withMessage('El limite es requerido').isNumeric().withMessage('El limite debe de ser un dato númerico'),
    query('offset').notEmpty().withMessage('El offset es requerido').isNumeric().withMessage('El offset debe de ser un dato númerico'),
    returnValidationErrors,
    ProductController.getPaginatedProducts
);

router.get('/:id',
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe deser un dato númerico'),
    returnValidationErrors,
    ProductController.get
);

router.patch('/:id',
    isAdministrativeUser,
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe deser un dato númerico'),
    body('name').notEmpty().withMessage('El nombre del producto es requerido'),
    body('localCode').notEmpty().withMessage('El código local del producto es requerido'),
    body('internationalCode').notEmpty().withMessage('El código internacional del producto es requerido'),
    body('presentation').notEmpty().withMessage('La presentación del producto es requerida').isNumeric().withMessage('La presentación debe de ser un dato númerico'),
    body('price').notEmpty().withMessage('El precio del producto es requerido').isNumeric().withMessage('El precio del producto debe de ser un dato númerico'),
    body('units_per_box').notEmpty().withMessage('Las unidades por caja son requeridas').isNumeric().withMessage('Las unidades por caja debe de ser un dato númerico'),
    body('boxes_per_pallet').notEmpty().withMessage('Las cajas por pallet son requeridas').isNumeric().withMessage('Las cajas por pallet debe de ser un dato númerico'),
    body('client_id').notEmpty().withMessage('El cliente es requerido').isNumeric().withMessage('El cliente debe de ser un dato númerico'),
    body('dc').notEmpty().withMessage('El código de distribución es requerido'),
    body('transportType').notEmpty().withMessage('El tipo de transporte es requerido'),
    returnValidationErrors,
    ProductController.update
);



export default router;
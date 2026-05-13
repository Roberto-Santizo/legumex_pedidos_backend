import { authenticated } from "../middlewares/authentication";
import { body, param, query } from "express-validator";
import { fileExists, isOrderOwner } from "../middlewares/orders";
import { OrderController } from "../controllers/OrderController";
import { returnValidationErrors } from "../middlewares/validation";
import { Router } from "express";
import { isAdministrativeUser } from '../middlewares/roles';
import { upload } from "../config/multerConfig";

const router = Router();

router.use(authenticated);

router.post('/',
    body('client_id').notEmpty().withMessage('El cliente es requerido').isNumeric().withMessage('El cliente debe de ser un dato númerico'),
    body('dc_id').notEmpty().withMessage('El dc es requerido'),
    body('transportType').notEmpty().withMessage('El tipo de transporte es requerido'),
    body('requiredByDate').notEmpty().withMessage('La fecha de requerimiento es requerida'),
    body('po').notEmpty().withMessage('La PO de la orden es requerida'),
    body('year').notEmpty().withMessage('El año es requerido').isNumeric().withMessage('El año debe de ser un dato númerico'),
    body('week').notEmpty().withMessage('La semana es requerida').isNumeric().withMessage('La semana debe de ser un dato númerico'),
    returnValidationErrors,
    OrderController.store
);

router.get('/',
    OrderController.index
);

router.get('/getPaginatedOrders',
    query('limit').notEmpty().withMessage('El limite es requerido').isNumeric().withMessage('El limite debe de ser un valor númerico'),
    query('offset').notEmpty().withMessage('El offset es requerido').isNumeric().withMessage('El limite debe de ser un valor númerico'),
    returnValidationErrors,
    OrderController.getPaginatedOrders
);

router.get('/:id',
    isOrderOwner,
    OrderController.get
);

router.post('/addItem/:id',
    isOrderOwner,
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe de ser un dato númerico'),
    body('product_id').notEmpty().withMessage('El producto es requerido').isNumeric().withMessage('El producto debe de ser un dato númerico'),
    body('total_boxes').notEmpty().withMessage('El total de cajas es requerida').isNumeric().withMessage('El total de cajas debe de ser un dato númerico'),
    returnValidationErrors,
    OrderController.addItem
);

router.post('/confirmOrder/:id',
    isOrderOwner,
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe de ser un dato númerico'),
    returnValidationErrors,
    OrderController.confirmOrder
);

router.post('/confirmReceivedOrder/:id',
    isAdministrativeUser,
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe de ser un dato númerico'),
    returnValidationErrors,
    OrderController.confirmReceivedOrder
);

router.get('/getOrderTotals/:id',
    isOrderOwner,
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe de ser un dato númerico'),
    returnValidationErrors,
    OrderController.getOrderTotals
);

router.get('/getOrderItems/:id',
    isOrderOwner,
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe de ser un dato númerico'),
    returnValidationErrors,
    OrderController.getOrderItems
);

router.get('/getOrderItemById/:id',
    isAdministrativeUser,
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe de ser un dato númerico'),
    OrderController.getOrderItemById
);

router.patch('/updateOrderItemById/:id/:itemId',
    isOrderOwner,
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe de ser un dato númerico'),
    param('itemId').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El itemId debe de ser un dato númerico'),
    body('product_id').notEmpty().withMessage('El producto es requerido').isNumeric().withMessage('El producto debe de ser un dato númerico'),
    body('total_boxes').notEmpty().withMessage('El total de cajas es requerida').isNumeric().withMessage('El total de cajas debe de ser un dato númerico'),
    returnValidationErrors,
    OrderController.updateOrderItemById
);

router.delete('/deleteItem/:id/:itemId',
    isOrderOwner,
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe de ser un dato númerico'),
    returnValidationErrors,
    OrderController.deleteItem
);

router.post('/uploadFile',
    upload.single('file'),
    fileExists,
    body('year').notEmpty().withMessage('El año es requerido').isNumeric().withMessage('El año debe de ser un dato númerico'),
    body('week').notEmpty().withMessage('La semana es requerida').isNumeric().withMessage('La semana debe de ser un dato númerico'),
    returnValidationErrors,
    OrderController.uploadFile
);

router.post('/ordersHeadersReport',
    isAdministrativeUser,
    body('year').notEmpty().withMessage('El año es requerido'),
    body('week').notEmpty().withMessage('La semana es requerida'),
    returnValidationErrors,
    OrderController.generateOrdersHeadersReport
);

router.post('/ordersItemsReport',
    isAdministrativeUser,
    body('startDate').notEmpty().withMessage('La fecha de inicio es requerida'),
    body('endDate').notEmpty().withMessage('La fecha de fin es requerida'),
    returnValidationErrors,
    OrderController.generateOrdersItemsReport
);

router.get('/orderEditDetails/:id',
    isAdministrativeUser,
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe de ser un dato númerico'),
    returnValidationErrors,
    OrderController.getOrderEditDetails
);

router.patch('/:id',
    isAdministrativeUser,
    body('client_id').notEmpty().withMessage('El cliente es requerido').isNumeric().withMessage('El cliente debe de ser un dato númerico'),
    body('dc_id').notEmpty().withMessage('El dc es requerido'),
    body('transportType').notEmpty().withMessage('El tipo de transporte es requerido'),
    body('requiredByDate').notEmpty().withMessage('La fecha de requerimiento es requerida'),
    body('po').notEmpty().withMessage('La PO de la orden es requerida'),
    body('year').notEmpty().withMessage('El año es requerido').isNumeric().withMessage('El año debe de ser un dato númerico'),
    body('week').notEmpty().withMessage('La semana es requerida').isNumeric().withMessage('La semana debe de ser un dato númerico'),
    returnValidationErrors,
    OrderController.update
);

router.delete('/:id',
    isAdministrativeUser,
    param('id').notEmpty().withMessage('El ID es requerido').isNumeric().withMessage('El ID debe de ser un dato númerico'),
    returnValidationErrors,
    OrderController.deleteOrder
);

export default router;
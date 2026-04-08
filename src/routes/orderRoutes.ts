import { authenticated } from "../middlewares/authentication";
import { body, param, query } from "express-validator";
import { isOrderOwner } from "../middlewares/orders";
import { OrderController } from "../controllers/OrderController";
import { returnValidationErrors } from "../middlewares/validation";
import { Router } from "express";
import { isAdministrativeUser } from "../middlewares/roles";

const router = Router();

router.use(authenticated);

router.post('/',
    body('client_id').notEmpty().withMessage('El cliente es requerido').isNumeric().withMessage('El cliente debe de ser un dato númerico'),
    body('dc').notEmpty().withMessage('El dc es requerido'),
    body('transportType').notEmpty().withMessage('El tipo de transporte es requerido'),
    body('requiredByDate').notEmpty().withMessage('La fecha de requerimiento es requerida'),
    body('po').notEmpty().withMessage('La PO de la orden es requerida'),
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

export default router;
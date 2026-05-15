import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticated } from '../middlewares/authentication';
import { returnValidationErrors } from '../middlewares/validation';
import { ContainerController } from '../controllers/ContainerController';

const router = Router();

router.use(authenticated);

router.get(
    '/week',
    query('date')
        .optional()
        .isISO8601()
        .withMessage('date must be a valid ISO 8601 date (YYYY-MM-DD)'),
    returnValidationErrors,
    ContainerController.getWeekView,
);

router.post(
    '/',
    body('transportType').notEmpty().withMessage('transportType is required'),
    body('dc').notEmpty().withMessage('dc is required'),
    body('weekStart')
        .notEmpty()
        .withMessage('weekStart is required')
        .isISO8601()
        .withMessage('weekStart must be a valid ISO 8601 date (YYYY-MM-DD)'),
    body('orderIds')
        .isArray({ min: 1 })
        .withMessage('orderIds must be a non-empty array'),
    body('orderIds.*')
        .isInt({ min: 1 })
        .withMessage('Each order ID must be a positive integer'),
    returnValidationErrors,
    ContainerController.createContainer,
);

router.post(
    '/:id/orders',
    param('id').isInt({ min: 1 }).withMessage('Container ID must be a positive integer'),
    body('orderIds')
        .isArray({ min: 1 })
        .withMessage('orderIds must be a non-empty array'),
    body('orderIds.*')
        .isInt({ min: 1 })
        .withMessage('Each order ID must be a positive integer'),
    returnValidationErrors,
    ContainerController.addOrders,
);

router.delete(
    '/:id/orders/:orderId',
    param('id').isInt({ min: 1 }).withMessage('Container ID must be a positive integer'),
    param('orderId').isInt({ min: 1 }).withMessage('Order ID must be a positive integer'),
    returnValidationErrors,
    ContainerController.removeOrder,
);

router.post(
    '/:id/confirm',
    param('id').isInt({ min: 1 }).withMessage('Container ID must be a positive integer'),
    returnValidationErrors,
    ContainerController.confirmContainer,
);

router.delete(
    '/:id',
    param('id').isInt({ min: 1 }).withMessage('Container ID must be a positive integer'),
    returnValidationErrors,
    ContainerController.deleteContainer,
);

router.get(
    '/:id',
    param('id').isInt({ min: 1 }).withMessage('Container ID must be a positive integer'),
    returnValidationErrors,
    ContainerController.getContainerById,
);

router.post(
    '/:id/assign-carrier',
    param('id').isInt({ min: 1 }).withMessage('Container ID must be a positive integer'),
    body('carrierId').isInt({ min: 1 }).withMessage('carrierId must be a positive integer'),
    returnValidationErrors,
    ContainerController.assignCarrier,
);

router.patch(
    '/:id/delivery-schedule',
    param('id').isInt({ min: 1 }).withMessage('Container ID must be a positive integer'),
    body('deliveryDate')
        .notEmpty().withMessage('deliveryDate is required')
        .isISO8601().withMessage('deliveryDate must be a valid date (YYYY-MM-DD)'),
    body('deliveryTime')
        .notEmpty().withMessage('deliveryTime is required')
        .matches(/^\d{2}:\d{2}$/).withMessage('deliveryTime must be in HH:MM format'),
    returnValidationErrors,
    ContainerController.setDeliverySchedule,
);

export default router;

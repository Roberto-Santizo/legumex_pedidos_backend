// Created by Luis

import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticated } from '../middlewares/authentication';
import { returnValidationErrors } from '../middlewares/validation';
import { CarrierController } from '../controllers/CarrierController';

const router = Router();

router.use(authenticated);

// GET /api/carriers
router.get('/', CarrierController.index);

// POST /api/carriers
router.post(
    '/',
    body('name').notEmpty().withMessage('name is required'),
    body('shippingCost')
        .notEmpty().withMessage('shippingCost is required')
        .isFloat({ min: 0 }).withMessage('shippingCost must be a non-negative number'),
    body('rateUpdatedAt')
        .notEmpty().withMessage('rateUpdatedAt is required')
        .isISO8601().withMessage('rateUpdatedAt must be a valid date (YYYY-MM-DD)'),
    returnValidationErrors,
    CarrierController.store,
);

// PUT /api/carriers/:id
router.put(
    '/:id',
    param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
    body('name').optional().notEmpty().withMessage('name cannot be empty'),
    body('shippingCost').optional().isFloat({ min: 0 }).withMessage('shippingCost must be a non-negative number'),
    body('rateUpdatedAt').optional().isISO8601().withMessage('rateUpdatedAt must be a valid date (YYYY-MM-DD)'),
    returnValidationErrors,
    CarrierController.update,
);

// DELETE /api/carriers/:id
router.delete(
    '/:id',
    param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
    returnValidationErrors,
    CarrierController.destroy,
);

// GET /api/carriers/:id/rates
router.get(
    '/:id/rates',
    param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
    returnValidationErrors,
    CarrierController.rates,
);

export default router;

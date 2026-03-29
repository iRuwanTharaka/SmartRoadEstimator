import { Router } from 'express';
import { estimateController } from '../controllers/estimate.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const calcSchema = z.object({
    projectId: z.string().uuid('Valid project ID is required'),
});

/**
 * @openapi
 * /estimate/calculate:
 *   post:
 *     tags: [Cost Estimation]
 *     summary: Calculate cost estimation for a project
 *     description: Calculates material, labor, and equipment costs based on detected damage area and current rates
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId]
 *             properties:
 *               projectId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Estimation result with breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 materialCost: { type: number }
 *                 laborCost: { type: number }
 *                 equipmentCost: { type: number }
 *                 totalCost: { type: number }
 *                 totalArea: { type: number }
 *                 breakdown: { type: array }
 */
router.post('/calculate', authenticate, authorize('ADMIN', 'ENGINEER'), validate(calcSchema), estimateController.calculate);

/**
 * @openapi
 * /estimate/{projectId}:
 *   get:
 *     tags: [Cost Estimation]
 *     summary: Get estimations for a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of estimations }
 */
router.get('/:projectId', authenticate, estimateController.getByProject);

export default router;

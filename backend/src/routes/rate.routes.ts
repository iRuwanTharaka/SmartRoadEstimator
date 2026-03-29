import { Router } from 'express';
import { rateController } from '../controllers/rate.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const materialSchema = z.object({
    name: z.string().min(1), unit: z.string().min(1), costPerUnit: z.number().positive(),
});
const laborSchema = z.object({
    name: z.string().min(1), unit: z.string().min(1), costPerHour: z.number().positive(),
});
const equipmentSchema = z.object({
    name: z.string().min(1), unit: z.string().min(1), costPerUse: z.number().positive(),
});

/**
 * @openapi
 * /rates/all:
 *   get:
 *     tags: [Rates]
 *     summary: Get all rates (materials, labor, equipment)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: All rate categories }
 */
router.get('/all', authenticate, rateController.getAll);

// ─── Material Routes ─────────────────────────────────────────

/**
 * @openapi
 * /rates/material:
 *   get:
 *     tags: [Rates]
 *     summary: Get material rates (paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Paginated material rates }
 *   post:
 *     tags: [Rates]
 *     summary: Create material rate (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, unit, costPerUnit]
 *             properties:
 *               name: { type: string, example: "Bitumen (VG-30)" }
 *               unit: { type: string, example: "kg" }
 *               costPerUnit: { type: number, example: 62 }
 *     responses:
 *       201: { description: Rate created }
 */
router.get('/material', authenticate, rateController.getMaterials);
router.post('/material', authenticate, authorize('ADMIN'), validate(materialSchema), rateController.createMaterial);

/**
 * @openapi
 * /rates/material/{id}:
 *   put:
 *     tags: [Rates]
 *     summary: Update material rate (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Rate updated }
 *   delete:
 *     tags: [Rates]
 *     summary: Delete material rate (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Rate deleted }
 */
router.put('/material/:id', authenticate, authorize('ADMIN'), rateController.updateMaterial);
router.delete('/material/:id', authenticate, authorize('ADMIN'), rateController.deleteMaterial);

// ─── Labor Routes ────────────────────────────────────────────
/** @openapi
 * /rates/labor:
 *   get:
 *     tags: [Rates]
 *     summary: Get labor rates
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated labor rates }
 *   post:
 *     tags: [Rates]
 *     summary: Create labor rate (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Rate created }
 */
router.get('/labor', authenticate, rateController.getLabor);
router.post('/labor', authenticate, authorize('ADMIN'), validate(laborSchema), rateController.createLabor);
router.put('/labor/:id', authenticate, authorize('ADMIN'), rateController.updateLabor);
router.delete('/labor/:id', authenticate, authorize('ADMIN'), rateController.deleteLabor);

// ─── Equipment Routes ────────────────────────────────────────
/** @openapi
 * /rates/equipment:
 *   get:
 *     tags: [Rates]
 *     summary: Get equipment rates
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated equipment rates }
 *   post:
 *     tags: [Rates]
 *     summary: Create equipment rate (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Rate created }
 */
router.get('/equipment', authenticate, rateController.getEquipment);
router.post('/equipment', authenticate, authorize('ADMIN'), validate(equipmentSchema), rateController.createEquipment);
router.put('/equipment/:id', authenticate, authorize('ADMIN'), rateController.updateEquipment);
router.delete('/equipment/:id', authenticate, authorize('ADMIN'), rateController.deleteEquipment);

export default router;

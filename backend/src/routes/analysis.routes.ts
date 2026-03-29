import { Router } from 'express';
import { analysisController } from '../controllers/analysis.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const runSchema = z.object({
    projectId: z.string().uuid('Valid project ID is required'),
});

const detectionsSchema = z.object({
    detections: z.array(
        z.object({
            id: z.string().optional(),
            x: z.number(),
            y: z.number(),
            width: z.number().positive(),
            height: z.number().positive(),
            severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
            label: z.string().optional(),
        })
    ),
});

/**
 * @openapi
 * /analysis/run:
 *   post:
 *     tags: [AI Analysis]
 *     summary: Run AI pothole detection on project images
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
 *       200: { description: Detection results }
 */
router.post('/run', authenticate, authorize('ADMIN', 'ENGINEER'), validate(runSchema), analysisController.run);

/**
 * @openapi
 * /analysis/{projectId}/detections:
 *   get:
 *     tags: [AI Analysis]
 *     summary: Get all detections for a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of detections }
 */
router.get('/:projectId/detections', authenticate, analysisController.getDetections);

/**
 * @openapi
 * /analysis/{projectId}/update-detections:
 *   put:
 *     tags: [AI Analysis]
 *     summary: Manually update/verify detections
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [detections]
 *             properties:
 *               detections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     x: { type: number }
 *                     y: { type: number }
 *                     width: { type: number }
 *                     height: { type: number }
 *                     severity: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *                     label: { type: string }
 *     responses:
 *       200: { description: Updated detections }
 */
router.put(
    '/:projectId/update-detections',
    authenticate,
    authorize('ADMIN', 'ENGINEER'),
    validate(detectionsSchema),
    analysisController.updateDetections
);

export default router;

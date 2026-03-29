import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const createSchema = z.object({
    name: z.string().min(1, 'Project name is required'),
    location: z.string().min(1, 'Location is required'),
    roadLength: z.number().positive().optional(),
    roadWidth: z.number().positive().optional(),
    surfaceType: z.string().optional(),
    contractor: z.string().optional(),
    notes: z.string().optional(),
});

/**
 * @openapi
 * /projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a new project
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location]
 *             properties:
 *               name: { type: string, example: "NH-44 Segment B" }
 *               location: { type: string, example: "Hyderabad, Telangana" }
 *               roadLength: { type: number, example: 500 }
 *               roadWidth: { type: number, example: 7 }
 *               surfaceType: { type: string, example: "Bituminous" }
 *               contractor: { type: string, example: "ABC Construction" }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Project created }
 */
router.post('/', authenticate, authorize('ADMIN', 'ENGINEER'), validate(createSchema), projectController.create);

/**
 * @openapi
 * /projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get all projects (role-filtered)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: query
 *         schema: { type: string }
 *         description: Search by project name or location
 *     responses:
 *       200: { description: Paginated project list }
 */
router.get('/', authenticate, projectController.getAll);

/**
 * @openapi
 * /projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Project details with images, detections, estimates }
 *       404: { description: Project not found }
 */
router.get('/:id', authenticate, projectController.getById);

/**
 * @openapi
 * /projects/{id}:
 *   put:
 *     tags: [Projects]
 *     summary: Update project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated project }
 */
router.put('/:id', authenticate, authorize('ADMIN', 'ENGINEER'), projectController.update);

/**
 * @openapi
 * /projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Project deleted }
 */
router.delete('/:id', authenticate, authorize('ADMIN', 'ENGINEER'), projectController.delete);

/**
 * @openapi
 * /projects/{id}/assign:
 *   post:
 *     tags: [Projects]
 *     summary: Assign contractor to project (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contractorId]
 *             properties:
 *               contractorId: { type: string }
 *     responses:
 *       201: { description: Contractor assigned }
 */
router.post('/:id/assign', authenticate, authorize('ADMIN'), projectController.assignContractor);

export default router;

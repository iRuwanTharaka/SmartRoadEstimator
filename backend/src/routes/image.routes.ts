import { Router } from 'express';
import { imageController } from '../controllers/image.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

/**
 * @openapi
 * /images/{projectId}/upload:
 *   post:
 *     tags: [Images]
 *     summary: Upload road image for a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image: { type: string, format: binary }
 *               latitude: { type: number, example: 17.385 }
 *               longitude: { type: number, example: 78.4867 }
 *               capturedAt: { type: string, format: date-time }
 *     responses:
 *       201: { description: Image uploaded }
 */
router.post(
    '/:projectId/upload',
    authenticate,
    authorize('ADMIN', 'ENGINEER'),
    upload.single('image'),
    imageController.upload
);

/**
 * @openapi
 * /images/{projectId}:
 *   get:
 *     tags: [Images]
 *     summary: Get all images for a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of images }
 */
router.get('/:projectId', authenticate, imageController.getByProject);

/**
 * @openapi
 * /images/{id}:
 *   delete:
 *     tags: [Images]
 *     summary: Delete an image
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Image deleted }
 */
router.delete('/:id', authenticate, authorize('ADMIN', 'ENGINEER'), imageController.delete);

export default router;

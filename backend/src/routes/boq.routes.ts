import { Router } from 'express';
import { boqController } from '../controllers/boq.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /boq/{projectId}:
 *   get:
 *     tags: [BOQ Export]
 *     summary: Get BOQ data as JSON
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: BOQ data with project, estimation, and breakdown }
 */
router.get('/:projectId', authenticate, boqController.getData);

/**
 * @openapi
 * /boq/{projectId}/pdf:
 *   get:
 *     tags: [BOQ Export]
 *     summary: Export BOQ as PDF
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:projectId/pdf', authenticate, boqController.exportPDF);

/**
 * @openapi
 * /boq/{projectId}/excel:
 *   get:
 *     tags: [BOQ Export]
 *     summary: Export BOQ as Excel
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:projectId/excel', authenticate, boqController.exportExcel);

export default router;

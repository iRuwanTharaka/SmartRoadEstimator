import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { boqService } from '../services/boq.service';

export class BoqController {
    async exportPDF(req: AuthRequest, res: Response): Promise<void> {
        try {
            const doc = await boqService.generatePDF(req.params.projectId, req.user!.userId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=BOQ_${req.params.projectId}.pdf`);
            doc.pipe(res);
            doc.end();
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async exportExcel(req: AuthRequest, res: Response): Promise<void> {
        try {
            const workbook = await boqService.generateExcel(req.params.projectId, req.user!.userId);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=BOQ_${req.params.projectId}.xlsx`);
            await workbook.xlsx.write(res);
            res.end();
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async getData(req: AuthRequest, res: Response): Promise<void> {
        try {
            const data = await boqService.getBoqData(req.params.projectId);
            res.json(data);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }
}

export const boqController = new BoqController();

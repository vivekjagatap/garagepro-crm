import { Router } from 'express';
import { generateWhatsAppMessage, generateInvoiceSummary } from '../controllers/aiController.js';

const router = Router();

router.post('/whatsapp-message', generateWhatsAppMessage);
router.post('/invoice-summary', generateInvoiceSummary);

export default router;

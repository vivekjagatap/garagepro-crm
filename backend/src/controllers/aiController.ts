import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/env.js';

const genai = new GoogleGenAI({ apiKey: config.geminiApiKey });

export const generateWhatsAppMessage = async (req: Request, res: Response) => {
  const { customerName, vehicleModel, vehicleNumber, status, totalAmount } = req.body;

  if (!customerName || !vehicleModel || !status) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const prompt = `
You are a customer service bot for an Indian auto garage called AutoServe CRM.
Generate a short, polite WhatsApp message in Indian English (Hinglish tone optional) for:

Customer: ${customerName}
Vehicle: ${vehicleModel} (${vehicleNumber})
Service Status: ${status}
${totalAmount ? `Total Amount: ₹${totalAmount}` : ''}

Keep it under 100 words. Be friendly and professional.
    `.trim();

    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const message = response.text?.trim() || '';
    res.json({ success: true, data: { message } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gemini API error', error: String(error) });
  }
};

export const generateInvoiceSummary = async (req: Request, res: Response) => {
  const { items, customerName, vehicleModel } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'Invalid invoice items' });
  }

  try {
    const itemsList = items.map((i: { description: string; quantity: number; price: number }) =>
      `- ${i.description}: ${i.quantity} x ₹${i.price}`
    ).join('\n');

    const prompt = `
Generate a one-paragraph professional invoice summary for:

Customer: ${customerName}
Vehicle: ${vehicleModel}
Items:
${itemsList}

Be concise and professional. Write in Indian English.
    `.trim();

    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const summary = response.text?.trim() || '';
    res.json({ success: true, data: { summary } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gemini API error', error: String(error) });
  }
};

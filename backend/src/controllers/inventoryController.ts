import { Request, Response } from 'express';
import { InventoryItem } from '../models/types.js';

let inventory: InventoryItem[] = [];

export const getAllInventory = (_req: Request, res: Response) => {
  res.json({ success: true, data: inventory });
};

export const getInventoryById = (req: Request, res: Response) => {
  const item = inventory.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  res.json({ success: true, data: item });
};

export const createInventoryItem = (req: Request, res: Response) => {
  const item: InventoryItem = {
    ...req.body,
    id: `inv-${Date.now()}`,
  };
  inventory.push(item);
  res.status(201).json({ success: true, data: item });
};

export const updateInventoryItem = (req: Request, res: Response) => {
  const index = inventory.findIndex((i) => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Item not found' });
  inventory[index] = { ...inventory[index], ...req.body };
  res.json({ success: true, data: inventory[index] });
};

export const deleteInventoryItem = (req: Request, res: Response) => {
  const index = inventory.findIndex((i) => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Item not found' });
  inventory.splice(index, 1);
  res.json({ success: true, message: 'Item deleted' });
};

export const getLowStockAlerts = (_req: Request, res: Response) => {
  const lowStock = inventory.filter((i) => i.stock <= i.minStockAlert);
  res.json({ success: true, data: lowStock });
};

export const seedInventory = (req: Request, res: Response) => {
  inventory = req.body;
  res.json({ success: true, message: `Seeded ${inventory.length} items` });
};

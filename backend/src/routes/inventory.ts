import { Router } from 'express';
import {
  getAllInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockAlerts,
  seedInventory,
} from '../controllers/inventoryController.js';

const router = Router();

router.get('/', getAllInventory);
router.get('/low-stock', getLowStockAlerts);
router.get('/:id', getInventoryById);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);
router.post('/seed', seedInventory);

export default router;

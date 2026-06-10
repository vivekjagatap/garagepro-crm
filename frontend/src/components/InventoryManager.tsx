/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Minus, 
  TrendingUp, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Search,
  CheckCircle2,
  PackageOpen
} from 'lucide-react';
import { InventoryItem } from '../types/index';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  onAddInventoryItem: (newItem: InventoryItem) => void;
  onUpdateInventoryItem: (itemId: string, updatedFields: Partial<InventoryItem>) => void;
  onDeleteInventoryItem?: (itemId: string) => void;
}

export default function InventoryManager({
  inventory,
  onAddInventoryItem,
  onUpdateInventoryItem,
  onDeleteInventoryItem
}: InventoryManagerProps) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New inventory form data
  const [name, setName] = useState('');
  const [stock, setStock] = useState<number>(10);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [price, setPrice] = useState<number>(500);

  // Filter inventory
  const filteredInventory = inventory.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = inventory.filter(p => p.stock <= p.minStockAlert);

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Spare part name cannot be empty!');
      return;
    }

    const newItem: InventoryItem = {
      id: `inv-part-${Date.now()}`,
      name: name.trim(),
      stock: Number(stock),
      minStockAlert: Number(minStockAlert),
      price: Number(price)
    };

    onAddInventoryItem(newItem);
    
    // Reset Form
    setName('');
    setStock(10);
    setMinStockAlert(5);
    setPrice(500);
    setShowAddItem(false);
  };

  const handleAdjustStock = (item: InventoryItem, delta: number) => {
    const newStock = Math.max(0, item.stock + delta);
    onUpdateInventoryItem(item.id, { stock: newStock });
  };

  return (
    <div className="space-y-6" id="inventory-tab-container">
      {/* Header sections */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="inv-header">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 font-sans">Spare Parts & Inventory</h2>
          <p className="text-sm text-gray-500 font-sans">Monitor item stock levels, set automated minimum balance warning alerts, and track prices for billing inclusion.</p>
        </div>
        <button
          onClick={() => setShowAddItem(!showAddItem)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-xs transition duration-200 flex items-center gap-2 cursor-pointer font-sans text-sm"
          id="toggle-add-inv"
        >
          {showAddItem ? 'Hide Deck' : 'Add New Spare'} <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Low Stock Warning Banner dashboard overview */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4" id="inv-alert-banner">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-900 font-sans">Stock Reorder Required Alert</p>
              <p className="text-xs text-amber-700 leading-relaxed font-sans">
                {lowStockItems.length} essential parts are building up low balances below safe thresholds. Kindly refill them immediately to avoid interruption during major vehicle repairs:
                <span className="font-bold font-mono text-amber-900 ml-1.5">
                  {lowStockItems.map(item => `${item.name} (${item.stock} left)`).join(', ')}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Slide/Fade display details */}
      {showAddItem && (
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-md space-y-4" id="add-inv-item-card">
          <h3 className="font-bold text-gray-900 text-base font-sans pb-3 border-b border-gray-100 flex items-center gap-1.5">
            <Sparkles className="h-5 w-5 text-indigo-650 animate-pulse" /> Register New Spares / Lubricants
          </h3>
          
          <form onSubmit={handleAddNewItem} className="grid grid-cols-1 md:grid-cols-4 gap-4" id="add-inv-form">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Spare Part Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Engine Oil (Shell 5W-40)"
                className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-305 font-sans text-xs"
                value={name}
                onChange={(e) => setName(e.target.value)}
                id="new-inv-name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Unit Selling Price *</label>
              <input
                type="number"
                required
                placeholder="e.g. 1500"
                className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-305 font-mono text-xs"
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                id="new-inv-price"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Starting Stock *</label>
              <input
                type="number"
                required
                placeholder="Scale number"
                className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-350 font-mono text-xs"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                id="new-inv-stock"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Alert Threshold Count *</label>
              <input
                type="number"
                required
                placeholder="Alert at"
                className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-350 font-mono text-xs"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value))}
                id="new-inv-threshold"
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddItem(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-650 font-sans hover:bg-gray-50 cursor-pointer"
                id="inv-form-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-705 text-white text-xs font-bold font-sans rounded-lg transition duration-150 cursor-pointer"
                id="inv-form-submit"
              >
                Add Stock Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Database list search and table */}
      <div className="bg-white rounded-xl border border-gray-150 shadow-xs overflow-hidden" id="inv-table-block">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4" id="inv-filter-bar">
          <h3 className="font-bold text-gray-800 text-sm font-sans flex items-center gap-1.5">
            <Package className="h-4.5 w-4.5 text-indigo-650" /> Parts Shelf Status Table
          </h3>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search specific category or unit..."
              className="w-full pl-8 pr-4 py-1.5 bg-gray-100/60 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-305 text-xs font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="inv-search-input"
            />
          </div>
        </div>

        <div className="overflow-x-auto" id="inv-viewport">
          <table className="w-full text-left border-collapse" id="inv-table">
            <thead>
              <tr className="border-b border-gray-100 text-[11.5px] text-gray-450 uppercase font-sans font-bold bg-gray-50">
                <th className="py-3 px-4">Part / Consumable Description</th>
                <th className="py-3 px-4 text-rose-500 font-bold">Safety Limit</th>
                <th className="py-3 px-4">Estimated Value (₹)</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-center rounded-r-xl">Quick Adjust Stocks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm font-sans" id="inv-tbody">
              {filteredInventory.map((item) => {
                const isAlert = item.stock <= item.minStockAlert;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-bold text-gray-800 text-xs">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono font-bold text-amber-600">
                      {item.minStockAlert} units
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-gray-700">
                      ₹{item.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      {isAlert ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-100 text-rose-750 px-2 py-0.5 rounded text-[10.5px] font-bold animate-pulse">
                          ⚠️ Low Stock: {item.stock} left
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10.5px] font-bold">
                          ✓ Sufficient: {item.stock} units
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2" id={`inv-controls-${item.id}`}>
                        <button
                          onClick={() => handleAdjustStock(item, -1)}
                          className="p-1 px-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 rounded cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-xs font-bold w-10 text-center">{item.stock}</span>
                        <button
                          onClick={() => handleAdjustStock(item, 5)}
                          className="p-1 px-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 rounded cursor-pointer flex items-center text-3xs font-black font-sans"
                        >
                          +5 Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

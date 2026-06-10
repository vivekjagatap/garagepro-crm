/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ServiceWorkflowState = 
  | 'Received' 
  | 'Inspection' 
  | 'Approval' 
  | 'Repair' 
  | 'Quality Check' 
  | 'Delivered';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  type: 'Part' | 'Labour';
}

export interface JobCard {
  id: string;
  jobNumber: string; // e.g. ASC-2026-001
  customerName: string;
  customerMobile: string;
  vehicleNumber: string; // e.g. MH12AB1234
  vehicleModel: string; // e.g. Hyundai Creta
  complaint: string;
  fuelLevel: 'Empty' | 'Quarter' | 'Half' | 'Three Quarters' | 'Full';
  odometer: number;
  assignedMechanic: string;
  status: ServiceWorkflowState;
  createdAt: string; // Date string
  lastUpdated?: string;
  deliveredAt?: string;
  items: InvoiceItem[];
  paymentStatus: 'Paid' | 'Due' | 'Unpaid';
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  minStockAlert: number;
  price: number; // Unit selling price
}

export interface DailyStat {
  date: string;
  revenue: number;
  jobsCompleted: number;
}

export interface MonthRevenue {
  month: string;
  revenue: number;
}

export interface WhatsAppNotification {
  id: string;
  jobCardId: string;
  customerName: string;
  customerMobile: string;
  vehicleNumber: string;
  type: 'Received' | 'Repair Completed' | 'Invoice Ready' | 'Service Reminder';
  message: string;
  timestamp: string;
  status: 'Sent' | 'Delivered' | 'Read';
}

// Shared types used across backend routes and controllers

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
  jobNumber: string;
  customerName: string;
  customerMobile: string;
  vehicleNumber: string;
  vehicleModel: string;
  complaint: string;
  fuelLevel: 'Empty' | 'Quarter' | 'Half' | 'Three Quarters' | 'Full';
  odometer: number;
  assignedMechanic: string;
  status: ServiceWorkflowState;
  createdAt: string;
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
  price: number;
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  MapPin, 
  Wrench, 
  User, 
  Phone, 
  Gauge, 
  Fuel, 
  Calendar, 
  CheckSquare, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  MessageSquare, 
  UserPlus, 
  ArrowRight,
  Sparkles,
  Trash2,
  DollarSign
} from 'lucide-react';
import { JobCard, ServiceWorkflowState, InvoiceItem, InventoryItem } from '../types/index';

interface JobCardsProps {
  jobCards: JobCard[];
  inventory: InventoryItem[];
  onAddJobCard: (newCard: JobCard) => void;
  onUpdateJobCard: (cardId: string, updatedCard: Partial<JobCard>) => void;
  onTriggerNotification: (jobCardId: string, type: 'Received' | 'Repair Completed' | 'Invoice Ready' | 'Service Reminder') => void;
  openNewFormInitially?: boolean;
  prefilledCustomer?: {
    customerName: string;
    customerMobile: string;
    vehicleNumber: string;
    vehicleModel: string;
  } | null;
  onClearPrefilled?: () => void;
}

const COMPLAINT_PRESETS = [
  'Routine Servicing & Oil Change',
  'Engine Radiator Overheating Check',
  'Front Disk Brake Noise',
  'AC Cabin Air Sweep & Coolant Check',
  'Wheel Alignment & Steering Pull',
  'Suspension Screech / Bumpy Ride',
  'Battery Drainage Diagnostic Test'
];

const WORKFLOW_STEPS: ServiceWorkflowState[] = [
  'Received',
  'Inspection',
  'Approval',
  'Repair',
  'Quality Check',
  'Delivered'
];

export default function JobCards({ 
  jobCards, 
  inventory, 
  onAddJobCard, 
  onUpdateJobCard, 
  onTriggerNotification,
  openNewFormInitially = false,
  prefilledCustomer = null,
  onClearPrefilled
}: JobCardsProps) {
  const [showAddNewForm, setShowAddNewForm] = useState(openNewFormInitially);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for new job card
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [complaint, setComplaint] = useState('');
  const [fuelLevel, setFuelLevel] = useState<'Empty' | 'Quarter' | 'Half' | 'Three Quarters' | 'Full'>('Half');
  const [odometer, setOdometer] = useState<number>(45000);
  const [assignedMechanic, setAssignedMechanic] = useState('Ajay');

  // React Effect of prefilling customer records
  React.useEffect(() => {
    if (prefilledCustomer) {
      setCustomerName(prefilledCustomer.customerName);
      setCustomerMobile(prefilledCustomer.customerMobile);
      setVehicleNumber(prefilledCustomer.vehicleNumber);
      setVehicleModel(prefilledCustomer.vehicleModel);
      setOdometer(45000);
      setFuelLevel('Half');
      setComplaint('');
      setShowAddNewForm(true);
    }
  }, [prefilledCustomer]);

  // Input states for adding item on active card
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [itemType, setItemType] = useState<'Part' | 'Labour'>('Part');
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemQty, setItemQty] = useState<number>(1);

  // Filter job cards
  const filteredJobs = jobCards.filter(job => {
    const matchesFilter = activeFilter === 'All' || job.status === activeFilter;
    const matchesSearch = 
      job.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customerMobile.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const handleAddNewJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerMobile || !vehicleNumber || !vehicleModel) {
      alert('Please fill out all required fields: Name, Mobile, Vehicle Number, and Vehicle Model.');
      return;
    }

    // Auto-generate job ID & Job number
    const totalCount = jobCards.length;
    const jobNumberStr = `ASC-2026-${String(100 + totalCount + 1)}`;
    const newCard: JobCard = {
      id: `job-card-gen-${Date.now()}`,
      jobNumber: jobNumberStr,
      customerName,
      customerMobile,
      vehicleNumber: vehicleNumber.toUpperCase().replaceAll(' ', ''),
      vehicleModel,
      complaint,
      fuelLevel,
      odometer: Number(odometer),
      assignedMechanic,
      status: 'Received',
      createdAt: new Date().toISOString(),
      items: [],
      paymentStatus: 'Unpaid',
      totalAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
    };

    onAddJobCard(newCard);
    
    // Automatically trigger 'Vehicle Received' SMS Notification
    onTriggerNotification(newCard.id, 'Received');

    // Reset Form
    setCustomerName('');
    setCustomerMobile('');
    setVehicleNumber('');
    setVehicleModel('');
    setComplaint('');
    setFuelLevel('Half');
    setOdometer(45000);
    setAssignedMechanic('Ajay');
    setShowAddNewForm(false);
    onClearPrefilled?.();
  };

  // Handle stage update
  const handleWorkflowStageUpdate = (job: JobCard, nextStatus: ServiceWorkflowState) => {
    const changes: Partial<JobCard> = { status: nextStatus, lastUpdated: new Date().toISOString() };
    if (nextStatus === 'Delivered') {
      changes.deliveredAt = new Date().toISOString();
      // If payment is completely unpaid, we preserve state. Otherwise check
    }
    onUpdateJobCard(job.id, changes);

    // Auto-trigger Whatsapp update at milestones
    if (nextStatus === 'Delivered') {
      onTriggerNotification(job.id, 'Repair Completed');
    }
  };

  // Handle adding an item to a job card invoice
  const handleAddItemToJobCard = (job: JobCard) => {
    let desc = '';
    let price = 0;

    if (itemType === 'Part' && selectedPartId) {
      const part = inventory.find(p => p.id === selectedPartId);
      if (!part) return;
      if (part.stock < itemQty) {
        alert(`Insufficient stock! Currently available: ${part.stock} units.`);
        return;
      }
      desc = part.name;
      price = part.price;
    } else {
      if (!customItemDesc) {
        alert('Please fill in Description.');
        return;
      }
      desc = customItemDesc;
      price = Number(itemPrice);
    }

    const newItem: InvoiceItem = {
      id: `inv-item-${Date.now()}`,
      description: desc,
      quantity: Number(itemQty),
      price: price,
      type: itemType
    };

    // Make copy and update
    const updatedItems = [...job.items, newItem];
    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const dueAmount = Math.max(0, totalAmount - job.paidAmount);
    const pStatus = dueAmount === 0 ? 'Paid' : (job.paidAmount > 0 ? 'Due' : 'Unpaid');

    onUpdateJobCard(job.id, {
      items: updatedItems,
      totalAmount,
      dueAmount,
      paymentStatus: pStatus
    });

    // Deduct stock from inventory
    if (itemType === 'Part' && selectedPartId) {
      // Inventory handled dynamically via parent update state passed
      const part = inventory.find(p => p.id === selectedPartId);
      if (part) {
        part.stock -= itemQty;
      }
    }

    // Reset line input form
    setSelectedPartId('');
    setCustomItemDesc('');
    setItemPrice(0);
    setItemQty(1);
  };

  const handleRemoveInvoiceItem = (job: JobCard, itemIdx: number, item: InvoiceItem) => {
    const updatedItems = job.items.filter((_, idx) => idx !== itemIdx);
    const totalAmount = updatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const dueAmount = Math.max(0, totalAmount - job.paidAmount);
    const pStatus = dueAmount === 0 ? 'Paid' : (job.paidAmount > 0 ? 'Due' : 'Unpaid');

    onUpdateJobCard(job.id, {
      items: updatedItems,
      totalAmount,
      dueAmount,
      paymentStatus: pStatus
    });

    // Refund stock optionally
    if (item.type === 'Part') {
      const matchingPart = inventory.find(p => p.name === item.description);
      if (matchingPart) {
        matchingPart.stock += item.quantity;
      }
    }
  };

  const handleRecordPayment = (job: JobCard, amt: number) => {
    const newPaidAmount = Math.min(job.totalAmount, job.paidAmount + amt);
    const newDueAmount = Math.max(0, job.totalAmount - newPaidAmount);
    const pStatus = newDueAmount === 0 ? 'Paid' : 'Due';
    
    onUpdateJobCard(job.id, {
      paidAmount: newPaidAmount,
      dueAmount: newDueAmount,
      paymentStatus: pStatus
    });
  };

  return (
    <div className="space-y-6" id="jobcards-tab-container">
      {/* Header controls layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="jobcards-control-header">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 font-sans">Digital Job Cards Deck</h2>
          <p className="text-sm text-gray-500 font-sans">Manage service workflow, customer complaints, dynamic mechanic assignments, and smart estimation billing.</p>
        </div>
        <button
          onClick={() => setShowAddNewForm(!showAddNewForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-xs transition duration-200 flex items-center gap-2 cursor-pointer font-sans text-sm"
          id="toggle-add-jobcard-button"
        >
          {showAddNewForm ? 'Hide Form' : 'New Job Card'} <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Form Area - Slide/Fade Animated */}
      <AnimatePresence>
        {showAddNewForm && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white p-6 rounded-2xl border border-gray-150 shadow-md space-y-6"
            id="new-jobcard-form-wrapper"
          >
            <div className="flex items-center gap-2 text-indigo-700 border-b border-gray-100 pb-3" id="form-heading">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <h3 className="font-bold text-base font-sans">Register New Vehicle & Complaints</h3>
            </div>

            <form onSubmit={handleAddNewJob} className="grid grid-cols-1 md:grid-cols-3 gap-6" id="new-jobcard-form">
              {/* Customer details group */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Customer Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400 h-4.5 w-4.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Patil"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-sans text-sm"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    id="new-customer-name"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400 h-4.5 w-4.5" />
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile (e.g. 9876543210)"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-sans text-sm"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    id="new-customer-mobile"
                  />
                </div>
              </div>

              {/* Vehicle specific */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Vehicle Number *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 h-4.5 w-4.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH12AB1234"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-sans text-sm uppercase"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    id="new-vehicle-number"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Vehicle Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyundai Creta"
                  className="w-full px-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-sans text-sm"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  id="new-vehicle-model"
                />
              </div>

              {/* Gauge odometer meter */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Odometer (KM) *</label>
                <div className="relative">
                  <Gauge className="absolute left-3 top-3 text-gray-400 h-4.5 w-4.5" />
                  <input
                    type="number"
                    required
                    placeholder="Odometer Reading"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-sans text-sm"
                    value={odometer || ''}
                    onChange={(e) => setOdometer(Number(e.target.value))}
                    id="new-odometer-reading"
                  />
                </div>
              </div>

              {/* Fuel Level indicator indicator */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Fuel Meter level</label>
                <div className="relative">
                  <Fuel className="absolute left-3 top-3 text-gray-400 h-4.5 w-4.5" />
                  <select
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-sans text-sm cursor-pointer appearance-none"
                    value={fuelLevel}
                    onChange={(e) => setFuelLevel(e.target.value as any)}
                    id="new-fuel-level"
                  >
                    <option value="Empty">Empty</option>
                    <option value="Quarter">Quarter Tank</option>
                    <option value="Half">Half Tank</option>
                    <option value="Three Quarters">Three Quarters</option>
                    <option value="Full">Full Tank</option>
                  </select>
                </div>
              </div>

              {/* Mechanics dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Assigned Mechanic</label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-3 text-gray-400 h-4.5 w-4.5" />
                  <select
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-sans text-sm cursor-pointer appearance-none"
                    value={assignedMechanic}
                    onChange={(e) => setAssignedMechanic(e.target.value)}
                    id="new-assigned-mechanic"
                  >
                    <option value="Ajay">Ajay</option>
                    <option value="Ramesh">Ramesh</option>
                    <option value="Vikram">Vikram</option>
                    <option value="Vijay">Vijay</option>
                  </select>
                </div>
              </div>

              {/* Complaint detailed notes descriptions */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Customer Complaints / Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Engine Noise or Scheduled lubrication servicing"
                  className="w-full px-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-sans text-sm"
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  id="new-complaint-notes"
                />
                
                {/* Visual Quick complaint presets for extreme tablet/touch user friendliness */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Quick Tap Presets:</span>
                  <div className="flex flex-wrap gap-1.5" id="presets-container">
                    {COMPLAINT_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const current = complaint.trim();
                          setComplaint(current ? `${current}, ${preset}` : preset);
                        }}
                        className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-1 rounded transition duration-150 cursor-pointer border border-slate-200/60"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddNewForm(false);
                    onClearPrefilled?.();
                  }}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold font-sans text-gray-600 hover:bg-gray-50 cursor-pointer"
                  id="cancel-add-job-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1 cursor-pointer"
                  id="submit-new-jobcard"
                >
                  Create & Trigger SMS <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and search deck */}
      <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs flex flex-col md:flex-row justify-between gap-4" id="filter-deck">
        <div className="flex gap-1.5 overflow-x-auto pb-1" id="filter-tabs">
          {['All', ...WORKFLOW_STEPS].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans whitespace-nowrap cursor-pointer transition ${
                activeFilter === tab 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-150'
              }`}
              id={`filter-tab-${tab}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter by vehicle, mobile, or owner..."
          className="px-4 py-1.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 max-w-sm font-sans text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="search-jobcard-field"
        />
      </div>

      {/* Grid of Job Cards list view */}
      <div className="grid grid-cols-1 gap-4" id="filtered-jobcards-list">
        {filteredJobs.length === 0 ? (
          <div className="bg-white py-12 text-center text-gray-400 font-sans text-sm rounded-2xl border border-dashed border-gray-200" id="empty-state">
            No matching vehicle job cards found under "{activeFilter}". Create one to get started!
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isExpanded = expandedJobId === job.id;
            return (
              <div 
                key={job.id} 
                className="bg-white rounded-xl border border-gray-150 overflow-hidden hover:border-indigo-150 transition duration-150"
                id={`job-item-${job.id}`}
              >
                {/* Header Collapsible preview bar top heading */}
                <div 
                  className={`p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer transition ${
                    isExpanded ? 'bg-indigo-50/20' : 'hover:bg-gray-50/50'
                  }`}
                  onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                  id={`job-header-bar-${job.id}`}
                >
                  {/* Left elements: Job No, Vehicle Plate, Customer detail */}
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-md">
                      {job.jobNumber}
                    </span>
                    
                    <span className="font-mono font-black text-sm tracking-wider text-gray-800 bg-slate-900 text-slate-100 px-3 py-1 rounded">
                      {job.vehicleNumber}
                    </span>

                    <span className="text-gray-500 font-sans text-xs">
                      {job.vehicleModel}
                    </span>

                    <span className="text-xs text-gray-400">•</span>

                    <span className="font-semibold text-gray-800 text-xs font-sans">
                      {job.customerName} ({job.customerMobile})
                    </span>
                  </div>

                  {/* Right side status tags & actions toggle */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 flex-wrap">
                    {/* Stepper Pipeline Status tag */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      job.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      job.status === 'Quality Check' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                      job.status === 'Repair' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      job.status === 'Approval' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                      job.status === 'Inspection' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      'bg-gray-150 text-gray-600'
                    }`}>
                      {job.status}
                    </span>

                    {/* Paid tag status */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      job.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      job.paymentStatus === 'Due' ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse' :
                      'bg-rose-50 text-rose-850 border border-rose-200'
                    }`}>
                      {job.paymentStatus === 'Paid' ? 'Paid' : `Due: ₹${job.dueAmount}`}
                    </span>

                    {/* Estimate value price */}
                    <div className="text-right text-xs font-black font-sans text-gray-700">
                      ₹{job.totalAmount}
                    </div>

                    {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400 hidden lg:block" /> : <ChevronDown className="h-4 w-4 text-gray-400 hidden lg:block" />}
                  </div>
                </div>

                {/* Expanded Details Form and operations console */}
                {isExpanded && (
                  <div className="border-t border-gray-150 p-6 bg-gray-50/30 space-y-6" id={`job-extended-${job.id}`}>
                    {/* Visual workflow interactive track segment */}
                    <div className="space-y-2" id="workflow-pipeline-visualiser">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-sans">Active Workflow Pipeline (Tap to Advance)</h4>
                      
                      <div className="flex flex-col lg:flex-row gap-1 lg:gap-0 font-sans text-xs bg-white rounded-xl border border-gray-200/60 p-2 shadow-xs" id="stepper">
                        {WORKFLOW_STEPS.map((step, idx) => {
                          const isCurrent = job.status === step;
                          const isPast = WORKFLOW_STEPS.indexOf(job.status) > idx;

                          return (
                            <button
                              key={step}
                              onClick={() => handleWorkflowStageUpdate(job, step)}
                              className={`flex-1 flex items-center justify-center p-2.5 py-3 gap-2 border-b-2 lg:border-b-0 lg:border-r last:border-none cursor-pointer transition ${
                                isCurrent 
                                  ? 'bg-indigo-650 text-white font-bold border-indigo-700 rounded-lg' 
                                  : isPast 
                                    ? 'bg-emerald-50/50 text-emerald-700 border-emerald-100 hover:bg-emerald-50/70' 
                                    : 'text-gray-400 hover:bg-slate-50'
                              }`}
                              id={`step-node-${step}`}
                            >
                              <span className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] border font-bold bg-white text-slate-700">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metadata column details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6" id="job-metadata-deck">
                      {/* Section 1: Vehicle & Intake specifications */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200/50 shadow-xs space-y-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase font-sans">Vehicle Details</h4>
                        
                        <div className="space-y-2.5 text-sm font-sans">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Owner Name</span>
                            <span className="font-bold text-gray-800">{job.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Mobile Number</span>
                            <span className="font-semibold text-gray-800">{job.customerMobile}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Odometer</span>
                            <span className="font-mono font-bold text-gray-850 bg-slate-100 rounded px-1.5">{job.odometer.toLocaleString()} KM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Fuel Level</span>
                            <span className="font-medium text-amber-700">{job.fuelLevel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Assigned Tech</span>
                            <span className="font-semibold text-gray-800">🔧 {job.assignedMechanic}</span>
                          </div>
                          <div className="pt-1.5 border-t border-slate-100">
                            <span className="text-[10px] text-gray-450 font-mono block">Registered Since:</span>
                            <span className="text-[11px] font-medium text-gray-650 block font-sans">
                              {new Date(job.createdAt).toLocaleString('en-IN', { timeZone: 'UTC' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Complaints & Mechanic Notes */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200/50 shadow-xs space-y-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase font-sans">Complaints & Diagnostics</h4>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 h-36 overflow-y-auto" id="complaints-pane">
                          <p className="text-xs font-medium text-gray-700 leading-relaxed font-sans">{job.complaint || 'No complaint listed.'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onTriggerNotification(job.id, 'Received')}
                            className="flex-1 py-1 px-2.5 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 text-indigo-600 text-2xs font-semibold rounded-lg font-sans flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="h-3 w-3" /> SMS Receipt
                          </button>
                          <button
                            onClick={() => onTriggerNotification(job.id, 'Repair Completed')}
                            className="flex-1 py-1 px-2.5 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 text-emerald-600 text-2xs font-semibold rounded-lg font-sans flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckSquare className="h-3 w-3" /> SMS Complete
                          </button>
                        </div>
                      </div>

                      {/* Section 3 & 4: Estimations & Parts builder Invoice */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200/50 shadow-xs space-y-3 md:col-span-2 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center pb-2 border-b border-gray-100 mb-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase font-sans">Estimations / Parts Invoice Items</h4>
                            <span className="text-2xs text-gray-450 font-mono italic">Click item to delete</span>
                          </div>

                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1" id="invoice-items-list">
                            {job.items.length === 0 ? (
                              <div className="text-center py-6 text-gray-400 text-xs font-sans">
                                No spares or labor actions recorded yet. Use form below to add.
                              </div>
                            ) : (
                              job.items.map((item, idx) => (
                                <div 
                                  key={item.id} 
                                  className="flex justify-between items-center text-xs p-1.5 px-2 bg-slate-50 border border-slate-100 rounded-md hover:bg-rose-50 hover:border-rose-100 hover:text-rose-700 group cursor-pointer transition"
                                  onClick={() => handleRemoveInvoiceItem(job, idx, item)}
                                  id={`job-item-row-${idx}`}
                                >
                                  <div className="font-sans space-y-0.5">
                                    <p className="font-semibold text-gray-800 group-hover:text-rose-700">{item.description}</p>
                                    <p className="text-[10px] text-gray-400 group-hover:text-rose-500">
                                      {item.type} | Qty: {item.quantity} x ₹{item.price}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono font-bold font-sans">₹{item.price * item.quantity}</span>
                                    <Trash2 className="h-3.5 w-3.5 text-gray-400 group-hover:text-rose-600 group-hover:block hidden shrink-0" />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Totals aggregate */}
                        <div className="pt-3 border-t border-gray-100 space-y-2 mt-2">
                          <div className="flex justify-between text-xs font-bold text-gray-700">
                            <span>TOTAL BIIL AMOUNT:</span>
                            <span className="text-sm font-mono text-gray-900 font-black">₹{job.totalAmount.toLocaleString('en-IN')}</span>
                          </div>

                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Paid Amount:</span>
                            <span className="font-mono">₹{job.paidAmount.toLocaleString('en-IN')}</span>
                          </div>

                          {job.dueAmount > 0 && (
                            <div className="flex justify-between text-xs text-rose-650 font-bold">
                              <span>DUE TODAY:</span>
                              <span className="font-mono">₹{job.dueAmount.toLocaleString('en-IN')}</span>
                            </div>
                          )}

                          {/* Quick Payment register action buttons bar */}
                          <div className="flex flex-wrap gap-2 pt-2" id="payment-action-buttons">
                            {job.dueAmount > 0 && (
                              <>
                                <button
                                  onClick={() => handleRecordPayment(job, job.dueAmount)}
                                  className="flex-1 py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg cursor-pointer font-sans"
                                >
                                  Collect ₹{job.dueAmount}
                                </button>
                                <button
                                  onClick={() => {
                                    const partAmt = Number(prompt(`Enter partial payment amount for ${job.customerName}:`, '1000'));
                                    if (partAmt > 0) {
                                      handleRecordPayment(job, partAmt);
                                    }
                                  }}
                                  className="py-1 px-2.5 bg-gray-150 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold rounded-lg cursor-pointer font-sans"
                                >
                                  Collect Partial
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => onTriggerNotification(job.id, 'Invoice Ready')}
                              className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg cursor-pointer font-sans flex items-center justify-center gap-1"
                            >
                              <FileText className="h-3.5 w-3.5" /> SMS Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form to append parts inside active Estimator panel */}
                    <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-inner" id="add-item-console">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 font-sans">Add Invoice Line (Part or Labour task)</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" id="add-billable-item-form">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-gray-500 uppercase font-sans">Line Category</label>
                          <select 
                            className="w-full p-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-sans text-xs cursor-pointer focus:outline-none"
                            value={itemType}
                            onChange={(e) => {
                              setItemType(e.target.value as any);
                              setSelectedPartId('');
                              setCustomItemDesc('');
                              setItemPrice(0);
                            }}
                          >
                            <option value="Part">Spare Part</option>
                            <option value="Labour">Labour / Service Charge</option>
                          </select>
                        </div>

                        {/* Dropdown changes dynamically between spare part stock list or custom prompt string field */}
                        {itemType === 'Part' ? (
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-gray-500 uppercase font-sans">Select Part from Spares Stock</label>
                            <select
                              className="w-full p-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-sans text-xs cursor-pointer focus:outline-none"
                              value={selectedPartId}
                              onChange={(e) => {
                                const pId = e.target.value;
                                setSelectedPartId(pId);
                                const found = inventory.find(i => i.id === pId);
                                if (found) {
                                  setItemPrice(found.price);
                                }
                              }}
                            >
                              <option value="">-- Choose Spare Stock --</option>
                              {inventory.map((item) => (
                                <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                                  {item.name} (Qty: {item.stock}) - ₹{item.price} each
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-gray-500 uppercase font-sans">Labour Task Description</label>
                            <input
                              type="text"
                              placeholder="e.g. Engine Calibration / Servicing"
                              className="w-full p-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-sans text-xs focus:outline-none"
                              value={customItemDesc}
                              onChange={(e) => setCustomItemDesc(e.target.value)}
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-gray-500 uppercase font-sans">Price (₹)</label>
                            <input
                              type="number"
                              className="w-full p-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none"
                              value={itemPrice || ''}
                              onChange={(e) => setItemPrice(Number(e.target.value))}
                              disabled={itemType === 'Part' && !!selectedPartId} // Prefills based on model selection
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-gray-500 uppercase font-sans">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              className="w-full p-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none"
                              value={itemQty}
                              onChange={(e) => setItemQty(Number(e.target.value))}
                            />
                          </div>
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => handleAddItemToJobCard(job)}
                            className="w-full py-1.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition duration-150 cursor-pointer text-center font-sans"
                          >
                            Add To Estimate
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

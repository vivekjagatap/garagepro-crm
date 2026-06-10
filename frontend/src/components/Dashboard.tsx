/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Wrench, 
  CheckCircle2, 
  Hourglass, 
  IndianRupee, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  Activity, 
  Search, 
  UserCheck,
  MessageSquare,
  Clock,
  Smartphone
} from 'lucide-react';
import { JobCard, InventoryItem, MonthRevenue } from '../types/index';

interface DashboardProps {
  jobCards: JobCard[];
  inventory: InventoryItem[];
  monthlyRevenue: MonthRevenue[];
  onNavigate: (tab: string, arg?: any) => void;
  onSearchVehicle: (vehicleNum: string) => void;
  onTriggerNotification?: (jobId: string, type: 'Received' | 'Repair Completed' | 'Invoice Ready' | 'Service Reminder') => void;
}

export default function Dashboard({ 
  jobCards, 
  inventory, 
  monthlyRevenue, 
  onNavigate,
  onSearchVehicle,
  onTriggerNotification
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'table' | 'kanban'>('table');

  // Reactive calculations
  const totalJobsCount = jobCards.length;
  const pendingJobs = jobCards.filter(j => j.status !== 'Delivered');
  const completedJobs = jobCards.filter(j => j.status === 'Delivered');
  
  // Calculate revenue (Paid amount)
  const revenueToday = jobCards.reduce((acc, j) => acc + j.paidAmount, 0);
  // Calculate due payments
  const duePayments = jobCards.reduce((acc, j) => acc + j.dueAmount, 0);

  // Overdue ledger items
  const overdueCustomers = jobCards.filter(j => j.dueAmount > 0).slice(0, 3);

  // Low Stock Items alert
  const lowStockItems = inventory.filter(item => item.stock <= item.minStockAlert);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchVehicle(searchQuery.trim());
    }
  };

  // Find maximum revenue for scaling chart
  const maxRevValue = Math.max(...monthlyRevenue.map(m => m.revenue), 100000);

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-2xl shadow-sm border border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-6" id="dashboard-hero-banner">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-sans">
            AutoServe Workshop Workspace
          </h1>
          <p className="text-blue-100 font-sans text-sm md:text-base max-w-xl">
            Streamline job cards, track mechanics, manage inventory, and trigger automatic customer WhatsApp status updates.
          </p>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="w-full md:w-auto flex-1 max-w-md relative" id="quick-search-form">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Quick Check Vehicle History (Type MH12AB1234)..." 
            className="w-full pl-10 pr-24 py-3 bg-white text-gray-900 rounded-xl border-none focus:ring-2 focus:ring-indigo-300 shadow-inner placeholder:text-gray-400 font-sans text-sm focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="quick-vehicle-search"
          />
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1.5 px-4 rounded-lg font-sans text-xs transition duration-200"
            id="quick-search-button"
          >
            Search
          </button>
        </form>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="dashboard-stats-grid">
        {/* Met 1: Total Today's Jobs */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between h-32 hover:border-blue-100 transition duration-300" id="stat-todays-jobs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Today's Jobs</span>
            <div className="p-1 px-2 text-[10px] font-medium bg-blue-50 text-blue-700 rounded-full flex items-center gap-1">
              <Activity className="h-3 w-3" /> Live
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold font-sans text-gray-900">{totalJobsCount}</span>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Total registered</p>
          </div>
        </div>

        {/* Met 2: Pending Services */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between h-32 hover:border-yellow-100 transition duration-300" id="stat-pending-services">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Pending Services</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Hourglass className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold font-sans text-amber-600">{pendingJobs.length}</span>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Work in progress</p>
          </div>
        </div>

        {/* Met 3: Completed Jobs */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between h-32 hover:border-green-100 transition duration-300" id="stat-completed-services">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Completed Jobs</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold font-sans text-green-600">{completedJobs.length}</span>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Ready & Delivered</p>
          </div>
        </div>

        {/* Met 4: Revenue Today */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between h-32 hover:border-indigo-100 transition duration-300" id="stat-revenue-today">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Revenue Today</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-650 rounded-lg">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-sans text-gray-900">
              ₹{revenueToday.toLocaleString('en-IN')}
            </span>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Cleared billing</p>
          </div>
        </div>

        {/* Met 5: Due Payments */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between h-32 hover:border-rose-100 transition duration-300 col-span-2 lg:col-span-1" id="stat-due-payments">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Due Payments</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-sans text-rose-500">
              ₹{duePayments.toLocaleString('en-IN')}
            </span>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Pending collection</p>
          </div>
        </div>
      </div>

      {/* Main Grid Content Bar & Side blocks */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="dashboard-graphics-row">
        {/* Left 2 Cols: Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs xl:col-span-2 space-y-4" id="dashboard-revenue-chart-card">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-800 text-lg font-sans">Monthly Revenue Trend</h3>
              <p className="text-xs text-gray-500 font-sans">Performance analytics of recent months</p>
            </div>
            
            <button 
              onClick={() => onNavigate('jobcards')}
              className="text-indigo-650 hover:text-indigo-700 text-xs font-medium flex items-center gap-1 font-sans cursor-pointer"
              id="view-all-jobs-button"
            >
              Manage Active Jobs <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          {/* SVG Animated Chart */}
          <div className="relative pt-6 min-h-[220px] flex items-end justify-between" id="revenue-graph-viewport">
            <div className="absolute left-0 right-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none" id="graph-guides">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const labelValue = Math.round(maxRevValue * ratio);
                return (
                  <div key={ratio} className="w-full flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                    <span className="w-10 text-right">₹{(labelValue / 1000).toFixed(0)}k</span>
                    <hr className="flex-1 border-t border-dashed border-gray-100" />
                  </div>
                );
              })}
            </div>

            <div className="w-full flex justify-between items-end pl-12 pr-4 relative z-10" id="chart-bars-container">
              {monthlyRevenue.map((data, index) => {
                const percent = (data.revenue / maxRevValue) * 100;
                return (
                  <div key={data.month} className="flex flex-col items-center flex-1 group" id={`chart-bar-${index}`}>
                    {/* Hover Tooltip tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded shadow-xs pointer-events-none whitespace-nowrap transition duration-200">
                      ₹{data.revenue.toLocaleString('en-IN')}
                    </div>
                    
                    {/* The bar */}
                    <motion.div 
                      className="w-12 bg-gradient-to-t from-indigo-500 to-indigo-650 rounded-t-md cursor-pointer hover:from-indigo-600 hover:to-indigo-700 transition duration-150"
                      initial={{ height: 0 }}
                      animate={{ height: `${percent * 1.5}px` }}
                      transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                    />
                    
                    {/* Month Label */}
                    <span className="text-xs font-medium font-sans text-gray-500 mt-2">{data.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Alerts & Inventory Check */}
        <div className="space-y-6" id="dashboard-right-sidebar">
          {/* Low Stock Alerts */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4" id="inventory-alert-box">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 text-base font-sans flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
                Inventory Tracker
              </h3>
              
              <span className="bg-amber-50 text-amber-700 text-[10px] font-semibold font-sans px-2.5 py-0.5 rounded-full">
                {lowStockItems.length} Low Stock
              </span>
            </div>

            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1" id="low-stock-list-container">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm font-sans">
                  ✓ All stock levels are sufficient!
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center p-3 rounded-xl bg-amber-50/50 border border-amber-100 hover:bg-amber-50 transition duration-150"
                    id={`low-stock-item-${item.id}`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-gray-800 font-sans">{item.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        Available: <span className="font-bold text-amber-600">{item.stock}</span> units (Min: {item.minStockAlert})
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => onNavigate('inventory')}
                      className="text-[10px] font-bold text-indigo-650 hover:text-indigo-800 hover:underline font-sans cursor-pointer whitespace-nowrap"
                    >
                      Fill Stock
                    </button>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => onNavigate('inventory')}
              className="w-full text-center text-xs text-indigo-650 hover:text-indigo-700 font-semibold py-2.5 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-120/40 rounded-xl transition cursor-pointer font-sans block"
              id="goto-inventory-button"
            >
              Add Parts / Spares Inventory
            </button>
          </div>

          {/* Outstanding Overdue Dues Reminders - High User Friendliness */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4 font-sans" id="due-reminders-box">
            <div className="flex justify-between items-center border-b border-rose-50 pb-2">
              <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <IndianRupee className="h-4.5 w-4.5 text-rose-500" /> Overdue Balances
              </h3>
              <span className="bg-rose-50 text-rose-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Reminders
              </span>
            </div>

            <div className="space-y-3" id="due-reminders-list">
              {overdueCustomers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-5 font-sans">No outstanding balances. Splendid!</p>
              ) : (
                overdueCustomers.map((job) => (
                  <div key={job.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex justify-between items-center gap-2 hover:bg-slate-50 transition duration-150">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-700 font-sans">{job.customerName}</p>
                      <p className="text-[10px] text-gray-400 font-sans">{job.vehicleNumber} ({job.vehicleModel})</p>
                      <p className="text-[10px] text-rose-600 font-mono font-bold">Due: ₹{job.dueAmount.toLocaleString('en-IN')}</p>
                    </div>
                    {onTriggerNotification && (
                      <button
                        onClick={() => onTriggerNotification(job.id, 'Invoice Ready')}
                        className="py-1 px-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1 cursor-pointer transition text-[10px] font-bold font-sans border border-emerald-250/50"
                        title="Simulate WhatsApp payment reminder alert"
                      >
                        <MessageSquare className="h-3 w-3 text-emerald-500" /> WhatsApp
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Control Deck */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4" id="quick-actions-card">
            <h3 className="font-semibold text-gray-800 text-base font-sans">Quick Action Bench</h3>
            
            <div className="grid grid-cols-2 gap-3" id="quick-actions-grid">
              <button 
                onClick={() => onNavigate('jobcards', { openNewJobForm: true })}
                className="p-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-left border border-indigo-100/40 transition duration-150 space-y-1.5 cursor-pointer flex flex-col justify-start text-indigo-700"
                id="qa-new-jobcard"
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs font-bold font-sans">Create Job Card</span>
              </button>

              <button 
                onClick={() => {
                  onSearchVehicle('MH12AB1234');
                }}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-left border border-emerald-100/40 transition duration-150 space-y-1.5 cursor-pointer flex flex-col justify-start text-emerald-700"
                id="qa-demo-customer"
              >
                <UserCheck className="h-5 w-5" />
                <span className="text-xs font-bold font-sans">Demo: Rahul Patil</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Active Job Card Track Overview list summary */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4 animate-fade-in" id="recent-active-jobs-sec">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-3" id="active-jobs-header">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg font-sans">Today's Ongoing Repairs</h3>
            <p className="text-xs text-gray-500 font-sans">Live track of vehicles in the workshop</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto" id="dashboard-toggle-row">
            {/* Table / Kanban View Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/40" id="dash-view-type-switcher">
              <button
                onClick={() => setViewType('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition whitespace-nowrap cursor-pointer ${
                  viewType === 'table' ? 'bg-white text-indigo-700 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
                }`}
                id="btn-board-table-view"
              >
                Table View
              </button>
              <button
                onClick={() => setViewType('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition whitespace-nowrap cursor-pointer ${
                  viewType === 'kanban' ? 'bg-white text-indigo-700 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
                }`}
                id="btn-board-kanban-view"
              >
                Kanban Board
              </button>
            </div>

            <button 
              onClick={() => onNavigate('jobcards')}
              className="text-xs font-bold font-sans text-indigo-650 hover:text-indigo-800 bg-indigo-50/60 p-2 px-3 rounded-lg hover:bg-indigo-50 transition cursor-pointer whitespace-nowrap"
              id="view-all-repairs-deck"
            >
              Show All {totalJobsCount} Jobs
            </button>
          </div>
        </div>

        {viewType === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2" id="dashboard-kanban-viewport">
            {/* Col 1: Received */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150/50" id="kb-col-rev-insp">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span> Received & Inspection
                </span>
                <span className="bg-slate-200/80 text-slate-700 text-[10px] font-black px-2.5 py-0.5 rounded-full font-mono">
                  {jobCards.filter(j => j.status === 'Received' || j.status === 'Inspection' || j.status === 'Approval').length}
                </span>
              </div>
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {jobCards.filter(j => j.status === 'Received' || j.status === 'Inspection' || j.status === 'Approval').length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-12 font-sans">No vehicles in this phase.</p>
                ) : (
                  jobCards.filter(j => j.status === 'Received' || j.status === 'Inspection' || j.status === 'Approval').map(job => (
                    <div 
                      key={job.id} 
                      onClick={() => onNavigate('jobcards')}
                      className="bg-white p-3.5 rounded-xl border border-gray-150 shadow-2xs hover:border-indigo-400 cursor-pointer transition hover:shadow-xs space-y-2.5 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-gray-400 font-mono group-hover:text-indigo-650 transition">{job.jobNumber}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-750 px-2 py-0.5 rounded-full font-bold font-sans">{job.status}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 font-sans">{job.customerName}</h4>
                        <p className="text-[10px] text-slate-500 font-mono font-bold mt-0.5 bg-slate-50 px-2 py-0.5 rounded inline-block">{job.vehicleNumber}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans italic truncate">“{job.complaint || 'General Checkup'}”</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Col 2: Repair */}
            <div className="bg-blue-50/20 p-4 rounded-2xl border border-blue-100/50" id="kb-col-active-rep">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-sans flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Repair & QC Phase
                </span>
                <span className="bg-blue-100/80 text-blue-700 text-[10px] font-black px-2.5 py-0.5 rounded-full font-mono">
                  {jobCards.filter(j => j.status === 'Repair' || j.status === 'Quality Check').length}
                </span>
              </div>
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {jobCards.filter(j => j.status === 'Repair' || j.status === 'Quality Check').length === 0 ? (
                  <p className="text-xs text-blue-400 text-center py-12 font-sans">No active repairs.</p>
                ) : (
                  jobCards.filter(j => j.status === 'Repair' || j.status === 'Quality Check').map(job => (
                    <div 
                      key={job.id} 
                      onClick={() => onNavigate('jobcards')}
                      className="bg-white p-3.5 rounded-xl border border-blue-100/70 shadow-2xs hover:border-blue-500 cursor-pointer transition hover:shadow-xs space-y-2.5 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-gray-400 font-mono group-hover:text-blue-600 transition">{job.jobNumber}</span>
                        <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold font-sans">{job.status}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-blue-900 font-sans">{job.customerName}</h4>
                        <p className="text-[10px] text-blue-600 font-mono font-bold mt-0.5 bg-blue-50 px-2 py-0.5 rounded inline-block">{job.vehicleNumber}</p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1.5 border-t border-gray-50">
                        <span>🔧 {job.assignedMechanic}</span>
                        <span className="font-bold text-blue-950 font-mono">₹{job.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Col 3: Delivered */}
            <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/50" id="kb-col-ready-delivered">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 font-sans flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ready & Delivered
                </span>
                <span className="bg-emerald-100/80 text-emerald-855 text-[10px] font-black px-2.5 py-0.5 rounded-full font-mono">
                  {jobCards.filter(j => j.status === 'Delivered').length}
                </span>
              </div>
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {jobCards.filter(j => j.status === 'Delivered').length === 0 ? (
                  <p className="text-xs text-emerald-400 text-center py-12 font-sans">No delivered vehicles today.</p>
                ) : (
                  jobCards.filter(j => j.status === 'Delivered').map(job => (
                    <div 
                      key={job.id} 
                      onClick={() => onNavigate('jobcards')}
                      className="bg-white p-3.5 rounded-xl border border-emerald-100/70 shadow-2xs hover:border-emerald-500 cursor-pointer transition hover:shadow-xs space-y-2.5 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-gray-400 font-mono group-hover:text-emerald-750 transition">{job.jobNumber}</span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-750 px-2 py-0.5 rounded-full font-bold font-sans">Delivered</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950 font-sans">{job.customerName}</h4>
                        <p className="text-[10px] text-emerald-650 font-mono font-bold mt-0.5 bg-emerald-50 px-2 py-0.5 rounded inline-block">{job.vehicleNumber}</p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-emerald-600 pt-1.5 border-t border-gray-50">
                        <span className="font-bold">✓ Collected</span>
                        <span className="font-bold font-mono text-gray-850">₹{job.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto" id="dashboard-recent-table-viewport">
          <table className="w-full text-left border-collapse" id="dashboard-recent-table">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 font-medium font-sans uppercase bg-gray-50/50">
                <th className="py-3 px-4 rounded-l-xl">Job No</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm font-sans" id="dashboard-recent-table-body">
              {jobCards.slice(0, 5).map((job) => (
                <tr key={job.id} className="hover:bg-gray-50/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-500 text-xs">
                    {job.jobNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <p className="font-bold text-gray-800 text-xs bg-slate-100 px-2 py-0.5 rounded-md inline-block tracking-wider font-mono">
                        {job.vehicleNumber}
                      </p>
                      <p className="text-xs text-gray-500">{job.vehicleModel}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-800 text-xs">
                    {job.customerName}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1.5 bh-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-100">
                      🔧 {job.assignedMechanic}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      job.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-100' :
                      job.status === 'Quality Check' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                      job.status === 'Repair' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      job.status === 'Approval' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                      job.status === 'Inspection' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      'bg-gray-50 text-gray-700 border border-gray-100'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold font-mono text-gray-850 text-xs">
                    ₹{job.totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}

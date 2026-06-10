/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Printer, 
  Download, 
  MapPin, 
  Phone, 
  User, 
  IndianRupee, 
  TrendingUp, 
  FileSignature, 
  ChevronRight,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { JobCard } from '../types/index';

interface InvoiceGeneratorProps {
  jobCards: JobCard[];
  selectedJobIdInitially?: string;
}

export default function InvoiceGenerator({ jobCards, selectedJobIdInitially = '' }: InvoiceGeneratorProps) {
  const [selectedJobId, setSelectedJobId] = useState(selectedJobIdInitially || jobCards[0]?.id || '');
  const [includeGst, setIncludeGst] = useState(false); // Toggle between regular manual cash bill or official GST invoice

  const activeJob = jobCards.find(j => j.id === selectedJobId) || jobCards[0];

  const handlePrint = () => {
    window.print();
  };

  // Standard invoice values
  const getSubtotal = () => {
    if (!activeJob) return 0;
    return activeJob.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getGstAmount = () => {
    if (!includeGst) return 0;
    return Math.round(getSubtotal() * 0.18); // 18% standard GST on spare parts and garage labor
  };

  const getGrandTotal = () => {
    return getSubtotal() + getGstAmount();
  };

  return (
    <div className="space-y-6" id="billing-tab-container">
      {/* Header sections */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden" id="billing-header">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 font-sans">Professional Billing Office</h2>
          <p className="text-sm text-gray-500 font-sans">Select active workshops jobs, customize tax settings, and print/export neat billing receipts for customer delivery.</p>
        </div>
        
        {activeJob && (
          <button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-xs transition duration-200 flex items-center gap-2 cursor-pointer font-sans text-sm"
          >
            <Printer className="h-4 w-4" /> Print / PDF Invoice
          </button>
        )}
      </div>

      {/* Control panel deck containing dropdown and billing modifiers */}
      <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col md:flex-row gap-5 items-center justify-between print:hidden" id="billing-modifiers">
        <div className="w-full md:w-auto flex-1 max-w-sm space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Pick Job Card</label>
          <select
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-sans text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-305"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            id="billing-job-picker"
          >
            <option value="">-- Choose Job --</option>
            {jobCards.map((job) => (
              <option key={job.id} value={job.id}>
                {job.jobNumber} | {job.vehicleNumber} ({job.customerName})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6" id="gst-toggle-row">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-gray-700 font-sans">Official GST Billing (18% Tax)</p>
            <p className="text-2xs text-gray-450 font-sans">Auto-append CGST + SGST tax details onto printed paper layout.</p>
          </div>
          
          <button
            onClick={() => setIncludeGst(!includeGst)}
            className="text-indigo-650 cursor-pointer"
            id="gst-toggle-switch"
          >
            {includeGst ? (
              <ToggleRight className="h-10 w-10 text-indigo-600" />
            ) : (
              <ToggleLeft className="h-10 w-10 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Invoice Sheet - Styled like actual paper, centered with pristine shadows */}
      {activeJob ? (
        <div className="mx-auto max-w-3xl bg-white p-8 md:p-12 rounded-xl border border-gray-200 shadow-lg relative print:shadow-none print:border-none print:p-0 print:my-0" id="invoice-sheet">
          {/* Aesthetic Watermark banner for on-screen user layout */}
          <div className="absolute top-4 right-4 text-[10px] font-mono select-none text-indigo-400 bg-indigo-50 border border-indigo-100 uppercase px-2 py-0.5 rounded font-bold print:hidden">
            AutoServe billing preview
          </div>

          <div className="space-y-8" id="invoice-bill-root">
            {/* Logo Heading block and Workshop Metadata details row */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-150 pb-6" id="invoice-bill-header">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-indigo-650 text-white rounded-lg flex items-center justify-center font-black font-sans text-sm">
                    A
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-gray-900 font-sans">AUTOSERVE CRM</h1>
                </div>
                <p className="text-2xs font-bold text-gray-400 uppercase tracking-widest font-sans">PREMIUM WORKSHOP SOLUTIONS</p>
                
                <div className="text-2xs text-gray-400 space-y-0.5 font-sans">
                  <p>Plot 42, Service Road, Senapati Bapat Marg,</p>
                  <p>Near Symbiosis College, Pune, Maharashtra - 411004</p>
                  <p>📞 Phone: +91 90214 56387 | ✉ Email: billings@autoserve.in</p>
                </div>
              </div>

              <div className="text-left md:text-right space-y-1.5 text-xs font-sans">
                <h3 className="text-lg font-bold uppercase text-gray-550">SERVICE INVOICE</h3>
                <div>
                  <span className="text-gray-400">Invoice Number:</span>
                  <span className="font-mono font-bold text-gray-800 ml-1.5">{activeJob.jobNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400">Date Logged:</span>
                  <span className="font-medium ml-1.5">
                    {new Date(activeJob.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className="ml-1.5 font-bold uppercase text-emerald-600">{activeJob.paymentStatus}</span>
                </div>
              </div>
            </div>

            {/* Customer information metadata block row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4.5 bg-slate-50/50 rounded-lg border border-slate-100" id="invoice-crm-meta">
              <div className="space-y-1.5 text-xs font-sans">
                <p className="font-bold text-gray-400 uppercase tracking-wider text-3xs">BILLED TO CUSTOMER</p>
                <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
                  <User className="h-4 w-4 text-gray-400" /> {activeJob.customerName}
                </p>
                <p className="text-gray-500 font-sans">Contact: +91 {activeJob.customerMobile}</p>
                <p className="text-gray-500 font-sans">Address: Registered Customer Profile, Pune Region</p>
              </div>

              <div className="space-y-1.5 text-xs font-sans md:text-right md:border-l md:border-gray-150 md:pl-6">
                <p className="font-bold text-gray-400 uppercase tracking-wider text-3xs">VEHICLE META PROFILE</p>
                <p className="text-sm font-bold text-gray-800 tracking-wider font-mono">
                  🚗 {activeJob.vehicleNumber}
                </p>
                <p className="text-gray-500">Model: <span className="font-semibold text-gray-700">{activeJob.vehicleModel}</span></p>
                <p className="text-gray-500">Odometer: <span className="font-bold text-gray-750 font-mono">{activeJob.odometer.toLocaleString()} KM</span></p>
              </div>
            </div>

            {/* Complaints description block notes */}
            <div className="space-y-1 text-xs font-sans border-l-4 border-indigo-200 pl-3">
              <p className="font-bold text-gray-400 uppercase tracking-wide text-3xs">Logged Workshop Complaints</p>
              <p className="text-gray-650 italic">"{activeJob.complaint || 'Routine lube diagnostics service action.'}"</p>
            </div>

            {/* Listing Billable Parts details Table */}
            <div className="space-y-2" id="invoice-items-table">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-gray-150 font-bold uppercase text-gray-400 bg-slate-50/60 font-sans">
                    <th className="py-2.5 px-2">Line Service Description</th>
                    <th className="py-2.5 px-2 w-20">Type</th>
                    <th className="py-2.5 px-2 text-center w-20">Qty</th>
                    <th className="py-2.5 px-2 text-right w-24">Unit (₹)</th>
                    <th className="py-2.5 px-2 text-right w-24">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 leading-relaxed font-sans" id="invoice-items-rows">
                  {activeJob.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400 font-sans">
                        No mechanical spares or service items added onto job card bill folder yet.
                      </td>
                    </tr>
                  ) : (
                    activeJob.items.map((item, idx) => (
                      <tr key={item.id} className="text-gray-700">
                        <td className="py-2.5 px-2 font-semibold">{item.description}</td>
                        <td className="py-2.5 px-2 text-gray-500 font-sans text-2xs uppercase tracking-wide">{item.type}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-medium">{item.quantity}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-gray-500">₹{item.price}</td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-gray-800">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations summaries footer */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-t border-gray-150 pt-6" id="invoice-bill-totals">
              <div className="space-y-2 text-2xs text-gray-400 italic max-w-sm font-sans">
                <p>Terms & Conditions:</p>
                <p>1. Warranty on genuine spares as specified by manufacture company only.</p>
                <p>2. Vehicle delivery strictly upon clearance of total bill amounts due.</p>
                <p>3. AutoServe CRM automatically sends repair updates to customer phones.</p>
              </div>

              <div className="w-full md:w-64 space-y-2.5 text-xs font-sans" id="invoice-math-breakdown">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{getSubtotal().toLocaleString('en-IN')}</span>
                </div>

                {includeGst && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-400 text-3xs font-mono uppercase pl-3">
                      <span>CGST (9%):</span>
                      <span>₹{(getGstAmount() / 2).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-3xs font-mono uppercase pl-3">
                      <span>SGST (9%):</span>
                      <span>₹{(getGstAmount() / 2).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between font-bold text-gray-900 border-t border-dashed border-gray-200 pt-2.5 text-sm">
                  <span>Grand Total:</span>
                  <span className="font-mono font-black text-indigo-700">₹{getGrandTotal().toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-gray-500 text-2xs border-t border-slate-100 pt-1.5">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono font-bold">₹{activeJob.paidAmount.toLocaleString('en-IN')}</span>
                </div>

                {activeJob.dueAmount > 0 && (
                  <div className="flex justify-between text-rose-500 text-2xs font-bold bg-rose-50 p-1 px-2 rounded">
                    <span>Due Amount Payment:</span>
                    <span className="font-mono">₹{activeJob.dueAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Authorised signature widget */}
            <div className="pt-12 flex justify-between items-end" id="invoice-bill-sign">
              <div className="text-3xs text-gray-400 font-sans">
                Generated securely via Client AutoServe CRM Portal
              </div>
              <div className="text-center w-40 border-t border-gray-300 pt-1.5" id="sign-line">
                <p className="text-[10px] font-bold text-gray-800 font-sans">Authorised Signature</p>
                <p className="text-3xs text-gray-400 font-sans">AutoServe Representative</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white py-12 border border-dashed border-gray-250 rounded-2xl text-center text-gray-400 text-sm font-sans" id="empty-invoice">
          No matching service jobs found to print receipt. Make a job card first.
        </div>
      )}
    </div>
  );
}

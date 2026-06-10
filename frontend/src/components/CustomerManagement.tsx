/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  User, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  FolderLock, 
  Clock, 
  Settings, 
  Plus, 
  CheckCircle2, 
  Fuel, 
  ExternalLink 
} from 'lucide-react';
import { JobCard } from '../types/index';

interface CustomerManagementProps {
  jobCards: JobCard[];
  historicalJobs: JobCard[];
  onQuickBookVehicle: (customerData: {
    customerName: string;
    customerMobile: string;
    vehicleNumber: string;
    vehicleModel: string;
  }) => void;
  searchedVehicleVal?: string;
  onClearSearchVal?: () => void;
}

export default function CustomerManagement({ 
  jobCards, 
  historicalJobs,
  onQuickBookVehicle,
  searchedVehicleVal = '',
  onClearSearchVal
}: CustomerManagementProps) {
  const [searchQuery, setSearchQuery] = useState(searchedVehicleVal);

  // Combine live jobs with historical legacy items to show a true full unified ledger of history
  const allHistoryRecords = [...jobCards, ...historicalJobs];

  // Group unique customer vehicles
  const customerProfiles: {
    vehicleNumber: string;
    customerName: string;
    customerMobile: string;
    vehicleModel: string;
    history: JobCard[];
  }[] = [];

  allHistoryRecords.forEach((job) => {
    const formattedPlate = job.vehicleNumber.toUpperCase().replaceAll(' ', '');
    const existing = customerProfiles.find(p => p.vehicleNumber === formattedPlate);

    if (existing) {
      // Prevent duplication in history matches
      if (!existing.history.some(h => h.id === job.id)) {
        existing.history.push(job);
      }
    } else {
      customerProfiles.push({
        vehicleNumber: formattedPlate,
        customerName: job.customerName,
        customerMobile: job.customerMobile,
        vehicleModel: job.vehicleModel,
        history: [job]
      });
    }
  });

  // Filter profiles based on customer name, vehicle plate or mobile
  const activeProfiles = customerProfiles.filter(profile => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      profile.vehicleNumber.toLowerCase().includes(query) ||
      profile.customerName.toLowerCase().includes(query) ||
      profile.customerMobile.includes(query)
    );
  });

  return (
    <div className="space-y-6" id="customers-tab-container">
      {/* Upper header */}
      <div id="customers-header">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 font-sans">Unified Vehicle Service Ledger</h2>
        <p className="text-sm text-gray-500 font-sans">Intelligently query vehicle plate numbers to load complete historical repairs, parts replaced, mechanics logged, and past expenditure records instantly.</p>
      </div>

      {/* Main ledger live searching field input bar */}
      <div className="relative max-w-xl" id="customers-search-bar">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450 h-5 w-5" />
        <input
          type="text"
          placeholder="Filter by vehicle plate (e.g. MH12AB1234) or owner name..."
          className="w-full pl-11 pr-20 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-sans text-sm focus:border-transparent"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (onClearSearchVal && !e.target.value) {
              onClearSearchVal();
            }
          }}
          id="customers-ledger-search-box"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              if (onClearSearchVal) onClearSearchVal();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold font-sans text-indigo-650 hover:text-indigo-800"
            id="clear-customers-search"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid displaying profiles */}
      <div className="grid grid-cols-1 gap-6" id="customer-profiles-deck">
        {activeProfiles.length === 0 ? (
          <div className="bg-white py-12 rounded-2xl border border-dashed border-gray-250 text-center text-gray-400 font-sans text-sm">
            No dynamic historical records found checking "{searchQuery}". Register an active Job Card for this plate!
          </div>
        ) : (
          activeProfiles.map((profile) => {
            // Sort history desc by date
            const sortedRecords = [...profile.history].sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            return (
              <div 
                key={profile.vehicleNumber} 
                className="bg-white rounded-xl border border-gray-150 p-6 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-6"
                id={`customer-card-${profile.vehicleNumber}`}
              >
                {/* Column 1: Customer Profile Overview info card */}
                <div className="space-y-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-6" id="profile-summary">
                  <div className="space-y-2">
                    <span className="font-mono font-black text-lg tracking-widest text-slate-100 bg-slate-900 px-3.5 py-1.5 rounded-md inline-block">
                      {profile.vehicleNumber}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg font-sans">{profile.customerName}</h3>
                    <p className="text-sm text-gray-500 font-sans flex items-center gap-1.5">
                      <Phone className="h-4 w-4" /> +91 {profile.customerMobile}
                    </p>
                    <p className="text-xs text-gray-450 font-sans">
                      Vehicle Model: <span className="font-semibold text-gray-700">{profile.vehicleModel}</span>
                    </p>
                  </div>

                  <hr className="border-t border-slate-100" />

                  {/* High level history parameters summary */}
                  <div className="space-y-2 text-xs font-sans">
                    <p className="text-gray-450 uppercase font-bold text-2xs tracking-wider">Metrics Snapshot</p>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Visits</span>
                      <span className="font-bold text-gray-800">{profile.history.length} services</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-sans">Cumulative Service Bill</span>
                      <span className="font-bold font-mono text-emerald-700">
                        ₹{profile.history.reduce((sum, h) => sum + h.totalAmount, 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => onQuickBookVehicle({
                        customerName: profile.customerName,
                        customerMobile: profile.customerMobile,
                        vehicleNumber: profile.vehicleNumber,
                        vehicleModel: profile.vehicleModel
                      })}
                      className="w-full text-center py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-750 font-bold rounded-xl transition duration-150 text-xs font-sans cursor-pointer flex items-center justify-center gap-1.5"
                      id={`qa-book-${profile.vehicleNumber}`}
                    >
                      <Plus className="h-4 w-4" /> Book New Service
                    </button>
                  </div>
                </div>

                {/* Column 2 & 3: Detailed History timeline deck */}
                <div className="lg:col-span-2 space-y-4" id="timeline-column">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-sans">Vehicle Service History Timeline</h4>
                  
                  <div className="space-y-4 overflow-y-auto max-h-[300px] pr-1" id="timeline-list">
                    {sortedRecords.map((record, index) => (
                      <div 
                        key={record.id} 
                        className="relative pl-6 border-l-2 border-indigo-100 pb-2 last:pb-0"
                        id={`timeline-node-${record.id}`}
                      >
                        {/* Dot indicator marker */}
                        <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-indigo-650 border border-white" />

                        {/* Record detail box info cards */}
                        <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-2.5 transition">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-gray-400 bg-slate-100 rounded px-1.5 py-0.5">
                                {record.jobNumber}
                              </span>
                              <span className="text-2xs text-gray-400 font-sans">
                                {new Date(record.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric'
                                })}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                record.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-705'
                              }`}>
                                {record.status}
                              </span>
                              <span className="text-xs font-bold font-mono text-gray-800">
                                ₹{record.totalAmount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Complaints listed */}
                          <div className="text-xs font-sans text-gray-650">
                            <span className="font-bold text-gray-500">Complaint:</span> {record.complaint || 'General diagnostic service.'}
                          </div>

                          {/* Replaced Parts array & mechanical service tags */}
                          {record.items.length > 0 ? (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Replaced spares & Services Rendered:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {record.items.map((item, itemIdx) => (
                                  <span 
                                    key={item.id} 
                                    className="bg-white border border-gray-150 text-[10px] py-0.5 px-2 rounded font-sans text-gray-700 flex items-center gap-0.5"
                                  >
                                    🛠️ {item.description} ({item.quantity}x)
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-[10px] italic text-gray-400 font-sans">No lines listed in invoices.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

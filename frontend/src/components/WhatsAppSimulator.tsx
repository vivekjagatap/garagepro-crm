/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Smartphone, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  Layers, 
  RefreshCw, 
  Share2, 
  Zap, 
  AlertCircle 
} from 'lucide-react';
import { JobCard, WhatsAppNotification } from '../types/index';

interface WhatsAppSimulatorProps {
  notifications: WhatsAppNotification[];
  jobCards: JobCard[];
  onTriggerNotification: (jobCardId: string, type: 'Received' | 'Repair Completed' | 'Invoice Ready' | 'Service Reminder', customMessage?: string) => void;
}

export default function WhatsAppSimulator({ 
  notifications, 
  jobCards, 
  onTriggerNotification 
}: WhatsAppSimulatorProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobCards[0]?.id || '');
  const [selectedTemplateType, setSelectedTemplateType] = useState<'Received' | 'Repair Completed' | 'Invoice Ready' | 'Service Reminder'>('Received');
  const [phoneScreenNotification, setPhoneScreenNotification] = useState<WhatsAppNotification | null>(
    notifications[0] || null
  );
  const [editableMessage, setEditableMessage] = useState<string>('');

  // Extract templates with customizable placeholders
  const getTemplateMessage = (
    type: 'Received' | 'Repair Completed' | 'Invoice Ready' | 'Service Reminder', 
    customerName: string, 
    vehicleNumber: string, 
    extraDetails?: string
  ) => {
    switch (type) {
      case 'Received':
        return `Hello ${customerName}, your vehicle (${vehicleNumber}) has been securely received at AutoServe Workshop. Diagnosis & inspection under progress. Odo: ${extraDetails || '45,320'} KM. - Team AutoServe`;
      case 'Repair Completed':
        return `Hi ${customerName}, service for your ${vehicleNumber} is completed! Every quality test has cleared. Please visit to pick up. - Team AutoServe`;
      case 'Invoice Ready':
        return `Dear ${customerName}, final Invoice aggregate is ready for ${vehicleNumber}. Grand Total: ₹${extraDetails || '2,500'}. Click here to inspect the digital copy. - Team AutoServe`;
      case 'Service Reminder':
        return `Hello ${customerName}, your next periodic engine lubrication service for ${vehicleNumber} is due in 30 days. Maintain car resale value. Reply to book! - Team AutoServe`;
    }
  };

  const handleManualSimulateTrigger = () => {
    if (!selectedJobId) {
      alert('Register or select an active job card first!');
      return;
    }
    const matchingJob = jobCards.find(j => j.id === selectedJobId);
    if (!matchingJob) return;

    onTriggerNotification(selectedJobId, selectedTemplateType, editableMessage);
  };

  // Pre-generate formatted template macros for on-screen inspection
  const previewJob = jobCards.find(j => j.id === selectedJobId) || jobCards[0];
  
  React.useEffect(() => {
    if (previewJob) {
      const defaultMsg = getTemplateMessage(
        selectedTemplateType, 
        previewJob.customerName, 
        previewJob.vehicleNumber, 
        selectedTemplateType === 'Invoice Ready' ? String(previewJob.totalAmount) : String(previewJob.odometer)
      );
      setEditableMessage(defaultMsg);
    } else {
      setEditableMessage('Select an active job card first to draft a custom message.');
    }
  }, [selectedJobId, selectedTemplateType, jobCards]);

  // Open real WhatsApp API link for validation
  const handleOpenRealWhatsApp = (notif: WhatsAppNotification) => {
    // Standard format cleaner for Indian mobile numbers
    const cleanedPhone = notif.customerMobile.startsWith('91') ? notif.customerMobile : `91${notif.customerMobile}`;
    const uriText = encodeURIComponent(notif.message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${uriText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6" id="whatsapp-simulator-container">
      {/* Upper info banners */}
      <div id="wa-banner">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 font-sans">Automated AI CRM Dispatch Hub</h2>
        <p className="text-sm text-gray-500 font-sans">Leverage immediate message pipelines. Keep customers updated in real-time as statuses progress in the shop. Drastically boost retention.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="wa-core-grid">
        {/* Left 2 Cols: Simulation dashboard controllers and transaction logs */}
        <div className="xl:col-span-2 space-y-6" id="wa-tools-half">
          {/* Section A: Simulator Panel */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4" id="sim-control-deck">
            <h3 className="font-bold text-gray-800 text-sm font-sans flex items-center gap-1.5">
              <Zap className="h-4.5 w-4.5 text-indigo-650 animate-pulse" /> Manual Message Dispatch Station
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="wa-form-grid">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Select Customer / Vehicle</label>
                <select
                  className="w-full p-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-sans text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-305"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  id="wa-job-selector"
                >
                  <option value="">-- Choose Job --</option>
                  {jobCards.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.jobNumber} | {j.vehicleNumber} ({j.customerName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase font-sans">Update Status Milestones</label>
                <select
                  className="w-full p-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-sans text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-305"
                  value={selectedTemplateType}
                  onChange={(e) => setSelectedTemplateType(e.target.value as any)}
                  id="wa-template-selector"
                >
                  <option value="Received">Intake: Vehicle Received Receipt</option>
                  <option value="Repair Completed">Service Completed Notification</option>
                  <option value="Invoice Ready">Billing: Invoice Total Breakdown</option>
                  <option value="Service Reminder">Dormancy: 30-Day Follow-Up Booking</option>
                </select>
              </div>
            </div>

            {/* Template preview card text wrapper */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2" id="sim-preview-box">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Outgoing Live Draft Message (Text is fully editable!)
                </p>
                <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold font-sans">
                  Customizable
                </span>
              </div>
              <textarea
                value={editableMessage}
                onChange={(e) => setEditableMessage(e.target.value)}
                className="w-full h-24 p-3 bg-white text-xs font-mono text-gray-700 rounded-lg border border-slate-200 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                placeholder="Type or modify your customer message here..."
                id="wa-draft-textarea"
              />
            </div>

            <div className="flex justify-between items-center pt-2" id="sim-dispatch-action-bar">
              <span className="text-[10px] text-gray-400 font-sans max-w-xs">
                * Note: Real installations connect with standard gateway endpoints. Simulated delivery logs inside mockup.
              </span>
              
              <button
                onClick={handleManualSimulateTrigger}
                className="py-2 px-5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-sans cursor-pointer shadow-xs transition"
                id="wa-dispatch-simulate-btn"
              >
                Simulate Notification
              </button>
            </div>
          </div>

          {/* Section B: Log ledger ledger list */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4" id="wa-log-board-card">
            <h3 className="font-bold text-gray-850 text-sm font-sans flex items-center gap-1.5">
              <Layers className="h-4.5 w-4.5 text-indigo-600" /> Auto-CRM Transmission Log Ledger
            </h3>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1" id="wa-history-list">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-400 font-sans text-xs">
                  No automated dispatches logged today. Update any vehicle status to trigger notifications!
                </div>
              ) : (
                [...notifications].reverse().map((notif) => (
                  <div 
                    key={notif.id} 
                    className="flex justify-between items-start p-3 bg-slate-50 hover:bg-indigo-50/20 border border-slate-200/65 rounded-xl cursor-pointer transition shadow-2xs"
                    onClick={() => setPhoneScreenNotification(notif)}
                    id={`notif-record-${notif.id}`}
                  >
                    <div className="space-y-1 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 bg-slate-200 px-1.5 py-0.5 rounded font-mono uppercase">
                          {notif.type}
                        </span>
                        
                        <span className="text-xs font-bold font-mono text-gray-800">
                          {notif.vehicleNumber}
                        </span>

                        <span className="text-2xs text-gray-400 font-sans">
                          • {notif.customerName} (+91 {notif.customerMobile})
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-1 font-sans">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-gray-405 font-mono">
                        <span className="flex items-center gap-1 text-emerald-600 uppercase font-bold">
                          <CheckCheck className="h-3.5 w-3.5" /> {notif.status}
                        </span>
                        <span>• Received at {new Date(notif.timestamp).toLocaleTimeString('en-IN')}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRealWhatsApp(notif);
                      }}
                      className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-150 border border-emerald-250 text-emerald-800 text-[10px] font-bold rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1 font-sans"
                      id={`wa-send-real-${notif.id}`}
                    >
                      Real WhatsApp <Share2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Phone Mockup Display screen */}
        <div className="xl:col-span-1 flex justify-center items-start" id="phone-display-column">
          <div className="bg-slate-900 text-white rounded-[40px] border-8 border-slate-950 p-4 relative shadow-2xl h-[520px] w-[275px] flex flex-col justify-between" id="mock-smartphone">
            {/* Phone speaker gap notch */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 h-4 w-28 bg-slate-950 rounded-b-xl flex justify-center items-center pointer-events-none">
              <div className="h-1.5 w-12 bg-gray-800 rounded-full" />
            </div>

            {/* Simulated Phone screen header */}
            <div className="pt-4 flex justify-between items-center text-2xs font-mono text-gray-400 px-2" id="smartphone-status-bar">
              <span>9:41 AM</span>
              <div className="flex gap-1.5">
                <span>📶</span>
                <span>🔋 100%</span>
              </div>
            </div>

            {/* Chat viewport background layout mock WA */}
            <div className="flex-1 bg-teal-50/5 rounded-2xl mt-3 overflow-hidden flex flex-col justify-between p-2.5 relative" id="wa-mock-chat-bg">
              {/* WhatsApp UI brand strip header */}
              <div className="bg-emerald-800 p-2 rounded-xl flex items-center gap-2" id="notif-wa-brand">
                <div className="h-6 w-6 rounded-full bg-emerald-700/80 font-black text-gray-100 flex items-center justify-center text-xs font-mono">
                  A
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white leading-tight font-sans">AutoServe CRM Hub</p>
                  <p className="text-[8px] text-emerald-200 font-sans">Automated AI Channel</p>
                </div>
              </div>

              {/* Chat bubble body center section */}
              <div className="flex-1 flex flex-col justify-end py-3 space-y-2.5" id="notif-bubbles-viewport">
                {phoneScreenNotification ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    key={phoneScreenNotification.id}
                    className="bg-emerald-100/90 text-slate-900 rounded-lg p-2.5 max-w-[90%] self-end text-3xs leading-relaxed space-y-1 relative shadow-xs border border-emerald-200/50"
                  >
                    {/* Tail widget */}
                    <div className="absolute top-2 -right-[5px] h-2 w-2 bg-emerald-100/90 rotate-45" />
                    
                    <p className="font-mono font-bold text-[8px] text-emerald-800 border-b border-emerald-200 pb-0.5 uppercase">
                      Automatic Trigger Logged
                    </p>
                    <p className="font-sans leading-relaxed text-gray-800">
                      {phoneScreenNotification.message}
                    </p>
                    <div className="flex justify-end text-[7px] text-gray-400 font-mono gap-1">
                      <span>{new Date(phoneScreenNotification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-blue-500">✓✓</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-[10px] text-gray-405 italic py-10 font-sans">
                    No triggered messages. Click any log entry or status update to slide into mockup panel.
                  </div>
                )}
              </div>

              {/* Mock typing entry bar footer */}
              <div className="bg-slate-800 p-1.5 rounded-xl flex gap-1 items-center" id="notif-mock-textbox">
                <div className="flex-1 bg-slate-750 p-1 px-2.5 text-xs text-gray-400 rounded-lg text-3xs font-sans">
                  Simulated Chat Line...
                </div>
                <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                  🎤
                </div>
              </div>
            </div>

            {/* Smart virtual home strip indicator */}
            <div className="h-1 w-24 bg-gray-700 mx-auto rounded-full mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

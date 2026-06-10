/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  MessageSquare, 
  FileSpreadsheet, 
  Bell, 
  CheckCircle, 
  UserCheck, 
  ShieldCheck,
  Smartphone,
  ExternalLink
} from 'lucide-react';

import { JobCard, InventoryItem, MonthRevenue, WhatsAppNotification } from './types/index';
import { 
  INITIAL_INVENTORY, 
  MONTHLY_REVENUE_DATA, 
  HISTORICAL_JOBS, 
  TODAY_JOBS, 
  INITIAL_WHATSAPP_LOGS 
} from './data/mockData';

// Modular Sub-components
import Dashboard from './components/Dashboard';
import JobCards from './components/JobCards';
import CustomerManagement from './components/CustomerManagement';
import InventoryManager from './components/InventoryManager';
import WhatsAppSimulator from './components/WhatsAppSimulator';
import InvoiceGenerator from './components/InvoiceGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Real Persistent state hooks
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [searchedVehicle, setSearchedVehicle] = useState<string>('');
  const [openNewJobForm, setOpenNewJobForm] = useState<boolean>(false);
  const [prefilledCustomer, setPrefilledCustomer] = useState<{
    customerName: string;
    customerMobile: string;
    vehicleNumber: string;
    vehicleModel: string;
  } | null>(null);

  // Install App PWA State variables for mobile standalone fidelity
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [installState, setInstallState] = useState<'idle' | 'installing' | 'completed'>('idle');
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [hasInstalledBefore, setHasInstalledBefore] = useState<boolean>(false);

  // Transient floating banner alert state for simulated whatsapp triggered message popup!
  const [floatingAlert, setFloatingAlert] = useState<{
    customerName: string;
    vehicleNumber: string;
    message: string;
  } | null>(null);

  // Load from localStorage initially, or pre-populate with mock indices
  useEffect(() => {
    try {
      const cachedJobs = localStorage.getItem('autoserve_jobcards');
      const cachedInventory = localStorage.getItem('autoserve_inventory');
      const cachedNotifications = localStorage.getItem('autoserve_notifications');

      if (cachedJobs) {
        setJobCards(JSON.parse(cachedJobs));
      } else {
        setJobCards(TODAY_JOBS);
      }

      if (cachedInventory) {
        setInventory(JSON.parse(cachedInventory));
      } else {
        setInventory(INITIAL_INVENTORY);
      }

      if (cachedNotifications) {
        setNotifications(JSON.parse(cachedNotifications));
      } else {
        setNotifications(INITIAL_WHATSAPP_LOGS);
      }
    } catch (e) {
      console.warn('LocalStorage error, using memory mock state:', e);
      setJobCards(TODAY_JOBS);
      setInventory(INITIAL_INVENTORY);
      setNotifications(INITIAL_WHATSAPP_LOGS);
    }
  }, []);

  // Native PWA Install event setup and platform scanner
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(ua);
    const isDroid = /android/.test(ua);
    setIsIOS(isApple);
    setIsAndroid(isDroid);

    const isInstalled = localStorage.getItem('autoserve_app_installed') === 'true';
    setHasInstalledBefore(isInstalled);

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const triggerNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          localStorage.setItem('autoserve_app_installed', 'true');
          setHasInstalledBefore(true);
          setDeferredPrompt(null);
          setInstallState('completed');
        }
      } catch (err) {
        console.warn('Native prompt cancelled:', err);
      }
    } else {
      // Progressive mock installer download indicator
      setInstallState('installing');
      setInstallProgress(10);
      
      const interval = setInterval(() => {
        setInstallProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setInstallState('completed');
              localStorage.setItem('autoserve_app_installed', 'true');
              setHasInstalledBefore(true);
            }, 300);
            return 100;
          }
          return prev + 15;
        });
      }, 200);
    }
  };

  // Save changes to localStorage automatically when state fields change
  const saveToCache = (jobs: JobCard[], inv: InventoryItem[], notifs: WhatsAppNotification[]) => {
    try {
      localStorage.setItem('autoserve_jobcards', JSON.stringify(jobs));
      localStorage.setItem('autoserve_inventory', JSON.stringify(inv));
      localStorage.setItem('autoserve_notifications', JSON.stringify(notifs));
    } catch (er) {
      console.error('Failed to update localStorage persistent state:', er);
    }
  };

  // State modification dispatch callbacks
  const handleAddJobCard = (newCard: JobCard) => {
    const updated = [newCard, ...jobCards];
    setJobCards(updated);
    saveToCache(updated, inventory, notifications);
  };

  const handleUpdateJobCard = (cardId: string, updatedFields: Partial<JobCard>) => {
    const updated = jobCards.map(job => {
      if (job.id === cardId) {
        return { ...job, ...updatedFields };
      }
      return job;
    });
    setJobCards(updated);
    saveToCache(updated, inventory, notifications);
  };

  const handleAddInventoryItem = (newItem: InventoryItem) => {
    const updated = [...inventory, newItem];
    setInventory(updated);
    saveToCache(jobCards, updated, notifications);
  };

  const handleUpdateInventoryItem = (itemId: string, updatedFields: Partial<InventoryItem>) => {
    const updated = inventory.map(item => {
      if (item.id === itemId) {
        return { ...item, ...updatedFields };
      }
      return item;
    });
    setInventory(updated);
    saveToCache(jobCards, updated, notifications);
  };

  // Universal Automated WhatsApp notification simulator handler
  const handleTriggerNotification = (
    jobCardId: string, 
    type: 'Received' | 'Repair Completed' | 'Invoice Ready' | 'Service Reminder',
    customMessage?: string
  ) => {
    // 1. Locate matching data
    const matchedJob = jobCards.find(j => j.id === jobCardId);
    if (!matchedJob) return;

    // 2. Draft realistic prefilled string layout
    let messageText = customMessage || '';
    if (!messageText) {
      switch (type) {
        case 'Received':
          messageText = `Dear ${matchedJob.customerName}, your vehicle (${matchedJob.vehicleNumber} ${matchedJob.vehicleModel}) has been safely received. Complaint logged: "${matchedJob.complaint || 'General Checkup'}". Odo: ${matchedJob.odometer.toLocaleString()} KM. You will receive updates directly on this chat. - Team AutoServe`;
          break;
        case 'Repair Completed':
          messageText = `Hi ${matchedJob.customerName}, great news! Service on your ${matchedJob.vehicleNumber} ${matchedJob.vehicleModel} is successfully completed. Assigned technician: Ajay. You are ready for pick-up! - Team AutoServe`;
          break;
        case 'Invoice Ready':
          messageText = `Hello ${matchedJob.customerName}, Service invoice ASC-ready is compiled for your vehicle ${matchedJob.vehicleNumber}. Grand Total: ₹${matchedJob.totalAmount.toLocaleString('en-IN')}. Pay amount: ₹${matchedJob.paidAmount.toLocaleString('en-IN')}. Due balance: ₹${matchedJob.dueAmount.toLocaleString('en-IN')}. - Team AutoServe`;
          break;
        case 'Service Reminder':
          messageText = `Greetings ${matchedJob.customerName}! Your car periodic maintenance is due. Please schedule a booking now for ${matchedJob.vehicleNumber} ${matchedJob.vehicleModel} to keep performance smooth. - Team AutoServe`;
          break;
      }
    }

    // 3. Construct record entry
    const newNotif: WhatsAppNotification = {
      id: `wa-notif-gen-${Date.now()}`,
      jobCardId: matchedJob.id,
      customerName: matchedJob.customerName,
      customerMobile: matchedJob.customerMobile,
      vehicleNumber: matchedJob.vehicleNumber,
      type,
      message: messageText,
      timestamp: new Date().toISOString(),
      status: 'Read' // Delivered and read confirmation simulation indicator
    };

    // 4. Update ledger states
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveToCache(jobCards, inventory, updatedNotifs);

    // 5. Trigger sliding toast banner mock notifications
    setFloatingAlert({
      customerName: matchedJob.customerName,
      vehicleNumber: matchedJob.vehicleNumber,
      message: messageText
    });

    // Automatically fade out notification banner after 5.5 seconds
    setTimeout(() => {
      setFloatingAlert(null);
    }, 5500);
  };

  // Helper redirection bridges
  const handleDashboardNavigate = (tab: string, args?: any) => {
    setActiveTab(tab);
    if (args && args.openNewJobForm) {
      setOpenNewJobForm(true);
    } else {
      setOpenNewJobForm(false);
    }
  };

  const handleQuickBookCustomer = (customer: {
    customerName: string;
    customerMobile: string;
    vehicleNumber: string;
    vehicleModel: string;
  }) => {
    // Navigate straight to digital job cards, trigger additions
    setPrefilledCustomer(customer);
    setActiveTab('jobcards');
    setOpenNewJobForm(true);
  };

  const handleSearchVehicleFromDashboard = (vehicleNum: string) => {
    setSearchedVehicle(vehicleNum.toUpperCase().replaceAll(' ', ''));
    setActiveTab('customers');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col antialiased relative" id="applet-root">
      
      {/* Dynamic Slide-in Simulation Banner notifying outbound WhatsApp updates! */}
      <AnimatePresence>
        {floatingAlert && (
          <motion.div
            initial={{ opacity: 0, x: 250, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-indigo-600 p-4 space-y-3 print:hidden"
            id="wa-sliding-toast"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] bg-emerald-600 uppercase tracking-widest font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Bell className="h-3 w-3" /> SENT OUTBOUND WhatsApp
              </span>
              <button 
                className="text-gray-400 hover:text-white font-bold leading-none cursor-pointer"
                onClick={() => setFloatingAlert(null)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold font-sans">
                To {floatingAlert.customerName} ({floatingAlert.vehicleNumber})
              </h4>
              <p className="text-[11px] text-slate-350 leading-relaxed font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
                {floatingAlert.message}
              </p>
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-400 font-sans">
              <span className="text-emerald-500 font-bold">✓✓ Read Receipts logged</span>
              <button
                onClick={() => setActiveTab('whatsapp')}
                className="text-xs text-indigo-400 font-bold underline"
              >
                Open Hub
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Install Prompt Pill at the top for small viewports to highlight mobile app feel */}
      <div className="xl:hidden bg-indigo-950 text-white py-2 px-4 flex items-center justify-between text-xs font-sans print:hidden" id="mobile-pwa-banner">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-indigo-600 text-white font-black rounded-md flex items-center justify-center text-xs shrink-0">
            A
          </div>
          <span className="font-bold whitespace-nowrap">AutoServe Standalone CRM</span>
        </div>
        <button
          onClick={() => setShowInstallModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white hover:text-white px-3 py-1 font-black text-[10px] uppercase rounded-full tracking-wider shadow-xs transition duration-150 cursor-pointer shrink-0"
        >
          Install App
        </button>
      </div>

      {/* Main visual header area - automatically hidden on print layout */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-40 print:hidden" id="main-navigation-header">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-16 gap-4">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => setActiveTab('dashboard')} id="brand-panel">
            <div className="h-9 w-9 bg-indigo-650 text-white font-black rounded-xl flex items-center justify-center font-sans animate-pulse shrink-0">
              A
            </div>
            <div className="space-y-0.5 whitespace-nowrap shrink-0">
              <h1 className="text-sm font-black font-sans tracking-wide whitespace-nowrap">AUTOSERVE CRM</h1>
              <p className="text-[10px] font-semibold text-gray-400 font-mono tracking-widest uppercase whitespace-nowrap">SAAS GARAGE BILLING</p>
            </div>
          </div>

          {/* Center navigation tabs header */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold font-sans whitespace-nowrap" id="desktop-menubar">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 p-2 px-3.5 rounded-xl cursor-pointer transition ${
                activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:text-gray-800 hover:bg-slate-50'
              }`}
              id="tb-dash"
            >
              <LayoutDashboard className="h-4.5 w-4.5" /> Dashboard
            </button>

            <button
              onClick={() => {
                setOpenNewJobForm(false);
                setActiveTab('jobcards');
              }}
              className={`flex items-center gap-1.5 p-2 px-3.5 rounded-xl cursor-pointer transition ${
                activeTab === 'jobcards' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:text-gray-800 hover:bg-slate-50'
              }`}
              id="tb-jobcards"
            >
              <FileText className="h-4.5 w-4.5" /> Digital Job Cards
            </button>

            <button
              onClick={() => {
                setSearchedVehicle('');
                setActiveTab('customers');
              }}
              className={`flex items-center gap-1.5 p-2 px-3.5 rounded-xl cursor-pointer transition ${
                activeTab === 'customers' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:text-gray-800 hover:bg-slate-50'
              }`}
              id="tb-cust"
            >
              <Users className="h-4.5 w-4.5" /> Customers & History
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-1.5 p-2 px-3.5 rounded-xl cursor-pointer transition ${
                activeTab === 'inventory' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:text-gray-800 hover:bg-slate-50'
              }`}
              id="tb-inv"
            >
              <Package className="h-4.5 w-4.5" /> Spares Inventory
            </button>

            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center gap-1.5 p-2 px-3.5 rounded-xl cursor-pointer transition ${
                activeTab === 'whatsapp' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:text-gray-800 hover:bg-slate-50'
              }`}
              id="tb-wa"
            >
              <MessageSquare className="h-4.5 w-4.5" /> WhatsApp Dispatcher
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-1.5 p-2 px-3.5 rounded-xl cursor-pointer transition ${
                activeTab === 'billing' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:text-gray-800 hover:bg-slate-50'
              }`}
              id="tb-bill"
            >
              <FileSpreadsheet className="h-4.5 w-4.5" /> Invoicing Office
            </button>
          </nav>

          {/* Quick metadata badges & responsive Install Pill */}
          <div className="flex items-center gap-2.5 font-sans shrink-0" id="quick-indicators">
            <button
              onClick={() => setShowInstallModal(true)}
              className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-full px-3 py-1.5 cursor-pointer shadow-xs transition duration-150-ease"
              title="Install Mobile stand-alone CRM Web App"
            >
              <Smartphone className="h-3.5 w-3.5 text-indigo-650 animate-pulse" /> Install App
            </button>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 font-sans animate-fade-in shrink-0">
              <ShieldCheck className="h-3.5 w-3.5" /> Cloud Server Live
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Navigation Bottom Bar - Beautiful Backdrop blur and premium layout bubbles */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-150 p-1 py-1.5 flex items-center justify-around z-45 xl:hidden print:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.03)]" id="mobile-menubar">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`relative flex flex-col items-center gap-0.5 p-1 pb-2 rounded-xl cursor-pointer transition duration-150 flex-1 min-w-0 ${
            activeTab === 'dashboard' ? 'text-indigo-650 font-bold scale-105' : 'text-gray-400 font-medium'
          }`}
          id="m-tb-dash"
        >
          <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
          <span className="text-[9.5px] font-sans tracking-tight truncate w-full text-center">Home</span>
          {activeTab === 'dashboard' && (
            <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-indigo-650" id="m-tb-dash-dot"></span>
          )}
        </button>

        <button 
          onClick={() => {
            setOpenNewJobForm(false);
            setActiveTab('jobcards');
          }} 
          className={`relative flex flex-col items-center gap-0.5 p-1 pb-2 rounded-xl cursor-pointer transition duration-150 flex-1 min-w-0 ${
            activeTab === 'jobcards' ? 'text-indigo-650 font-bold scale-105' : 'text-gray-400 font-medium'
          }`}
          id="m-tb-jobs"
        >
          <FileText className="h-4.5 w-4.5 shrink-0" />
          <span className="text-[9.5px] font-sans tracking-tight truncate w-full text-center">Jobs</span>
          {activeTab === 'jobcards' && (
            <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-indigo-650" id="m-tb-jobs-dot"></span>
          )}
        </button>

        <button 
          onClick={() => {
            setSearchedVehicle('');
            setActiveTab('customers');
          }} 
          className={`relative flex flex-col items-center gap-0.5 p-1 pb-2 rounded-xl cursor-pointer transition duration-150 flex-1 min-w-0 ${
            activeTab === 'customers' ? 'text-indigo-650 font-bold scale-105' : 'text-gray-400 font-medium'
          }`}
          id="m-tb-cust"
        >
          <Users className="h-4.5 w-4.5 shrink-0" />
          <span className="text-[9.5px] font-sans tracking-tight truncate w-full text-center">Clients</span>
          {activeTab === 'customers' && (
            <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-indigo-650" id="m-tb-cust-dot"></span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('inventory')} 
          className={`relative flex flex-col items-center gap-0.5 p-1 pb-2 rounded-xl cursor-pointer transition duration-150 flex-1 min-w-0 ${
            activeTab === 'inventory' ? 'text-indigo-650 font-bold scale-105' : 'text-gray-400 font-medium'
          }`}
          id="m-tb-inv"
        >
          <Package className="h-4.5 w-4.5 shrink-0" />
          <span className="text-[9.5px] font-sans tracking-tight truncate w-full text-center">Spares</span>
          {activeTab === 'inventory' && (
            <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-indigo-650" id="m-tb-inv-dot"></span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('whatsapp')} 
          className={`relative flex flex-col items-center gap-0.5 p-1 pb-2 rounded-xl cursor-pointer transition duration-150 flex-1 min-w-0 ${
            activeTab === 'whatsapp' ? 'text-indigo-650 font-bold scale-105' : 'text-gray-400 font-medium'
          }`}
          id="m-tb-wa"
        >
          <MessageSquare className="h-4.5 w-4.5 shrink-0" />
          <span className="text-[9.5px] font-sans tracking-tight truncate w-full text-center">WhatsApp</span>
          {activeTab === 'whatsapp' && (
            <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-indigo-650" id="m-tb-wa-dot"></span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('billing')} 
          className={`relative flex flex-col items-center gap-0.5 p-1 pb-2 rounded-xl cursor-pointer transition duration-150 flex-1 min-w-0 ${
            activeTab === 'billing' ? 'text-indigo-650 font-bold scale-105' : 'text-gray-400 font-medium'
          }`}
          id="m-tb-bill"
        >
          <FileSpreadsheet className="h-4.5 w-4.5 shrink-0" />
          <span className="text-[9.5px] font-sans tracking-tight truncate w-full text-center">Billing</span>
          {activeTab === 'billing' && (
            <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-indigo-650" id="m-tb-bill-dot"></span>
          )}
        </button>
      </nav>

      {/* Main Page Layout Content Section with responsive bounding boxes */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-28 xl:pb-8" id="viewport-workspace">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            id={`tab-wrapper-${activeTab}`}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                jobCards={jobCards}
                inventory={inventory}
                monthlyRevenue={MONTHLY_REVENUE_DATA}
                onNavigate={handleDashboardNavigate}
                onSearchVehicle={handleSearchVehicleFromDashboard}
                onTriggerNotification={handleTriggerNotification}
              />
            )}

            {activeTab === 'jobcards' && (
              <JobCards 
                jobCards={jobCards}
                inventory={inventory}
                onAddJobCard={handleAddJobCard}
                onUpdateJobCard={handleUpdateJobCard}
                onTriggerNotification={handleTriggerNotification}
                openNewFormInitially={openNewJobForm}
                prefilledCustomer={prefilledCustomer}
                onClearPrefilled={() => setPrefilledCustomer(null)}
              />
            )}

            {activeTab === 'customers' && (
              <CustomerManagement 
                jobCards={jobCards}
                historicalJobs={HISTORICAL_JOBS}
                onQuickBookVehicle={handleQuickBookCustomer}
                searchedVehicleVal={searchedVehicle}
                onClearSearchVal={() => setSearchedVehicle('')}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryManager 
                inventory={inventory}
                onAddInventoryItem={handleAddInventoryItem}
                onUpdateInventoryItem={handleUpdateInventoryItem}
              />
            )}

            {activeTab === 'whatsapp' && (
              <WhatsAppSimulator 
                notifications={notifications}
                jobCards={jobCards}
                onTriggerNotification={handleTriggerNotification}
              />
            )}

            {activeTab === 'billing' && (
              <InvoiceGenerator 
                jobCards={jobCards}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Interactive Mobile PWA Install Drawer Sheet */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden" id="install-modal-backdrop">
            <motion.div
              initial={{ y: "100%", opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden font-sans max-h-[92vh] flex flex-col"
              id="install-modal-card"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-indigo-650 text-white rounded-lg flex items-center justify-center font-bold">A</div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Install AutoServe CRM</h3>
                    <p className="text-[10px] text-gray-500 font-medium">Standalone Offline App</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowInstallModal(false);
                    setInstallState('idle');
                    setInstallProgress(0);
                  }}
                  className="h-7 w-7 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full flex items-center justify-center transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {installState === 'idle' && (
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="mx-auto w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Smartphone className="h-8 w-8" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">Use AutoServe as a Standalone App</h4>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                        Add AutoServe to your mobile home screen to bypass browser controls, enable instant diagnostic offline mode, and quick-load parts!
                      </p>
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-150/40">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs font-medium text-slate-600">Fullscreen Immersive Native Mode (No URL bar)</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs font-medium text-slate-600">Save offline state & lightning-fast speed</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs font-medium text-slate-600">Instant shortcuts + easy-touch buttons</span>
                      </div>
                    </div>

                    {/* Instructions Cards */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Instructions by Platform</span>
                      
                      {isIOS ? (
                        <div className="p-3.5 bg-amber-50/65 border border-amber-100 rounded-xl space-y-2 text-xs">
                          <p className="font-bold text-amber-900">Apple iPhone/iPad Installation:</p>
                          <ol className="list-decimal list-inside space-y-1.5 text-amber-800 leading-normal pl-0.5">
                            <li>Tap the <strong className="font-extrabold text-amber-950">Safari Share</strong> button (<svg className="inline h-4 w-4 -mt-1 text-slate-705" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M12 15V3" /><path d="m15 6-3-3-3 3" /></svg>).</li>
                            <li>Select <strong className="font-extrabold text-amber-950">Add to Home Screen</strong>.</li>
                            <li>Open <strong className="font-extrabold text-amber-950">AutoServe</strong> from your home screen.</li>
                          </ol>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-indigo-50/60 border border-indigo-100/80 rounded-xl space-y-2 text-xs">
                          <p className="font-bold text-indigo-900">Android & Chrome Installation:</p>
                          <ol className="list-decimal list-inside space-y-1.5 text-indigo-800 leading-normal pl-0.5">
                            {deferredPrompt ? (
                              <li>Click <strong className="font-bold text-indigo-950">Install standalone</strong> below.</li>
                            ) : (
                              <li>Open browser options (the three dots <strong className="font-black">⋮</strong>).</li>
                            )}
                            <li>Tap <strong className="font-bold text-indigo-950">Add to Home screen</strong> or <strong className="font-bold text-indigo-950">Install app</strong>.</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {installState === 'installing' && (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-full flex items-center justify-center border-2 border-indigo-200 animate-spin border-t-indigo-650">
                      <Smartphone className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">Compiling Workspace...</h4>
                      <p className="text-[11px] text-gray-500 font-mono font-bold">Status: {installProgress}% ready</p>
                    </div>
                    {/* Animated visual Progress row */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <motion.div 
                        className="bg-indigo-650 h-full rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: `${installProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Caching local components & offline service workers...</p>
                  </div>
                )}

                {installState === 'completed' && (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 animate-bounce">
                      <CheckCircle className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-slate-900 animate-pulse">App Installed Successfully!</h4>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                        The standalone package configuration has been successfully cached on this device memory. Launch natively to experience faster load times!
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowInstallModal(false);
                        setInstallState('idle');
                        setInstallProgress(0);
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition duration-150 cursor-pointer"
                    >
                      Open CRM Now
                    </button>
                  </div>
                )}
              </div>

              {/* Footer action buttons selection */}
              {installState === 'idle' && (
                <div className="p-4 bg-slate-50 border-t border-gray-150 flex gap-3">
                  <button
                    onClick={() => setShowInstallModal(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold font-sans text-gray-500 hover:bg-gray-100 cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={triggerNativeInstall}
                    className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-750 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer text-center"
                  >
                    {deferredPrompt ? 'Install App' : 'Get Standalone App'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer credits and copyright bar - Hidden on print layout */}
      <footer className="py-6 border-t border-gray-150 text-center text-xs text-gray-400 bg-white print:hidden mt-auto mb-16 xl:mb-0" id="terminal-footer">
        <p className="font-sans">© 2026 AutoServe CRM. Standalone application enabled. Powered by Google AI Studio.</p>
      </footer>
    </div>
  );
}

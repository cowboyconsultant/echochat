import React, { useEffect, useState, useRef } from 'react';
import { Contact } from '../types';

interface ContactListProps {
  contacts: Contact[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onImportClick: () => void; // New prop to trigger import modal
}

const SwipeableContactItem = ({ 
  contact, 
  isSelected, 
  onSelect 
}: { 
  contact: Contact; 
  isSelected: boolean; 
  onSelect: (id: string) => void;
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentOffsetX = useRef(0);

  // Swipe Thresholds
  const SWIPE_THRESHOLD = 50;
  const LEFT_ACTIONS_WIDTH = 140; 
  const RIGHT_ACTIONS_WIDTH = 180; 

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    currentOffsetX.current = offsetX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const deltaX = x - startX.current;
    const deltaY = y - startY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      let newOffset = currentOffsetX.current + deltaX;
      if (newOffset > LEFT_ACTIONS_WIDTH + 20) newOffset = LEFT_ACTIONS_WIDTH + 20 + (newOffset - (LEFT_ACTIONS_WIDTH + 20)) * 0.2;
      if (newOffset < -RIGHT_ACTIONS_WIDTH - 20) newOffset = -RIGHT_ACTIONS_WIDTH - 20 + (newOffset - (-RIGHT_ACTIONS_WIDTH - 20)) * 0.2;
      setOffsetX(newOffset);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offsetX > SWIPE_THRESHOLD) {
      setOffsetX(LEFT_ACTIONS_WIDTH);
    } else if (offsetX < -SWIPE_THRESHOLD) {
      setOffsetX(-RIGHT_ACTIONS_WIDTH);
    } else {
      setOffsetX(0);
    }
  };

  const handleClick = () => {
    if (Math.abs(offsetX) > 0) {
      setOffsetX(0);
    } else {
      onSelect(contact.id);
    }
  };

  useEffect(() => {
    if (!isSelected) {
      setOffsetX(0);
    }
  }, [isSelected]);

  return (
    <div className="relative w-full overflow-hidden border-b border-slate-50 touch-pan-y select-none group">
      {/* Actions Background Layer */}
      <div className="absolute inset-0 flex text-white font-medium text-xs">
        <div className="flex-1 flex justify-start bg-emerald-500">
          <button className="h-full w-[70px] flex flex-col items-center justify-center bg-blue-500 active:bg-blue-600 transition-colors">Pin</button>
          <button className="h-full w-[70px] flex flex-col items-center justify-center bg-emerald-500 active:bg-emerald-600 transition-colors">Read</button>
        </div>
        <div className="flex-1 flex justify-end bg-red-500">
          <button className="h-full w-[60px] flex flex-col items-center justify-center bg-amber-500 active:bg-amber-600 transition-colors">Mute</button>
          <button className="h-full w-[60px] flex flex-col items-center justify-center bg-slate-500 active:bg-slate-600 transition-colors">Archive</button>
          <button className="h-full w-[60px] flex flex-col items-center justify-center bg-red-500 active:bg-red-600 transition-colors">Delete</button>
        </div>
      </div>

      {/* Main Content Layer */}
      <div 
        className={`relative bg-white w-full transition-transform ${isDragging ? 'duration-0' : 'duration-300 ease-out'}
          ${isSelected ? 'bg-indigo-50 border-r-4 border-r-indigo-500' : 'hover:bg-slate-50'}
        `}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="p-4 flex items-center gap-3">
          <img 
            src={contact.avatarUrl} 
            alt={contact.name} 
            className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm pointer-events-none"
          />
          <div className="flex-1 text-left pointer-events-none">
            <h3 className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
              {contact.name}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-1">
              {contact.messages[contact.messages.length - 1]?.text || 'No messages'}
            </p>
          </div>
          {contact.analysis && (
            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Analyzed" />
          )}
        </div>
      </div>
    </div>
  );
};

export const ContactList: React.FC<ContactListProps> = ({ contacts, selectedId, onSelect, onImportClick }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  const showInstallButton = !isStandalone && (deferredPrompt || isIOS);

  return (
    <div className="w-full md:w-80 border-r border-slate-200 h-full flex flex-col bg-white relative">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-lg text-slate-800">Messages</h2>
        <button 
          onClick={onImportClick}
          className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors"
          title="Import Real Chat Data"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto flex-1 overflow-x-hidden">
        {contacts.map((contact) => (
          <SwipeableContactItem 
            key={contact.id} 
            contact={contact} 
            isSelected={selectedId === contact.id} 
            onSelect={onSelect} 
          />
        ))}
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
        {showInstallButton && (
          <button 
            onClick={handleInstallClick}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Install App
          </button>
        )}
      </div>

      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowIOSInstructions(false)}>
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-800">Install for iOS</h3>
              <button onClick={() => setShowIOSInstructions(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-slate-600 mb-4 text-sm">Install EchoChat on your home screen for the full native experience.</p>
          </div>
        </div>
      )}
    </div>
  );
};
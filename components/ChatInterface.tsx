import React, { useState, useRef, useEffect } from 'react';
import { Contact, Message, Sender } from '../types';

interface ChatInterfaceProps {
  contact: Contact;
  onSendMessage: (text: string) => void;
  onSimulateIncoming: (text: string) => void;
  onGenerateDraft: (incomingText: string) => void;
  isGenerating: boolean;
  onBack: () => void;
  onToggleAnalysis: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  contact, 
  onSendMessage, 
  onSimulateIncoming,
  onGenerateDraft,
  isGenerating,
  onBack,
  onToggleAnalysis
}) => {
  const [inputText, setInputText] = useState('');
  const [simulationText, setSimulationText] = useState('');
  const [showSimulationInput, setShowSimulationInput] = useState(false);
  const [pendingIncomingMsg, setPendingIncomingMsg] = useState<string | null>(null);
  const [showDraftConfirmation, setShowDraftConfirmation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [contact.messages]);

  // Clear notification if contact changes
  useEffect(() => {
    setPendingIncomingMsg(null);
    setShowDraftConfirmation(false);
    setInputText('');
  }, [contact.id]);

  // When a new draft arrives, show the confirmation popup
  useEffect(() => {
    if (contact.draftResponse) {
      setShowDraftConfirmation(true);
    }
  }, [contact.draftResponse]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    onSendMessage(text);
    setInputText('');
    setShowDraftConfirmation(false);
  };

  const handleSimulate = () => {
    if (!simulationText.trim()) return;
    onSimulateIncoming(simulationText);
    // Show notification instead of auto generating
    setPendingIncomingMsg(simulationText);
    setSimulationText('');
    setShowSimulationInput(false);
  };

  const confirmDraft = () => {
    if (pendingIncomingMsg) {
      onGenerateDraft(pendingIncomingMsg);
      setPendingIncomingMsg(null);
    }
  };

  const dismissNotification = () => {
    setPendingIncomingMsg(null);
  };

  const handleEditDraft = () => {
    if (contact.draftResponse) {
      setInputText(contact.draftResponse);
      setShowDraftConfirmation(false);
      // Focus the input area so user can type immediately
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F3F4F6] relative h-full">
      {/* Header */}
      <div className="bg-white p-3 border-b border-slate-200 flex items-center justify-between shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-3">
          {/* Back Button - Mobile Only */}
          <button 
            onClick={onBack}
            className="md:hidden p-2 -ml-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <img src={contact.avatarUrl} alt={contact.name} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h2 className="font-bold text-slate-800 text-sm md:text-base">{contact.name}</h2>
            <p className="text-[10px] md:text-xs text-green-500 font-medium">Synced with iCloud</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSimulationInput(!showSimulationInput)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md transition-colors hidden sm:block"
          >
            {showSimulationInput ? 'Cancel' : 'Simulate Msg'}
          </button>
           {/* Mobile Simulation Toggle (Icon Only) */}
           <button 
            onClick={() => setShowSimulationInput(!showSimulationInput)}
            className="sm:hidden p-2 text-slate-600 bg-slate-100 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </button>

          {/* Analysis Info Button */}
          <button 
            onClick={onToggleAnalysis}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title="View Analysis"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Draft Confirmation Modal - Post Generation */}
      {showDraftConfirmation && contact.draftResponse && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-indigo-100 overflow-hidden animate-bounce-in">
             <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white">
                <h3 className="font-bold text-lg">Response Generated</h3>
                <p className="text-xs opacity-90">Based on your style with {contact.name}</p>
             </div>
             <div className="p-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 mb-6 font-medium text-lg leading-relaxed shadow-inner">
                  "{contact.draftResponse}"
                </div>
                <div className="flex flex-col gap-2">
                   <button 
                     onClick={() => handleSend(contact.draftResponse!)}
                     className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                   >
                     <span>Send Now</span>
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                     </svg>
                   </button>
                   <div className="flex gap-2">
                     <button 
                       onClick={handleEditDraft}
                       className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors"
                     >
                       Edit Draft
                     </button>
                     <button 
                       onClick={() => setShowDraftConfirmation(false)}
                       className="px-4 py-3 bg-white border border-slate-200 text-red-500 rounded-xl font-medium text-sm hover:bg-red-50 transition-colors"
                     >
                       Discard
                     </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Simulation Input Overlay */}
      {showSimulationInput && (
        <div className="absolute top-20 left-4 right-4 z-20 bg-white p-4 rounded-lg shadow-xl border border-indigo-100">
          <label className="block text-xs font-bold text-indigo-600 uppercase mb-2">
            Simulate a message from {contact.name}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={simulationText}
              onChange={(e) => setSimulationText(e.target.value)}
              placeholder={`What did ${contact.name} say?`}
              className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
            />
            <button 
              onClick={handleSimulate}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
            >
              Receive
            </button>
          </div>
        </div>
      )}

      {/* Incoming Message Notification */}
      {pendingIncomingMsg && (
        <div className="absolute top-4 right-4 left-4 md:left-auto md:w-96 z-40 bg-white rounded-xl shadow-2xl border border-indigo-100 overflow-hidden animate-bounce-in">
          <div className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                 <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                   </svg>
                 </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm mb-1">New message from {contact.name}</h4>
                <p className="text-sm text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  "{pendingIncomingMsg}"
                </p>
                <p className="text-xs font-semibold text-indigo-600 mb-3">
                  Would you like the app to draft a response based on your history?
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={confirmDraft}
                    className="flex-1 bg-indigo-600 text-white text-xs py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Yes, Draft Response
                  </button>
                  <button 
                    onClick={dismissNotification}
                    className="px-4 bg-white border border-slate-200 text-slate-600 text-xs py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-slate-100">
             <div className="h-full bg-indigo-500 w-full animate-[shrink_5s_linear_forwards]" />
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {contact.messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === Sender.ME ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.sender === Sender.ME 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 md:p-4 border-t border-slate-200 sticky bottom-0 z-10 pb-[env(safe-area-inset-bottom)]">
        {isGenerating && (
          <div className="mb-2 text-xs text-indigo-500 flex items-center gap-1 animate-pulse">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Drafting response...
          </div>
        )}
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
             <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-12 min-h-[48px] max-h-32 transition-colors text-sm
                ${contact.draftResponse && contact.draftResponse === inputText ? 'border-indigo-300 bg-indigo-50' : 'border-slate-300 bg-white'}
              `}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputText);
                }
              }}
            />
          </div>
         
          <button
            onClick={() => handleSend(inputText)}
            disabled={!inputText.trim()}
            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 shadow-md flex-shrink-0"
          >
            <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
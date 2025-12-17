import React, { useState, useEffect } from 'react';
import { ContactList } from './components/ContactList';
import { ChatInterface } from './components/ChatInterface';
import { AnalysisPanel } from './components/AnalysisPanel';
import { MOCK_CONTACTS } from './constants';
import { Contact, Sender, Message } from './types';
import { analyzeContactStyle, generateContextualReply } from './services/geminiService';

const App: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [selectedContactId, setSelectedContactId] = useState<string>(MOCK_CONTACTS[0].id);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [generatingContactId, setGeneratingContactId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importName, setImportName] = useState('');
  
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const selectedContact = contacts.find(c => c.id === selectedContactId) || contacts[0];

  const handleContactSelect = (id: string) => {
    setSelectedContactId(id);
    setMobileView('chat');
    const contact = contacts.find(c => c.id === id);
    if (contact && !contact.analysis && !contact.isAnalyzing) {
      handleAnalyze(id);
    }
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  const handleSendMessage = (text: string) => {
    setContacts(prev => prev.map(c => {
      if (c.id === selectedContactId) {
        return {
          ...c,
          messages: [
            ...c.messages,
            {
              id: Date.now().toString(),
              sender: Sender.ME,
              text,
              timestamp: new Date().toISOString()
            }
          ],
          draftResponse: undefined
        };
      }
      return c;
    }));
  };

  const handleSimulateIncoming = (text: string) => {
    setContacts(prev => prev.map(c => {
      if (c.id === selectedContactId) {
        return {
          ...c,
          messages: [
            ...c.messages,
            {
              id: Date.now().toString(),
              sender: Sender.THEM,
              text,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return c;
    }));
  };

  const handleAnalyze = async (contactId: string) => {
    const contactToAnalyze = contacts.find(c => c.id === contactId);
    if (!contactToAnalyze) return;

    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, isAnalyzing: true } : c));

    try {
      const analysis = await analyzeContactStyle(contactToAnalyze.name, contactToAnalyze.messages);
      setContacts(prev => prev.map(c => 
        c.id === contactId 
          ? { ...c, analysis, isAnalyzing: false, lastAnalyzed: Date.now() } 
          : c
      ));
    } catch (error) {
      console.error("Failed to analyze", error);
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, isAnalyzing: false } : c));
    }
  };

  useEffect(() => {
    if (selectedContact && !selectedContact.analysis && !selectedContact.isAnalyzing) {
      handleAnalyze(selectedContact.id);
    }
  }, []);

  const handleGenerateDraft = async (incomingText: string) => {
    let currentContact = contacts.find(c => c.id === selectedContactId);
    if (!currentContact) return;

    setGeneratingContactId(selectedContactId);
    
    try {
      const reply = await generateContextualReply(currentContact, incomingText);
      
      setContacts(prev => prev.map(c => 
        c.id === selectedContactId 
          ? { ...c, draftResponse: reply } 
          : c
      ));
    } catch (error) {
      console.error("Draft generation failed", error);
    } finally {
      setGeneratingContactId(null);
    }
  };

  // --- LOGIC FOR IMPORTING REAL DATA ---
  const processImport = () => {
    if (!importName.trim() || !importText.trim()) return;

    // Basic Parser: Splits by newlines, tries to guess Sender based on "Me:" vs "Other:"
    // This is a heuristic parser.
    const lines = importText.split('\n');
    const parsedMessages: Message[] = [];
    
    lines.forEach((line, index) => {
      if (!line.trim()) return;
      
      let sender = Sender.THEM;
      let text = line;
      
      // Heuristics for transcript formats
      const lower = line.toLowerCase();
      if (lower.startsWith('me:') || lower.startsWith('myself:')) {
        sender = Sender.ME;
        text = line.substring(line.indexOf(':') + 1).trim();
      } else if (lower.startsWith(importName.toLowerCase() + ':')) {
        sender = Sender.THEM;
        text = line.substring(line.indexOf(':') + 1).trim();
      } else {
        // Fallback: If no prefix, assume alternating or check previous
        // For now, let's assume if it doesn't say "Me:", it's Them, unless we can improve logic.
        // A simple improvement: Check if line starts with a timestamp or simple text
        sender = Sender.THEM; 
      }

      parsedMessages.push({
        id: `imported-${Date.now()}-${index}`,
        sender,
        text,
        timestamp: new Date().toISOString() // We set now as timestamp for simplicity unless parsed
      });
    });

    const newContact: Contact = {
      id: `imported-${Date.now()}`,
      name: importName,
      avatarUrl: `https://ui-avatars.com/api/?name=${importName}&background=random`,
      messages: parsedMessages,
    };

    setContacts(prev => [newContact, ...prev]);
    setSelectedContactId(newContact.id);
    setShowImportModal(false);
    setImportName('');
    setImportText('');
    setMobileView('chat');
    
    // Auto trigger analysis
    setTimeout(() => handleAnalyze(newContact.id), 500);
  };

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden relative">
      <div className={`
        ${mobileView === 'chat' ? 'hidden' : 'flex'} 
        md:flex w-full md:w-80 h-full z-10
      `}>
        <ContactList 
          contacts={contacts} 
          selectedId={selectedContactId} 
          onSelect={handleContactSelect} 
          onImportClick={() => setShowImportModal(true)}
        />
      </div>

      <div className={`
        ${mobileView === 'list' ? 'hidden' : 'flex'} 
        flex-1 min-w-0 h-full relative z-0
      `}>
        <ChatInterface 
          contact={selectedContact}
          onSendMessage={handleSendMessage}
          onSimulateIncoming={handleSimulateIncoming}
          onGenerateDraft={handleGenerateDraft}
          isGenerating={generatingContactId === selectedContactId}
          onBack={handleBackToList}
          onToggleAnalysis={() => setShowAnalysisPanel(!showAnalysisPanel)}
        />
        
        <div className={`
          fixed inset-y-0 right-0 w-full sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-30
          ${showAnalysisPanel ? 'translate-x-0' : 'translate-x-full'}
          lg:relative lg:transform-none lg:w-80 lg:border-l lg:border-slate-200
          ${showAnalysisPanel ? 'lg:block' : 'lg:hidden'}
        `}>
          <div className="lg:hidden absolute top-4 right-4 z-50">
            <button onClick={() => setShowAnalysisPanel(false)} className="p-2 bg-slate-100 rounded-full text-slate-600">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <AnalysisPanel 
            contact={selectedContact} 
            onAnalyze={() => handleAnalyze(selectedContact.id)}
            isAnalyzing={!!selectedContact.isAnalyzing}
          />
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Import Chat History</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
                <input 
                  type="text" 
                  value={importName}
                  onChange={e => setImportName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Jessica"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Chat Transcript (Paste Here)
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Copy messages from your computer. Format: "Me: Hello" or "Jessica: Hi". 
                  The more history you paste, the better the AI analysis.
                </p>
                <textarea 
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-48 font-mono text-sm"
                  placeholder={`Me: Hey, are we still on?\nJessica: Yes! See you at 5.\nMe: Great.`}
                />
              </div>
              <button 
                onClick={processImport}
                disabled={!importName || !importText}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Analyze & Create Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
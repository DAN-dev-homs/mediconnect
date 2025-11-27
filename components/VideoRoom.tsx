
import React, { useEffect, useRef, useState } from 'react';
import { Patient, Message } from '../types';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, FileText, Bot, Send, User } from 'lucide-react';
import { LiveService } from '../services/liveService';
import { PrescriptionModal } from './PrescriptionModal';
import { PatientCard } from './PatientCard';

interface Props {
  patient: Patient;
  onEndCall: () => void;
  onUpdatePatient?: (patient: Patient) => void;
}

export const VideoRoom: React.FC<Props> = ({ patient, onEndCall, onUpdatePatient }) => {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [aiActive, setAiActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'fiche'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [notes, setNotes] = useState('');
  const [showPrescription, setShowPrescription] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const liveServiceRef = useRef<LiveService | null>(null);

  // Initialize Camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    if (camOn) startCamera();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [camOn]);

  // Handle AI Toggle
  const toggleAI = async () => {
    if (!aiActive) {
      if (!process.env.API_KEY) {
        alert("API Key missing");
        return;
      }
      liveServiceRef.current = new LiveService(process.env.API_KEY);
      try {
        await liveServiceRef.current.connect({
          apiKey: process.env.API_KEY,
          onAudioData: () => {}, // Handled internally for now
          onTranscription: (text, isUser) => {
             // Optional: Display real-time transcription in notes or chat
          },
          onError: (e) => console.error(e)
        });
        setAiActive(true);
      } catch (e) {
        console.error("Failed to connect AI", e);
      }
    } else {
      if (liveServiceRef.current) {
        await liveServiceRef.current.disconnect();
      }
      setAiActive(false);
    }
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: 'doctor',
      text: inputValue,
      timestamp: new Date()
    };
    setMessages([...messages, newMsg]);
    setInputValue('');
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Remote Video (Simulated Patient) */}
        <div className="flex-1 bg-slate-800 relative flex items-center justify-center">
            <img 
                src="https://picsum.photos/1280/720" 
                alt="Remote Patient" 
                className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {patient.name}
            </div>
        </div>

        {/* Controls Bar */}
        <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4 px-6 z-20">
            <button 
                onClick={() => setMicOn(!micOn)}
                className={`p-4 rounded-full transition-colors ${micOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
            >
                {micOn ? <Mic /> : <MicOff />}
            </button>
            <button 
                onClick={() => setCamOn(!camOn)}
                className={`p-4 rounded-full transition-colors ${camOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
            >
                {camOn ? <Video /> : <VideoOff />}
            </button>
            <button 
                onClick={onEndCall}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white px-8 font-semibold flex items-center gap-2"
            >
                <PhoneOff /> Finir
            </button>
            <div className="w-px h-10 bg-slate-700 mx-2"></div>
            <button 
                onClick={toggleAI}
                className={`p-4 rounded-full transition-all border-2 ${aiActive ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-700 border-transparent text-slate-300 hover:text-white'}`}
                title="Activer l'assistant IA vocal"
            >
                <Bot className={aiActive ? 'animate-pulse' : ''} />
            </button>
        </div>

        {/* Local Video (PiP) */}
        <div className="absolute bottom-24 right-6 w-48 h-36 bg-black rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl">
             <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover ${!camOn ? 'hidden' : ''}`}
             />
             {!camOn && <div className="w-full h-full flex items-center justify-center text-slate-500"><VideoOff /></div>}
        </div>
      </div>

      {/* Sidebar Tools */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col shadow-xl z-30 transition-all duration-300">
        <div className="h-16 border-b flex items-center justify-around px-2 bg-slate-50">
            <button 
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'chat' ? 'bg-white shadow-sm text-medical-600' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                <MessageSquare className="w-4 h-4" /> Chat
            </button>
            <button 
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'notes' ? 'bg-white shadow-sm text-medical-600' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                <FileText className="w-4 h-4" /> Notes
            </button>
            <button 
                onClick={() => setActiveTab('fiche')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'fiche' ? 'bg-white shadow-sm text-medical-600' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                <User className="w-4 h-4" /> Fiche
            </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
            {activeTab === 'chat' && (
                <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-200">
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                        {messages.length === 0 && <p className="text-center text-slate-400 text-sm mt-10">Début de la conversation sécurisée.</p>}
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.senderId === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.senderId === 'doctor' ? 'bg-medical-600 text-white rounded-tr-none' : 'bg-white border rounded-tl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 bg-white border-t flex gap-2">
                        <input 
                            className="flex-1 bg-slate-100 border-none rounded-full px-4 text-sm focus:ring-2 focus:ring-medical-500 outline-none"
                            placeholder="Votre message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button onClick={sendMessage} className="p-2 bg-medical-600 text-white rounded-full hover:bg-medical-700">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            
            {activeTab === 'notes' && (
                <div className="h-full flex flex-col p-4 animate-in fade-in slide-in-from-right-4 duration-200">
                    <textarea 
                        className="flex-1 w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-slate-700 focus:ring-2 focus:ring-yellow-400 outline-none resize-none font-mono leading-relaxed"
                        placeholder="Notes de consultation..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                    <div className="mt-4">
                         <button 
                            onClick={() => setShowPrescription(true)}
                            className="w-full py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium flex items-center justify-center gap-2"
                        >
                            <FileText className="w-4 h-4" /> Créer Ordonnance
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'fiche' && (
               <div className="h-full p-4 bg-slate-50 animate-in fade-in slide-in-from-right-4 duration-200">
                  <PatientCard 
                      patient={patient} 
                      onUpdate={onUpdatePatient} 
                      isDoctorView={true}
                  />
               </div>
            )}
        </div>
      </div>

      <PrescriptionModal 
        isOpen={showPrescription}
        onClose={() => setShowPrescription(false)}
        patientName={patient.name}
        patientAge={patient.age}
      />
    </div>
  );
};

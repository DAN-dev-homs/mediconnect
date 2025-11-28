
import React, { useState } from 'react';
import { LabTest, LabOrder } from '../types';
import { generateLabSuggestions } from '../services/geminiService';
import { Loader2, Plus, Trash2, Wand2, QrCode, CheckCircle, Download, FlaskConical, Microscope } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  doctorName: string;
  consultationNotes?: string;
  onSave: (order: LabOrder) => void;
}

export const LabOrderModal: React.FC<Props> = ({ isOpen, onClose, patientName, doctorName, consultationNotes, onSave }) => {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [currentTest, setCurrentTest] = useState('');
  const [currentReason, setCurrentReason] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  if (!isOpen) return null;

  const handleAiAssist = async () => {
    setLoadingAI(true);
    const context = consultationNotes || currentReason || "Bilan général";
    const suggestions = await generateLabSuggestions(context);
    
    // Convert AI suggestions to LabTest items
    const newTests = suggestions.map((s: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: s.name,
        reason: s.reason
    }));
    
    setTests(prev => [...prev, ...newTests]);
    setLoadingAI(false);
  };

  const addItem = () => {
    if (!currentTest) return;
    const newItem: LabTest = {
      id: Math.random().toString(36).substr(2, 9),
      name: currentTest,
      reason: currentReason || 'Bilan'
    };
    setTests([...tests, newItem]);
    setCurrentTest('');
    setCurrentReason('');
  };

  const removeItem = (id: string) => {
    setTests(tests.filter(i => i.id !== id));
  };

  const handleSign = () => {
    const order: LabOrder = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        doctorName: doctorName,
        tests: tests
    };
    onSave(order);
    setIsSigned(true);
  };

  const resetAndClose = () => {
      setIsSigned(false);
      setTests([]);
      onClose();
  }

  // Generate QR Data
  const orderData = JSON.stringify({
      type: "LAB_ORDER",
      doctor: doctorName,
      patient: patientName,
      date: new Date().toISOString(),
      tests: tests
  });
  
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(orderData)}&color=0891b2`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-cyan-600 p-4 text-white flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {isSigned ? <CheckCircle className="w-6 h-6" /> : <Microscope className="w-6 h-6" />}
            {isSigned ? 'Bon de Labo Validé' : 'Prescription d\'Analyses'}
          </h2>
          <button onClick={resetAndClose} className="hover:bg-cyan-500 p-1 rounded">Fermer</button>
        </div>

        {isSigned ? (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 flex-1 bg-slate-50">
                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                    <img src={qrUrl} alt="QR Code Labo" className="w-64 h-64 mix-blend-multiply" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Document Signé Numériquement</h3>
                    <p className="text-slate-500 max-w-md mx-auto mt-2">
                        Présentez ce QR code au laboratoire d'analyses médicales. Il contient la liste sécurisée des examens demandés.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button onClick={resetAndClose} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-white transition-colors">
                        Fermer
                    </button>
                    <button className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2 shadow-md">
                        <Download className="w-4 h-4" /> Télécharger PDF
                    </button>
                </div>
            </div>
        ) : (
            <>
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="mb-6 bg-cyan-50 p-4 rounded-lg border border-cyan-100 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-cyan-600 uppercase tracking-wide font-semibold">Patient</p>
                        <p className="text-lg font-medium text-slate-800">{patientName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-cyan-600 uppercase tracking-wide font-semibold">Prescripteur</p>
                        <p className="text-lg font-medium text-slate-800">{doctorName}</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                        <h3 className="font-medium text-slate-700">Ajouter un examen</h3>
                        <button 
                            onClick={handleAiAssist}
                            disabled={loadingAI}
                            className="flex items-center gap-2 text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-200 transition-colors disabled:opacity-50"
                        >
                            {loadingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                            Suggérer selon notes
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-7">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Analyse demandée</label>
                            <div className="relative">
                                <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={currentTest}
                                    onChange={(e) => setCurrentTest(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 outline-none"
                                    placeholder="ex: Numération Formule Sanguine (NFS)"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-5">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Motif / Précision</label>
                            <input 
                            type="text" 
                            value={currentReason}
                            onChange={(e) => setCurrentReason(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 outline-none"
                            placeholder="ex: Fatigue, Fièvre..."
                            />
                        </div>
                    </div>
                    <button 
                    onClick={addItem}
                    className="w-full bg-slate-800 text-white py-2 rounded-md hover:bg-slate-700 flex items-center justify-center gap-2 transition-all"
                    >
                    <Plus className="w-4 h-4" /> Ajouter au bon
                    </button>
                </div>

                <div className="space-y-3">
                    <h3 className="font-medium text-slate-700 border-b pb-2">Examens prescrits</h3>
                    {tests.length === 0 && <p className="text-slate-400 italic text-sm text-center py-4">Aucune analyse ajoutée.</p>}
                    {tests.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-3 border rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-50 p-2 rounded-lg text-cyan-600">
                                <Microscope className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">{item.name}</p>
                                <p className="text-xs text-slate-500">{item.reason}</p>
                            </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    ))}
                </div>
                </div>

                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-md">Annuler</button>
                <button 
                    onClick={handleSign} 
                    className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 font-medium shadow-md flex items-center gap-2"
                    disabled={tests.length === 0}
                >
                    <QrCode className="w-4 h-4" /> Signer et Générer QR
                </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

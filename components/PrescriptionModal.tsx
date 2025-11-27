import React, { useState } from 'react';
import { PrescriptionItem } from '../types';
import { generatePrescriptionAdvice } from '../services/geminiService';
import { Loader2, Plus, Trash2, Wand2, QrCode, CheckCircle, Download } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientAge: number;
}

export const PrescriptionModal: React.FC<Props> = ({ isOpen, onClose, patientName, patientAge }) => {
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [currentMed, setCurrentMed] = useState('');
  const [currentDosage, setCurrentDosage] = useState('');
  const [currentInstructions, setCurrentInstructions] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  if (!isOpen) return null;

  const handleAiAssist = async () => {
    if (!currentMed) return;
    setLoadingAI(true);
    const result = await generatePrescriptionAdvice(currentMed, patientAge);
    setCurrentDosage(result.dosage);
    setCurrentInstructions(result.instructions);
    setLoadingAI(false);
  };

  const addItem = () => {
    if (!currentMed) return;
    const newItem: PrescriptionItem = {
      id: Math.random().toString(36).substr(2, 9),
      medication: currentMed,
      dosage: currentDosage,
      instructions: currentInstructions
    };
    setItems([...items, newItem]);
    setCurrentMed('');
    setCurrentDosage('');
    setCurrentInstructions('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSign = () => {
    setIsSigned(true);
  };

  const resetAndClose = () => {
      setIsSigned(false);
      setItems([]);
      onClose();
  }

  // Generate QR Data
  const prescriptionData = JSON.stringify({
      doctor: "Dr. Moreau",
      patient: patientName,
      date: new Date().toISOString(),
      items: items
  });
  
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(prescriptionData)}&color=1e293b`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-medical-600 p-4 text-white flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {isSigned ? <CheckCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            {isSigned ? 'Ordonnance Validée' : 'Nouvelle Ordonnance'}
          </h2>
          <button onClick={resetAndClose} className="hover:bg-medical-500 p-1 rounded">Fermer</button>
        </div>

        {isSigned ? (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 flex-1 bg-slate-50">
                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                    <img src={qrUrl} alt="QR Code Ordonnance" className="w-64 h-64 mix-blend-multiply" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Ordonnance Signée Numériquement</h3>
                    <p className="text-slate-500 max-w-md mx-auto mt-2">
                        Le patient peut scanner ce QR code en pharmacie pour récupérer son traitement. Il contient l'identité du prescripteur et la liste sécurisée des médicaments.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button onClick={resetAndClose} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-white transition-colors">
                        Terminer
                    </button>
                    <button className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2 shadow-md">
                        <Download className="w-4 h-4" /> Télécharger PDF
                    </button>
                </div>
            </div>
        ) : (
            <>
                <div className="p-6 overflow-y-auto flex-1">
                <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Patient</p>
                        <p className="text-lg font-medium text-slate-800">{patientName} ({patientAge} ans)</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Médecin</p>
                        <p className="text-lg font-medium text-slate-800">Dr. Moreau</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <h3 className="font-medium text-slate-700">Ajouter un médicament</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Médicament</label>
                        <input 
                        type="text" 
                        value={currentMed}
                        onChange={(e) => setCurrentMed(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-medical-500 outline-none"
                        placeholder="ex: Amoxicilline"
                        />
                    </div>
                    <div className="md:col-span-7 flex items-end">
                        <button 
                        onClick={handleAiAssist}
                        disabled={!currentMed || loadingAI}
                        className="flex items-center gap-2 text-sm bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-200 transition-colors disabled:opacity-50"
                        >
                        {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        Suggestion IA
                        </button>
                    </div>

                    <div className="md:col-span-6">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Dosage</label>
                        <input 
                        type="text" 
                        value={currentDosage}
                        onChange={(e) => setCurrentDosage(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-medical-500 outline-none"
                        placeholder="ex: 500mg"
                        />
                    </div>
                    <div className="md:col-span-6">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Instructions</label>
                        <input 
                        type="text" 
                        value={currentInstructions}
                        onChange={(e) => setCurrentInstructions(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-medical-500 outline-none"
                        placeholder="ex: 1 matin et soir"
                        />
                    </div>
                    </div>
                    <button 
                    onClick={addItem}
                    className="w-full bg-slate-800 text-white py-2 rounded-md hover:bg-slate-700 flex items-center justify-center gap-2 transition-all"
                    >
                    <Plus className="w-4 h-4" /> Ajouter à la liste
                    </button>
                </div>

                <div className="space-y-3">
                    <h3 className="font-medium text-slate-700 border-b pb-2">Liste des prescriptions</h3>
                    {items.length === 0 && <p className="text-slate-400 italic text-sm">Aucun médicament ajouté.</p>}
                    {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start bg-white p-3 border rounded-lg shadow-sm">
                        <div>
                        <p className="font-semibold text-slate-800">{item.medication} <span className="text-slate-500 font-normal">- {item.dosage}</span></p>
                        <p className="text-sm text-slate-600">{item.instructions}</p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
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
                    className="px-6 py-2 bg-medical-600 text-white rounded-md hover:bg-medical-700 font-medium shadow-md flex items-center gap-2"
                    disabled={items.length === 0}
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

function FileText(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
    )
}
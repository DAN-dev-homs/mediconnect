
import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { QrCode, X, User, Activity, AlertCircle, FileText, Edit2, Save, Mail, Phone, Calendar, Lock, CheckCircle, Clock } from 'lucide-react';

interface Props {
  patient: Patient;
  onUpdate?: (patient: Patient) => void;
  isDoctorView?: boolean;
}

export const PatientCard: React.FC<Props> = ({ patient, onUpdate, isDoctorView = false }) => {
  const [showQr, setShowQr] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Patient>(patient);

  useEffect(() => {
    setFormData(patient);
  }, [patient]);

  const handleChange = (field: keyof Patient, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'history' | 'allergies', value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item !== '');
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const saveChanges = () => {
    if (onUpdate) {
        if (isDoctorView) {
            // En mode médecin, on ne sauvegarde pas directement.
            // On crée un objet pendingUpdates avec uniquement les champs médicaux modifiables.
            const updates: Partial<Patient> = {
                weight: formData.weight,
                height: formData.height,
                bloodType: formData.bloodType,
                history: formData.history,
                allergies: formData.allergies,
                notes: formData.notes
            };
            
            // On envoie la demande de mise à jour
            const updatedPatient = {
                ...patient,
                pendingUpdates: updates
            };
            
            onUpdate(updatedPatient);
            alert("Les modifications ont été envoyées au patient pour approbation.");
        } else {
            // Si c'est le patient lui-même ou un admin système (hors flux médecin restreint)
            onUpdate(formData);
        }
    }
    setIsEditing(false);
  };

  const cancelChanges = () => {
    setFormData(patient);
    setIsEditing(false);
  };

  // Données à encoder dans le QR Code
  const qrData = JSON.stringify({
    type: "MEDICAL_RECORD",
    version: "1.0",
    doctor: "Dr. Moreau",
    lastUpdate: new Date().toISOString(),
    patient: {
      id: formData.id,
      name: formData.name,
      ssn: formData.socialSecurityNumber,
      bloodType: formData.bloodType,
      allergies: formData.allergies,
      history: formData.history,
      contact: {
          phone: formData.phone,
          email: formData.email
      }
    }
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&color=0f172a&bgcolor=f8fafc`;

  const InputField = ({ label, value, onChange, icon: Icon, disabled = false }: any) => (
      <div className="mb-3">
          <label className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
              {label}
              {disabled && <Lock className="w-3 h-3 text-slate-300" />}
          </label>
          <div className="relative">
              {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
              <input 
                className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 text-sm border rounded-lg outline-none transition-all ${disabled ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200 focus:ring-2 focus:ring-medical-500'}`}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
              />
          </div>
      </div>
  );

  return (
    <div className="bg-white flex flex-col h-full relative">
      <div className="bg-medical-600 px-6 py-5 text-white flex justify-between items-center shrink-0">
        <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" /> Fiche Numérique Patient
            </h3>
            <p className="text-medical-100 text-xs mt-1 opacity-80">Dossier médical unifié & sécurisé</p>
        </div>
        
        <div className="flex gap-2">
            {patient.pendingUpdates && isDoctorView && (
                <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-100 px-3 py-2 rounded-lg text-xs font-bold border border-yellow-500/30">
                    <Clock className="w-4 h-4" /> Modif. en attente
                </div>
            )}

            {!isEditing && onUpdate && !showQr && (
                <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium backdrop-blur-sm"
                >
                    <Edit2 className="w-4 h-4" /> {isDoctorView ? 'Proposer Modif.' : 'Modifier'}
                </button>
            )}
            <button 
            onClick={() => { setShowQr(!showQr); setIsEditing(false); }}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium backdrop-blur-sm ${showQr ? 'bg-white text-medical-600 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
                <QrCode className="w-4 h-4" /> {showQr ? 'Masquer QR' : 'QR Code'}
            </button>
        </div>
      </div>

      {showQr ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 animate-in fade-in zoom-in duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-6 transform transition-transform hover:scale-105">
            <img src={qrUrl} alt="QR Code Patient" className="w-56 h-56 mix-blend-multiply" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{formData.name}</h2>
          <p className="text-center text-slate-600 font-medium mb-4">Dossier Médical Numérique</p>
          <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg text-sm max-w-sm text-center border border-blue-100">
             <p>Scannez ce code pour partager instantanément les informations vitales, allergies et antécédents avec un autre professionnel de santé.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-8 relative custom-scrollbar bg-slate-50/30">
          {/* Actions Save/Cancel en mode édition */}
          {isEditing && (
              <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-sm border border-medical-100 mb-6 flex justify-between items-center animate-in slide-in-from-top-2">
                  <span className="text-sm font-bold text-medical-600 flex items-center gap-2 px-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                      Mode Édition {isDoctorView ? '(Restreint)' : ''}
                  </span>
                  <div className="flex gap-2">
                      <button onClick={cancelChanges} className="text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                          Annuler
                      </button>
                      <button onClick={saveChanges} className="bg-medical-600 hover:bg-medical-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-md shadow-medical-200 transition-all flex items-center gap-2">
                          <Save className="w-4 h-4" /> {isDoctorView ? 'Envoyer demande' : 'Enregistrer'}
                      </button>
                  </div>
              </div>
          )}
          
          {isDoctorView && isEditing && (
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>En tant que médecin, vous ne pouvez pas modifier l'identité civile du patient. Vous pouvez uniquement proposer des mises à jour des données médicales qui devront être validées par le patient.</p>
              </div>
          )}

          {/* Header Identité */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="relative shrink-0 mx-auto md:mx-0">
                    <img src={formData.avatarUrl} className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md" alt="Patient" />
                    {isEditing && !isDoctorView && <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center text-white text-xs cursor-pointer hover:bg-black/50 transition-colors">Modifier</div>}
                </div>
                
                <div className="flex-1 w-full">
                    {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Nom Complet" value={formData.name} onChange={(v: string) => handleChange('name', v)} icon={User} disabled={isDoctorView} />
                            <InputField label="N° Sécurité Sociale" value={formData.socialSecurityNumber} onChange={(v: string) => handleChange('socialSecurityNumber', v)} icon={FileText} disabled={isDoctorView} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Age" value={formData.age} onChange={(v: string) => handleChange('age', parseInt(v) || 0)} disabled={isDoctorView} />
                                <div className="mb-3">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">Sexe {isDoctorView && <Lock className="w-3 h-3 text-slate-300" />}</label>
                                    <select 
                                        className={`w-full px-3 py-2 text-sm border rounded-lg outline-none bg-white ${isDoctorView ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'border-slate-200'}`}
                                        value={formData.gender}
                                        onChange={(e) => handleChange('gender', e.target.value)}
                                        disabled={isDoctorView}
                                    >
                                        <option value="M">Homme</option>
                                        <option value="F">Femme</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{patient.name}</h2>
                            <p className="text-slate-500 text-sm font-medium mb-4">NSS: {patient.socialSecurityNumber || 'Non renseigné'}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <div className="p-2 bg-white rounded-full text-slate-400 shadow-sm"><User className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Profil</p>
                                        <p className="text-sm font-semibold text-slate-700">{patient.age} ans, {patient.gender === 'M' ? 'Homme' : 'Femme'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <div className="p-2 bg-white rounded-full text-slate-400 shadow-sm"><Mail className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Email</p>
                                        <p className="text-sm font-semibold text-slate-700 truncate max-w-[120px]" title={patient.email}>{patient.email || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <div className="p-2 bg-white rounded-full text-slate-400 shadow-sm"><Phone className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Tél</p>
                                        <p className="text-sm font-semibold text-slate-700">{patient.phone || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                     <InputField label="Email" value={formData.email} onChange={(v: string) => handleChange('email', v)} icon={Mail} disabled={isDoctorView} />
                     <InputField label="Téléphone" value={formData.phone} onChange={(v: string) => handleChange('phone', v)} icon={Phone} disabled={isDoctorView} />
                </div>
            )}
          </div>

          {/* Constantes Vitales */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3 px-1">Biométrie & Constantes</h4>
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Poids', value: formData.weight, field: 'weight', unit: '', color: 'blue' },
                    { label: 'Taille', value: formData.height, field: 'height', unit: '', color: 'indigo' },
                    { label: 'Groupe', value: formData.bloodType, field: 'bloodType', unit: '', color: 'pink' }
                ].map((item) => (
                    <div key={item.label} className={`relative p-4 rounded-xl text-center border transition-all ${isEditing ? 'bg-white border-slate-300 shadow-sm' : `bg-white border-slate-100 shadow-sm`}`}>
                        <span className={`block text-xs uppercase font-bold mb-1 text-${item.color}-500`}>{item.label}</span>
                        {isEditing ? (
                             item.field === 'bloodType' ? (
                                <select 
                                    className="w-full text-center font-bold text-slate-700 bg-transparent outline-none border-b border-slate-200 focus:border-medical-500"
                                    value={item.value as string}
                                    onChange={(e) => handleChange(item.field as keyof Patient, e.target.value)}
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                             ) : (
                                <input 
                                    className="w-full text-center font-bold text-slate-700 bg-transparent outline-none border-b border-slate-200 focus:border-medical-500"
                                    value={item.value as string}
                                    onChange={(e) => handleChange(item.field as keyof Patient, e.target.value)}
                                />
                             )
                        ) : (
                            <span className="block text-xl font-bold text-slate-800">{item.value || '-'}</span>
                        )}
                    </div>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Antécédents */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-medical-500" /> Historique Médical
                </h4>
                {isEditing ? (
                    <textarea 
                        className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-200 outline-none bg-slate-50"
                        rows={3}
                        value={formData.history.join(', ')}
                        onChange={(e) => handleArrayChange('history', e.target.value)}
                        placeholder="Séparez les antécédents par des virgules"
                    />
                ) : (
                    <div className="flex flex-wrap gap-2">
                    {formData.history.length > 0 ? formData.history.map((h, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                        {h}
                        </span>
                    )) : <p className="text-slate-400 italic text-sm">Aucun historique disponible.</p>}
                    </div>
                )}
            </div>

            {/* Allergies */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" /> Allergies
                </h4>
                {isEditing ? (
                    <textarea 
                        className="w-full text-sm p-3 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-100 outline-none bg-red-50/30"
                        rows={2}
                        value={(formData.allergies || []).join(', ')}
                        onChange={(e) => handleArrayChange('allergies', e.target.value)}
                        placeholder="Séparez les allergies par des virgules"
                    />
                ) : (
                    <>
                    {formData.allergies && formData.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {formData.allergies.map((a, i) => (
                        <span key={i} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {a}
                        </span>
                        ))}
                    </div>
                    ) : (
                    <p className="text-sm text-slate-400 italic">Aucune allergie connue.</p>
                    )}
                    </>
                )}
            </div>
          </div>
          
          <div className="bg-slate-100 p-4 rounded-xl flex items-center gap-3 text-slate-500">
            <Calendar className="w-5 h-5" />
            <div className="flex-1">
                <p className="text-xs font-bold uppercase">Dernière visite</p>
                <p className="text-sm font-medium">{patient.lastVisit || 'Jamais'}</p>
            </div>
            {isEditing && (
                <button className="text-xs text-medical-600 font-bold hover:underline">Mettre à jour date</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

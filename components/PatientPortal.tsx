
import React, { useState } from 'react';
import { Patient, Doctor, AppointmentStatus } from '../types';
import { Calendar, Clock, Video, FileText, User, LogOut, Search, Stethoscope, Star, ChevronRight, CheckCircle, AlertTriangle, XCircle, BellRing, X, ArrowRight, Activity, AlertCircle as AlertCircleIcon, Phone, LayoutDashboard, ClipboardList, Menu, Siren } from 'lucide-react';
import { PatientCard } from './PatientCard';

interface Props {
  patient: Patient;
  doctors: Doctor[];
  onLogout: () => void;
  onUpdatePatient: (patient: Patient) => void;
}

type Tab = 'dashboard' | 'doctors' | 'records';

export const PatientPortal: React.FC<Props> = ({ patient, doctors, onLogout, onUpdatePatient }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Filtrer les médecins
  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookAppointment = (doctor: Doctor) => {
      // Le patient demande un RDV, le statut passe en 'pending' sans heure fixe
      const updatedPatient = {
          ...patient,
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorSpecialty: doctor.specialty,
          nextAppointment: undefined, // Pas encore d'heure définie
          appointmentStatus: 'pending' as AppointmentStatus
      };
      
      onUpdatePatient(updatedPatient);
      setActiveTab('dashboard');
      alert(`Demande envoyée au ${doctor.name}. Vous recevrez une proposition de créneau bientôt.`);
  };

  const handleEmergencyClick = () => {
      // Fonction toggle : Si déjà en urgence, on annule. Sinon on ouvre la sélection du médecin.
      if (patient.isEmergency) {
        if (window.confirm("L'urgence est actuellement active. Voulez-vous ANNULER votre signalement ?")) {
             const updatedPatient: Patient = {
                ...patient,
                isEmergency: false
            };
            onUpdatePatient(updatedPatient);
        }
      } else {
        setSearchTerm(''); // Reset search pour afficher tous les médecins
        setShowEmergencyModal(true);
      }
  };

  const triggerEmergencyWithDoctor = (doctor: Doctor) => {
      if (window.confirm(`Confirmez-vous signaler une URGENCE VITALE au ${doctor.name} ?`)) {
          const updatedPatient: Patient = {
              ...patient,
              isEmergency: true,
              appointmentStatus: 'pending', // Force l'apparition dans la liste d'attente
              doctorId: doctor.id,
              doctorName: doctor.name,
              doctorSpecialty: doctor.specialty
          };
          onUpdatePatient(updatedPatient);
          setShowEmergencyModal(false);
      }
  };

  const handleConfirmProposal = () => {
      const updatedPatient: Patient = {
          ...patient,
          appointmentStatus: 'confirmed'
      };
      onUpdatePatient(updatedPatient);
  };

  const handleDeclineProposal = () => {
    if (window.confirm("Refuser ce créneau ? Vous devrez refaire une demande.")) {
        const updatedPatient: Patient = {
            ...patient,
            nextAppointment: undefined,
            appointmentStatus: 'cancelled'
        };
        onUpdatePatient(updatedPatient);
    }
  };

  const handleAcceptUpdates = () => {
      if (!patient.pendingUpdates) return;
      const updatedPatient: Patient = {
          ...patient,
          ...patient.pendingUpdates,
          pendingUpdates: undefined
      };
      onUpdatePatient(updatedPatient);
      alert("Dossier médical mis à jour avec succès.");
  };

  const handleRefuseUpdates = () => {
      const updatedPatient: Patient = {
          ...patient,
          pendingUpdates: undefined
      };
      onUpdatePatient(updatedPatient);
      alert("Demande de modification refusée.");
  }

  const renderDashboard = () => (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="bg-gradient-to-r from-medical-600 to-medical-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
           <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
           <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Bonjour, {patient.name.split(' ')[0]}</h1>
              <p className="text-medical-100 max-w-lg">Bienvenue sur votre portail de santé. Retrouvez vos rendez-vous, vos documents et accédez à vos téléconsultations en toute sécurité.</p>
           </div>
        </div>

        {/* SECTION NOUVELLE CONSULTATION UNIFIÉE */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-medical-50 text-medical-600 rounded-xl">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Demander un rendez-vous</h2>
                    <p className="text-slate-500 text-sm">Sélectionnez le mode de consultation adapté à votre besoin</p>
                </div>
            </div>

            {patient.isEmergency ? (
                 <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center animate-pulse">
                    <div className="flex justify-center mb-4">
                         <div className="bg-red-100 p-4 rounded-full shadow-sm">
                            <Activity className="w-8 h-8 text-red-600" />
                         </div>
                    </div>
                    <h3 className="text-lg font-bold text-red-700 mb-2">URGENCE ACTIVÉE</h3>
                    <p className="text-red-600 mb-1 font-medium">Alerte transmise au {patient.doctorName || 'Médecin de garde'}.</p>
                    <p className="text-red-500 text-sm mb-6">Restez à proximité de votre appareil, le médecin va vous appeler.</p>
                    <button 
                        onClick={handleEmergencyClick} 
                        className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-100 font-bold transition-colors flex items-center gap-2 mx-auto"
                    >
                        <XCircle className="w-4 h-4" /> Annuler l'alerte
                    </button>
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={() => setActiveTab('doctors')} 
                        className="flex items-center gap-4 p-5 border border-slate-200 rounded-xl hover:border-medical-500 hover:shadow-md transition-all text-left group bg-white"
                    >
                         <div className="bg-slate-50 group-hover:bg-medical-50 p-3 rounded-lg text-slate-600 group-hover:text-medical-600 transition-colors">
                             <Search className="w-6 h-6" />
                         </div>
                         <div>
                             <span className="block font-bold text-slate-800 text-lg group-hover:text-medical-700">Consulter un praticien</span>
                             <span className="text-sm text-slate-500">Choisir dans l'annuaire</span>
                         </div>
                         <ChevronRight className="ml-auto text-slate-300 group-hover:text-medical-500 w-6 h-6" />
                    </button>

                    <button 
                        onClick={handleEmergencyClick} 
                        className="flex items-center gap-4 p-5 border border-red-100 bg-red-50/30 rounded-xl hover:border-red-500 hover:bg-red-50 hover:shadow-md transition-all text-left group"
                    >
                         <div className="bg-red-100 p-3 rounded-lg text-red-600 group-hover:scale-110 transition-transform shadow-sm">
                             <AlertTriangle className="w-6 h-6" />
                         </div>
                         <div>
                             <span className="block font-bold text-red-700 text-lg">Urgence Médicale</span>
                             <span className="text-sm text-red-500 font-medium">Signalement immédiat 24/7</span>
                         </div>
                         <Activity className="ml-auto text-red-300 group-hover:text-red-500 w-6 h-6" />
                    </button>
                </div>
            )}
        </div>

        {/* SECTION VALIDATION MISES A JOUR */}
        {patient.pendingUpdates && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-start gap-4 mb-4">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-amber-800">Mise à jour du dossier requise</h2>
                        <p className="text-amber-700 text-sm">Votre médecin souhaite mettre à jour certaines informations médicales de votre dossier. Veuillez valider ces changements.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-amber-100 p-4 mb-4 grid gap-3">
                    {Object.keys(patient.pendingUpdates).map(key => {
                        const k = key as keyof Patient;
                        const oldVal = Array.isArray(patient[k]) ? (patient[k] as string[]).join(', ') : patient[k];
                        const newVal = Array.isArray(patient.pendingUpdates![k]) ? (patient.pendingUpdates![k] as string[]).join(', ') : patient.pendingUpdates![k];
                        
                        let label = key;
                        if(key === 'weight') label = 'Poids';
                        if(key === 'height') label = 'Taille';
                        if(key === 'bloodType') label = 'Groupe Sanguin';
                        if(key === 'history') label = 'Antécédents';
                        if(key === 'allergies') label = 'Allergies';

                        return (
                            <div key={key} className="flex items-center text-sm border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                                <span className="w-32 font-bold text-slate-500 capitalize">{label}</span>
                                <span className="text-slate-400 line-through mr-3">{oldVal || 'Vide'}</span>
                                <ArrowRight className="w-4 h-4 text-slate-300 mr-3" />
                                <span className="font-bold text-slate-800">{newVal || 'Vide'}</span>
                            </div>
                        )
                    })}
                </div>

                <div className="flex gap-3">
                    <button onClick={handleRefuseUpdates} className="px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-bold transition-colors">
                        Refuser
                    </button>
                    <button onClick={handleAcceptUpdates} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-bold shadow-md transition-colors flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Approuver les modifications
                    </button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 space-y-6">
              {/* Carte Rendez-vous */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                 <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-medical-600" /> État des Rendez-vous
                 </h2>
                 
                 {patient.appointmentStatus && patient.appointmentStatus !== 'cancelled' && patient.appointmentStatus !== 'completed' ? (
                     <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col gap-4">
                        
                        {/* Header de la carte RDV */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-3 rounded-lg shadow-sm text-center min-w-[90px]">
                                    {patient.nextAppointment ? (
                                        <>
                                            <span className="block text-xs font-bold text-slate-400 uppercase">
                                                {patient.appointmentDate ? new Date(patient.appointmentDate).toLocaleDateString() : "Aujourd'hui"}
                                            </span>
                                            <span className="block text-xl font-bold text-slate-800">{patient.nextAppointment}</span>
                                        </>
                                    ) : (
                                        <span className="block text-xs font-bold text-slate-400">...</span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{patient.doctorName || 'Médecin'}</p>
                                    <p className="text-sm text-slate-500">{patient.doctorSpecialty || 'Médecin'}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                patient.appointmentStatus === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' :
                                patient.appointmentStatus === 'proposed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                'bg-orange-100 text-orange-700 border-orange-200'
                            }`}>
                                {patient.appointmentStatus === 'confirmed' ? 'Confirmé' : 
                                 patient.appointmentStatus === 'proposed' ? 'Proposition reçue' : 'En attente'}
                            </span>
                        </div>

                        {/* Actions selon le statut */}
                        <div className="pt-2 border-t border-slate-200">
                            {patient.appointmentStatus === 'confirmed' && (
                                <button className="w-full py-3 bg-medical-600 hover:bg-medical-700 text-white rounded-xl font-bold shadow-lg shadow-medical-200 flex items-center justify-center gap-2 animate-pulse">
                                    <Video className="w-4 h-4" /> Rejoindre la salle d'attente
                                </button>
                            )}

                            {patient.appointmentStatus === 'proposed' && (
                                <div>
                                    <p className="text-sm text-slate-600 mb-3 font-medium">
                                        Le médecin propose ce créneau : <span className="font-bold text-slate-900">
                                            {patient.appointmentDate ? new Date(patient.appointmentDate).toLocaleDateString() : ''} à {patient.nextAppointment}
                                        </span>. 
                                        Acceptez-vous ?
                                    </p>
                                    <div className="flex gap-3">
                                        <button onClick={handleDeclineProposal} className="flex-1 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">Refuser</button>
                                        <button onClick={handleConfirmProposal} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md flex items-center justify-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Confirmer RDV
                                        </button>
                                    </div>
                                </div>
                            )}

                            {patient.appointmentStatus === 'pending' && (
                                <p className="text-sm text-slate-500 italic flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Votre demande a été envoyée. Le médecin vous proposera un créneau bientôt.
                                </p>
                            )}
                        </div>
                     </div>
                 ) : (
                     <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 text-center">
                         <p className="text-slate-500 mb-4">Aucun rendez-vous à venir.</p>
                         <p className="text-xs text-slate-400">Utilisez le bouton "Prendre un rendez-vous" ci-dessus pour commencer.</p>
                     </div>
                 )}
              </div>

              {/* Documents */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-medical-600" /> Documents Récents
                 </h2>
                 <div className="space-y-3">
                    {[1, 2].map((_, i) => (
                       <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                          <div className="flex items-center gap-3">
                             <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                                <FileText className="w-4 h-4" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-700">Ordonnance - {i === 0 ? 'Cardiologie' : 'Général'}</p>
                                <p className="text-xs text-slate-400">Dr. Moreau • Il y a {i + 2} jours</p>
                             </div>
                          </div>
                          <button className="text-sm font-medium text-medical-600 hover:underline">Télécharger</button>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Infos Profil */}
           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-fit">
               <h2 className="text-lg font-bold text-slate-800 mb-4">Vos informations</h2>
               <div className="space-y-4 text-sm">
                  <div>
                     <p className="text-slate-400 text-xs uppercase font-bold mb-1">Numéro Sécurité Sociale</p>
                     <p className="font-mono bg-slate-50 p-2 rounded border border-slate-100 text-slate-600">{patient.socialSecurityNumber || 'Non renseigné'}</p>
                  </div>
                  <div>
                     <p className="text-slate-400 text-xs uppercase font-bold mb-1">Email</p>
                     <p className="font-medium text-slate-700">{patient.email}</p>
                  </div>
                  
                  {/* Résumé médical rapide */}
                  <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Poids</span>
                            <span className="font-bold text-slate-800">{patient.weight || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Groupe</span>
                            <span className="font-bold text-slate-800">{patient.bloodType || '-'}</span>
                        </div>
                  </div>

                  <div className="pt-4 border-t">
                     <button onClick={() => setActiveTab('records')} className="w-full py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                        Voir dossier complet
                     </button>
                  </div>
               </div>
           </div>
        </div>
      </div>
  );

  const renderDoctorsList = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-end">
              <div>
                  <h1 className="text-2xl font-bold text-slate-900">Trouver un médecin</h1>
                  <p className="text-slate-500">Choisissez un praticien parmi notre réseau d'experts.</p>
              </div>
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Rechercher une spécialité..." 
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map(doc => (
                  <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-start justify-between mb-4">
                          <img src={doc.avatarUrl} alt={doc.name} className="w-16 h-16 rounded-full border-2 border-slate-100" />
                          <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Dispo
                          </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800">{doc.name}</h3>
                      <p className="text-medical-600 font-medium text-sm flex items-center gap-1 mb-2">
                          <Stethoscope className="w-3 h-3" /> {doc.specialty}
                      </p>
                      
                      <div className="flex items-center gap-1 text-yellow-400 text-sm mb-6">
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-slate-400 text-xs ml-1">(48 avis)</span>
                      </div>

                      <button 
                        onClick={() => handleBookAppointment(doc)}
                        className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                      >
                          Demander RDV <ChevronRight className="w-4 h-4" />
                      </button>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderSidebar = () => (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-50">
           <div className="w-8 h-8 bg-medical-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-medical-200">
               <Activity className="w-5 h-5" />
           </div>
           <span className="font-bold text-xl text-slate-800 tracking-tight">MediConnect</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
            <button 
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'dashboard' ? 'bg-medical-50 text-medical-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
                <LayoutDashboard className="w-5 h-5" /> Tableau de bord
            </button>
            <button 
                onClick={() => { setActiveTab('doctors'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'doctors' ? 'bg-medical-50 text-medical-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
                <Stethoscope className="w-5 h-5" /> Praticiens
            </button>
            <button 
                onClick={() => { setActiveTab('records'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'records' ? 'bg-medical-50 text-medical-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
                <ClipboardList className="w-5 h-5" /> Mon Dossier
            </button>
        </nav>

        <div className="p-4 border-t bg-slate-50/50">
            <div className="flex items-center gap-3 mb-4 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                <img src={patient.avatarUrl} alt="User" className="w-10 h-10 rounded-full border border-slate-100" />
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
                    <p className="text-xs text-slate-500 truncate">Patient</p>
                </div>
            </div>
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 py-3 rounded-xl transition-colors">
                <LogOut className="w-4 h-4" /> Déconnexion
            </button>
        </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Mobile Overlay */}
        {mobileMenuOpen && <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>}
        
        {renderSidebar()}

        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b p-4 flex justify-between items-center z-20">
                 <div className="flex items-center gap-2">
                    <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-lg text-slate-800">MediConnect</span>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                    <img src={patient.avatarUrl} className="w-full h-full object-cover" />
                 </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
                <div className="max-w-5xl mx-auto h-full">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'doctors' && renderDoctorsList()}
                    {activeTab === 'records' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Mon Dossier Médical</h1>
                            <p className="text-slate-500 mb-6">Consultez et mettez à jour vos informations de santé.</p>
                            <PatientCard patient={patient} onUpdate={onUpdatePatient} isDoctorView={false} />
                        </div>
                    )}
                </div>
            </main>
        </div>

        {/* Modal de sélection médecin URGENCE */}
        {showEmergencyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative border-4 border-red-500">
                    <div className="bg-red-600 p-6 text-white flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <Siren className="w-8 h-8 animate-pulse" />
                            SIGNALEMENT URGENCE
                        </h2>
                        <button onClick={() => setShowEmergencyModal(false)} className="hover:bg-red-700 p-2 rounded-lg">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6 bg-red-50">
                        <p className="text-red-800 font-bold mb-4 text-center">
                            Veuillez sélectionner le médecin à qui adresser cette alerte vitale.
                        </p>
                        
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-300" />
                            <input 
                                type="text" 
                                placeholder="Filtrer la liste..." 
                                className="w-full pl-9 pr-4 py-3 border border-red-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="max-h-[50vh] overflow-y-auto space-y-3 custom-scrollbar">
                            {filteredDoctors.map(doc => (
                                <div 
                                    key={doc.id}
                                    className="w-full bg-white p-4 rounded-xl border border-red-100 hover:border-red-500 hover:bg-red-50 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <img src={doc.avatarUrl} alt={doc.name} className="w-12 h-12 rounded-full border-2 border-red-100 group-hover:border-red-400" />
                                        <div>
                                            <p className="font-bold text-slate-800">{doc.name}</p>
                                            <p className="text-xs text-slate-500">{doc.specialty}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => triggerEmergencyWithDoctor(doc)}
                                        className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                                    >
                                        <AlertTriangle className="w-4 h-4" /> ALERTER
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};


import React, { useState } from 'react';
import { Patient, Doctor, AppointmentStatus } from '../types';
import { Calendar, Clock, Video, FileText, User, LogOut, Search, Stethoscope, Star, ChevronRight, CheckCircle, AlertTriangle, XCircle, BellRing, X, ArrowRight, Activity, AlertCircle as AlertCircleIcon, Phone } from 'lucide-react';

interface Props {
  patient: Patient;
  doctors: Doctor[];
  onLogout: () => void;
  onUpdatePatient: (patient: Patient) => void;
}

type Tab = 'dashboard' | 'doctors';

export const PatientPortal: React.FC<Props> = ({ patient, doctors, onLogout, onUpdatePatient }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleEmergency = () => {
      // Fonction toggle : Si déjà en urgence, on annule. Sinon on active.
      if (patient.isEmergency) {
        if (confirm("L'urgence est actuellement active. Voulez-vous ANNULER votre signalement ?")) {
             const updatedPatient: Patient = {
                ...patient,
                isEmergency: false
            };
            onUpdatePatient(updatedPatient);
        }
      } else {
        if (confirm("Êtes-vous sûr de vouloir signaler une URGENCE ? Cela alertera immédiatement les médecins disponibles.")) {
            const updatedPatient: Patient = {
                ...patient,
                isEmergency: true,
                appointmentStatus: 'pending' // Force l'apparition dans la liste d'attente
            };
            onUpdatePatient(updatedPatient);
        }
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
    if (confirm("Refuser ce créneau ? Vous devrez refaire une demande.")) {
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

        {/* SECTION NOUVELLE CONSULTATION / URGENCE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Carte Consultation Classique */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-medical-300 transition-all group cursor-pointer" onClick={() => setActiveTab('doctors')}>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-medical-50 text-medical-600 rounded-xl group-hover:bg-medical-600 group-hover:text-white transition-colors">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Prendre un rendez-vous</h3>
                        <p className="text-slate-500 text-sm">Consultation classique ou suivi</p>
                    </div>
                </div>
                <button className="w-full py-3 border-2 border-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    Voir les médecins <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* Carte URGENCE */}
            {patient.isEmergency ? (
                <div className="bg-red-50 p-6 rounded-2xl shadow-sm border-2 border-red-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Activity className="w-32 h-32 text-red-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <h3 className="text-xl font-bold text-red-700">URGENCE SIGNALÉE</h3>
                        </div>
                        <p className="text-red-600 font-medium mb-4 text-sm">
                            Votre alerte a été transmise prioritairement. Un médecin va vous contacter via la plateforme dans quelques instants.
                        </p>
                        <button 
                            onClick={handleEmergency}
                            className="w-full py-3 bg-white text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <XCircle className="w-5 h-5" /> Annuler l'alerte
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-red-300 hover:shadow-red-100 transition-all group cursor-pointer" onClick={handleEmergency}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Urgence Médicale</h3>
                            <p className="text-slate-500 text-sm">Besoin d'un avis immédiat</p>
                        </div>
                    </div>
                    <button className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors flex items-center justify-center gap-2">
                        <Activity className="w-5 h-5" /> SIGNALER UNE URGENCE
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
                     <button className="w-full py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                        Mettre à jour mon profil
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

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="bg-medical-600 p-2 rounded-lg">
             <User className="w-5 h-5 text-white" />
           </div>
           <span className="font-bold text-xl text-slate-800 hidden md:block">Espace Patient</span>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Tableau de bord
            </button>
            <button 
                onClick={() => setActiveTab('doctors')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'doctors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Praticiens
            </button>
        </div>

        <div className="flex items-center gap-4">
           {/* Note: Le bouton urgence a été déplacé dans le Dashboard principal comme demandé */}

           <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800">{patient.name}</p>
              <p className="text-xs text-slate-500">NSS: {patient.socialSecurityNumber || 'Non renseigné'}</p>
           </div>
           <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Déconnexion">
              <LogOut className="w-5 h-5" />
           </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
          {activeTab === 'dashboard' ? renderDashboard() : renderDoctorsList()}
      </main>
    </div>
  );
};

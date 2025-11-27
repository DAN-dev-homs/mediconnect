
import React, { useState } from 'react';
import { Patient, AppointmentStatus, Doctor } from '../types';
import { Calendar, Clock, Video, Users, Activity, Search, Filter, MoreVertical, FileText, X, CheckCircle, AlertCircle, Phone, Mail, LogOut, Trash2, Plus, BellRing, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { PatientCard } from './PatientCard';

interface Props {
  user: Doctor;
  patients: Patient[];
  onStartConsultation: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  onLogout: () => void;
}

type DashboardView = 'overview' | 'agenda' | 'patients';
type AgendaViewType = 'day' | 'week' | 'month';

export const Dashboard: React.FC<Props> = ({ user, patients, onStartConsultation, onUpdatePatient, onLogout }) => {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [currentAgendaView, setCurrentAgendaView] = useState<AgendaViewType>('day');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientForFile, setSelectedPatientForFile] = useState<Patient | null>(null);
  
  // States for Scheduling
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedDateForSchedule, setSelectedDateForSchedule] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedPatientIdForSchedule, setSelectedPatientIdForSchedule] = useState<string>('');
  
  // State for Agenda Navigation
  const [agendaDate, setAgendaDate] = useState<Date>(new Date());

  // Advanced Filtering
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.socialSecurityNumber && p.socialSecurityNumber.includes(searchTerm))
  );

  const emergencyPatients = patients.filter(p => p.isEmergency);

  const getStatusColor = (status?: AppointmentStatus) => {
      switch(status) {
          case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
          case 'proposed': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
          case 'completed': return 'bg-gray-100 text-gray-500 border-gray-200 decoration-slate-400';
          case 'cancelled': return 'bg-red-50 text-red-400 border-red-100';
          default: return 'bg-slate-50 text-slate-700 border-slate-200';
      }
  };

  const getStatusLabel = (status?: AppointmentStatus) => {
      switch(status) {
          case 'confirmed': return 'Confirmé';
          case 'proposed': return 'Proposition';
          case 'pending': return 'Demande';
          case 'completed': return 'Terminé';
          case 'cancelled': return 'Annulé';
          default: return 'Prévu';
      }
  }

  const handleScheduleClick = (time: string) => {
      setSelectedTimeSlot(time);
      // Par défaut on propose la date visualisée dans l'agenda
      setSelectedDateForSchedule(agendaDate.toISOString().split('T')[0]);
      setScheduleModalOpen(true);
      setSelectedPatientIdForSchedule('');
  };

  const handleProposeSchedule = () => {
      if (!selectedPatientIdForSchedule || !selectedTimeSlot || !selectedDateForSchedule) return;
      
      const patientToUpdate = patients.find(p => p.id === selectedPatientIdForSchedule);
      if (patientToUpdate) {
          // Si le patient est en urgence, on le confirme direct, sinon on propose
          const newStatus = patientToUpdate.isEmergency ? 'confirmed' : 'proposed';
          
          const updatedPatient = {
              ...patientToUpdate,
              nextAppointment: selectedTimeSlot,
              appointmentDate: selectedDateForSchedule,
              appointmentStatus: newStatus as AppointmentStatus,
              // Si on planifie une urgence, on peut considérer qu'elle est "prise en charge" (donc isEmergency false) 
              // ou on la laisse true jusqu'à la fin de la consult. Ici on la laisse pour visibilité.
          };
          onUpdatePatient(updatedPatient);
      }
      setScheduleModalOpen(false);
      setSelectedTimeSlot(null);
      setSelectedPatientIdForSchedule('');
  };

  const handleCancelAppointment = (patient: Patient) => {
      if (window.confirm(`Voulez-vous vraiment annuler le rendez-vous de ${patient.name} ?`)) {
          const updatedPatient = {
              ...patient,
              appointmentStatus: 'cancelled' as AppointmentStatus
          };
          onUpdatePatient(updatedPatient);
      }
  };

  const handleResolveEmergency = (patient: Patient) => {
      // Marquer l'urgence comme traitée
      const updatedPatient = {
          ...patient,
          isEmergency: false
      };
      onUpdatePatient(updatedPatient);
  }

  const handleStartEmergencyCall = (patient: Patient) => {
      // Démarrer l'appel et résoudre le flag d'urgence
      const updatedPatient = {
          ...patient,
          isEmergency: false
      };
      // On met à jour d'abord
      onUpdatePatient(updatedPatient);
      // Puis on lance la consultation
      onStartConsultation(updatedPatient);
  }

  const changeAgendaDate = (days: number) => {
      const newDate = new Date(agendaDate);
      newDate.setDate(newDate.getDate() + days);
      setAgendaDate(newDate);
  };

  const renderSidebar = () => (
    <div className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col h-full z-20 transition-all duration-300">
      <div className="p-4 md:p-6 flex items-center gap-3 justify-center md:justify-start">
        <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-medical-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-medical-200">
             <Activity className="w-6 h-6" />
        </div>
        <span className="font-bold text-xl text-slate-800 hidden md:block tracking-tight">MediConnect</span>
      </div>

      <nav className="flex-1 px-2 md:px-4 space-y-2 mt-8">
        {[
            { id: 'overview', icon: Activity, label: 'Tableau de bord' },
            { id: 'agenda', icon: Calendar, label: 'Agenda' },
            { id: 'patients', icon: Users, label: 'Patients' },
        ].map((item) => (
            <button 
                key={item.id}
                onClick={() => setCurrentView(item.id as DashboardView)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group relative
                    ${currentView === item.id 
                        ? 'bg-medical-50 text-medical-600 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
            >
                <item.icon className={`w-5 h-5 transition-colors ${currentView === item.id ? 'text-medical-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="hidden md:block">{item.label}</span>
                {currentView === item.id && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-medical-600 rounded-l-full"></div>}
            </button>
        ))}
      </nav>

      <div className="p-4 border-t bg-slate-50/50">
        <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
          <div className="relative">
            <img src={user.avatarUrl} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Doctor" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="hidden md:block overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.specialty}</p>
          </div>
        </div>
        <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors"
        >
            <LogOut className="w-3 h-3" /> <span className="hidden md:inline">Déconnexion</span>
        </button>
      </div>
    </div>
  );

  const renderOverview = () => {
    // Filtrer les RDV du jour
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = patients.filter(p => 
        p.appointmentStatus !== 'cancelled' && 
        p.appointmentStatus !== 'completed' && 
        p.nextAppointment &&
        (p.appointmentDate === todayStr || !p.appointmentDate) // Fallback si pas de date définie (ancien mock)
    );
    const pendingRequests = patients.filter(p => p.appointmentStatus === 'pending' && !p.isEmergency);
    
    return (
    <div className="space-y-8 animate-in fade-in duration-500 p-2">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tableau de Bord</h1>
            <p className="text-slate-500 mt-1">Bonjour {user.name}, voici le résumé de votre activité.</p>
          </div>
          <div className="bg-white px-5 py-2.5 rounded-full border shadow-sm text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-medical-500" />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </header>

        {/* ALERTE URGENCE */}
        {emergencyPatients.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 animate-pulse shadow-lg shadow-red-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-500 p-2 rounded-lg text-white">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-red-700">ALERTES URGENCE ({emergencyPatients.length})</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {emergencyPatients.map(patient => (
                        <div key={patient.id} className="bg-white p-4 rounded-xl border border-red-200 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={patient.avatarUrl} className="w-12 h-12 rounded-full border-2 border-red-500" />
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{patient.name}</h3>
                                    <p className="text-red-600 font-medium text-sm">Signalement immédiat</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleResolveEmergency(patient)}
                                    className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-bold"
                                >
                                    Traiter (Clore)
                                </button>
                                <button 
                                    onClick={() => handleStartEmergencyCall(patient)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold flex items-center gap-2 shadow-lg"
                                >
                                    <Video className="w-4 h-4" /> Appel d'urgence
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white border border-blue-100 text-blue-600 rounded-xl shadow-sm">
                    <Video className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">+2 RDV</span>
                </div>
                <h3 className="text-4xl font-bold text-slate-800">{todayAppointments.length}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Consultations aujourd'hui</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="absolute right-0 top-0 w-32 h-32 bg-orange-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white border border-orange-100 text-orange-600 rounded-xl shadow-sm">
                    <BellRing className="w-6 h-6" />
                </div>
                </div>
                <h3 className="text-4xl font-bold text-slate-800">{pendingRequests.length}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Demandes en attente</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="absolute right-0 top-0 w-32 h-32 bg-purple-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white border border-purple-100 text-purple-600 rounded-xl shadow-sm">
                    <Users className="w-6 h-6" />
                </div>
                </div>
                <h3 className="text-4xl font-bold text-slate-800">{patients.length}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Dossiers patients actifs</p>
            </div>
          </div>
        </div>

        {/* Demandes en attente */}
        {pendingRequests.length > 0 && (
             <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-orange-100 bg-orange-50/30 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <BellRing className="w-5 h-5 text-orange-500" /> Demandes de rendez-vous
                    </h2>
                </div>
                <div className="p-4 space-y-3">
                    {pendingRequests.map(patient => (
                        <div key={patient.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all">
                            <div className="flex items-center gap-3">
                                <img src={patient.avatarUrl} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-bold text-slate-800">{patient.name}</p>
                                    <p className="text-xs text-slate-500">Souhaite consulter</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setCurrentView('agenda');
                                    setScheduleModalOpen(true);
                                    setSelectedPatientIdForSchedule(patient.id);
                                }}
                                className="px-4 py-2 bg-orange-100 text-orange-700 font-bold text-sm rounded-lg hover:bg-orange-200 transition-colors"
                            >
                                Proposer un créneau
                            </button>
                        </div>
                    ))}
                </div>
             </div>
        )}

        {/* Upcoming List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-medical-600" /> Consultations du jour
            </h2>
            <button onClick={() => setCurrentView('agenda')} className="text-sm text-medical-600 font-bold hover:text-medical-700 transition-colors">
                Voir l'agenda complet &rarr;
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {todayAppointments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Aucune consultation confirmée aujourd'hui.</div>
            ) : (
                todayAppointments.slice(0, 3).map((patient) => (
                <div key={patient.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                    <div className="relative">
                        <img src={patient.avatarUrl} alt={patient.name} className="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-white" />
                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${patient.appointmentStatus === 'confirmed' ? 'bg-green-500' : 'bg-blue-400'}`}></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">{patient.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium text-slate-600">{patient.age} ans</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {patient.history[0] || 'Général'}</span>
                        </div>
                    </div>
                    </div>
                    <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                        <p className="text-2xl font-bold text-slate-800 leading-none">{patient.nextAppointment}</p>
                        <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mt-1 inline-block ${getStatusColor(patient.appointmentStatus)}`}>
                            {getStatusLabel(patient.appointmentStatus)}
                        </span>
                    </div>
                    <button 
                        onClick={() => onStartConsultation(patient)}
                        className="h-12 w-12 rounded-full bg-medical-600 text-white flex items-center justify-center hover:bg-medical-700 hover:scale-105 transition-all shadow-lg shadow-medical-200"
                        title="Démarrer la consultation"
                        disabled={patient.appointmentStatus !== 'confirmed'}
                    >
                        <Video className="w-6 h-6" />
                    </button>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
    </div>
    );
  };

  const renderAgenda = () => {
    const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8:00 to 18:00
    const agendaDateStr = agendaDate.toISOString().split('T')[0];

    return (
      <div className="animate-in fade-in duration-300 h-full flex flex-col p-2">
        <header className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Agenda</h1>
                <p className="text-slate-500">Gérez vos rendez-vous et disponibilités.</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-white rounded-xl shadow-sm border p-1">
                    <button onClick={() => changeAgendaDate(-1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-4 font-bold text-slate-700 min-w-[140px] text-center">
                        {agendaDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <button onClick={() => changeAgendaDate(1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex bg-white p-1 rounded-xl border shadow-sm">
                    <button 
                        onClick={() => setCurrentAgendaView('day')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentAgendaView === 'day' ? 'bg-medical-50 text-medical-700 shadow-sm font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                        Jour
                    </button>
                    <button 
                        onClick={() => setCurrentAgendaView('week')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentAgendaView === 'week' ? 'bg-medical-50 text-medical-700 shadow-sm font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                        Semaine
                    </button>
                </div>
            </div>
        </header>
        
        <div className="bg-white rounded-2xl border shadow-sm flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            <div className="sticky top-0 bg-slate-50 border-b z-10 grid grid-cols-[80px_1fr] divide-x">
                <div className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Heure</div>
                <div className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Planning du {agendaDate.toLocaleDateString()}</div>
            </div>
            
            <div className="divide-y divide-slate-100">
                {hours.map(hour => {
                    const timeString = `${hour < 10 ? '0' + hour : hour}:00`;
                    // Filtrer les RDV pour l'heure ET la date sélectionnée
                    const appointments = patients.filter(p => 
                        p.nextAppointment && 
                        parseInt(p.nextAppointment.split(':')[0]) === hour && 
                        p.appointmentStatus !== 'cancelled' &&
                        (p.appointmentDate === agendaDateStr || (!p.appointmentDate && agendaDateStr === new Date().toISOString().split('T')[0]))
                    );

                    return (
                        <div key={hour} className="grid grid-cols-[80px_1fr] min-h-[120px] group hover:bg-slate-50/50 transition-colors">
                            <div className="p-4 text-sm font-medium text-slate-500 text-right border-r relative">
                                <span className="-mt-3 block">{timeString}</span>
                            </div>
                            <div className="p-2 relative">
                                {/* Ligne de repère pointillée pour la demi-heure */}
                                <div className="absolute top-1/2 left-0 w-full h-px border-t border-dashed border-slate-200 z-0 pointer-events-none"></div>
                                
                                {appointments.length > 0 ? (
                                    appointments.map(patient => (
                                        <div 
                                            key={patient.id} 
                                            className={`relative z-10 mb-2 p-3 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md flex justify-between items-center
                                                ${getStatusColor(patient.appointmentStatus)} bg-opacity-10 bg-white border-l-[inherit]
                                            `}
                                        >
                                            <div className="flex gap-4 items-center">
                                                <img src={patient.avatarUrl} className="w-10 h-10 rounded-full bg-white p-0.5 shadow-sm" alt="Avatar" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-800">{patient.name}</p>
                                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getStatusColor(patient.appointmentStatus)}`}>
                                                            {getStatusLabel(patient.appointmentStatus)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <Clock className="w-3 h-3" /> {patient.nextAppointment} 
                                                        {patient.appointmentDate && patient.appointmentDate !== new Date().toISOString().split('T')[0] && (
                                                           <span className="ml-1">({new Date(patient.appointmentDate).toLocaleDateString()})</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => setSelectedPatientForFile(patient)}
                                                    className="p-2 text-slate-400 hover:text-medical-600 hover:bg-medical-50 rounded-lg transition-colors"
                                                    title="Voir Dossier"
                                                >
                                                    <FileText className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleCancelAppointment(patient)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Annuler RDV"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                {patient.appointmentStatus !== 'completed' && (
                                                    <button 
                                                        onClick={() => onStartConsultation(patient)}
                                                        className="px-4 py-2 bg-medical-600 text-white text-sm font-bold rounded-lg hover:bg-medical-700 shadow-md shadow-medical-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={patient.appointmentStatus !== 'confirmed' && !patient.isEmergency}
                                                    >
                                                        <Video className="w-4 h-4" /> Lancer
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleScheduleClick(timeString)}
                                            className="flex items-center gap-2 text-slate-400 hover:text-medical-600 px-4 py-2 rounded-lg border border-dashed border-slate-300 hover:border-medical-300 hover:bg-medical-50 transition-all"
                                        >
                                            <Plus className="w-5 h-5" /> Proposer un rendez-vous
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
    );
  };

  const renderPatients = () => (
    <div className="animate-in fade-in duration-300 h-full flex flex-col p-2">
        <header className="mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Base Patients</h1>
                <p className="text-slate-500 mt-1">{patients.length} dossiers patients actifs enregistrés.</p>
            </div>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                <Users className="w-4 h-4" /> Nouveau Dossier
            </button>
        </header>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex gap-4 items-center">
            <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Rechercher par nom, n° sécu ou pathologie..." 
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <button className="px-4 py-2 rounded-lg flex items-center gap-2 text-slate-600 hover:bg-slate-50 font-medium">
                <Filter className="w-4 h-4" /> Filtres avancés
            </button>
        </div>

        {/* Patient List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 overflow-y-auto pb-4 custom-scrollbar">
            {filteredPatients.map(patient => (
                <div key={patient.id} className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all group flex flex-col ${patient.isEmergency ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200 hover:border-medical-300'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                            <img src={patient.avatarUrl} className="w-14 h-14 rounded-full object-cover bg-slate-100 border border-slate-100" />
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    {patient.name}
                                    {patient.isEmergency && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">URGENCE</span>}
                                </h3>
                                <div className="flex flex-col text-xs text-slate-500 mt-1 space-y-0.5">
                                    <span>{patient.age} ans • {patient.gender === 'M' ? 'Homme' : 'Femme'}</p>
                                    {patient.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone}</span>}
                                </div>
                            </div>
                        </div>
                        <button className="text-slate-300 hover:text-slate-600 transition-colors p-1">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="space-y-3 mb-6 flex-1">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-slate-50 p-2 rounded-lg">
                                <span className="block text-xs text-slate-400 uppercase font-bold">Groupe</span>
                                <span className="font-bold text-slate-700">{patient.bloodType || '-'}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg">
                                <span className="block text-xs text-slate-400 uppercase font-bold">Poids</span>
                                <span className="font-bold text-slate-700">{patient.weight || '-'}</span>
                            </div>
                        </div>
                        
                        <div className="pt-1">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Pathologies / Antécédents</p>
                             <div className="flex flex-wrap gap-1.5">
                                {patient.history.length > 0 ? patient.history.slice(0, 3).map((h, i) => (
                                    <span key={i} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md font-medium">{h}</span>
                                )) : <span className="text-xs text-slate-400 italic">Aucun antécédent noté</span>}
                                {patient.history.length > 3 && <span className="text-xs text-slate-400 px-1 pt-1">+{patient.history.length - 3}</span>}
                             </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex gap-3">
                        <button 
                            onClick={() => setSelectedPatientForFile(patient)}
                            className="flex-1 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                        >
                            <FileText className="w-4 h-4" /> Dossier
                        </button>
                        <button 
                            onClick={() => onStartConsultation(patient)}
                            className={`px-4 py-2.5 border rounded-xl hover:shadow-lg transition-all ${patient.isEmergency ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' : 'bg-medical-50 text-medical-600 border-medical-100 hover:bg-medical-600 hover:text-white'}`}
                            title="Lancer consultation vidéo"
                        >
                            <Video className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {renderSidebar()}

      {/* Main Content Area */}
      <div className="flex-1 md:ml-0 p-4 md:p-8 h-screen overflow-hidden flex flex-col bg-gray-50">
        {currentView === 'overview' && renderOverview()}
        {currentView === 'agenda' && renderAgenda()}
        {currentView === 'patients' && renderPatients()}
      </div>

      {/* Modal for Patient File / QR */}
      {selectedPatientForFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
                  <button 
                    onClick={() => setSelectedPatientForFile(null)}
                    className="absolute top-4 right-4 z-10 bg-black/5 hover:bg-black/10 p-2 rounded-full text-slate-600 transition-colors"
                  >
                      <X className="w-5 h-5" />
                  </button>
                  <PatientCard 
                    patient={selectedPatientForFile} 
                    onUpdate={(updated) => {
                        onUpdatePatient(updated);
                        setSelectedPatientForFile(updated);
                    }}
                    isDoctorView={true}
                  />
              </div>
          </div>
      )}

      {/* Modal for Scheduling */}
      {scheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-medical-600" />
                          Proposer un RDV
                      </h3>
                      <button onClick={() => setScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="mb-6 space-y-4">
                      {/* Date Picker */}
                      <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Date du rendez-vous</label>
                           <input 
                                type="date"
                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-medical-500"
                                value={selectedDateForSchedule}
                                onChange={(e) => setSelectedDateForSchedule(e.target.value)}
                           />
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                          <Clock className="w-5 h-5 text-slate-500" />
                          <div className="flex-1">
                              <label className="text-xs font-bold text-slate-400 uppercase block">Heure proposée</label>
                              <input 
                                type="time"
                                className="w-full bg-transparent text-lg font-bold text-slate-800 outline-none border-b border-transparent focus:border-medical-500 transition-colors p-0"
                                value={selectedTimeSlot || ''}
                                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                required
                              />
                          </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Sélectionner un patient</label>
                        <div className="relative">
                            <select 
                                className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-medical-500 appearance-none"
                                value={selectedPatientIdForSchedule}
                                onChange={(e) => setSelectedPatientIdForSchedule(e.target.value)}
                            >
                                <option value="">-- Choisir un patient --</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.age} ans) 
                                        {p.appointmentStatus === 'pending' ? ' - DEMANDE EN ATTENTE' : ''}
                                    </option>
                                ))}
                            </select>
                            <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                  </div>
                  
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setScheduleModalOpen(false)}
                        className="flex-1 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium"
                      >
                          Annuler
                      </button>
                      <button 
                        onClick={handleProposeSchedule}
                        disabled={!selectedPatientIdForSchedule || !selectedDateForSchedule}
                        className="flex-1 py-3 bg-medical-600 text-white rounded-xl font-bold hover:bg-medical-700 shadow-lg shadow-medical-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                          Proposer
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

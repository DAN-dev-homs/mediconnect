
import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { VideoRoom } from './components/VideoRoom';
import { Auth } from './components/Auth';
import { PatientPortal } from './components/PatientPortal';
import { Patient, ViewState, UserRole, Doctor, User } from './types';

const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'doc1',
    role: UserRole.DOCTOR,
    name: 'Dr. Jean Moreau',
    email: 'moreau@mediconnect.fr',
    specialty: 'Cardiologue',
    matricule: 'RPPS-10001',
    avatarUrl: 'https://ui-avatars.com/api/?name=Jean+Moreau&background=0D8ABC&color=fff'
  },
  {
    id: 'doc2',
    role: UserRole.DOCTOR,
    name: 'Dr. Sarah Connor',
    email: 's.connor@mediconnect.fr',
    specialty: 'Médecine Générale',
    matricule: 'RPPS-10002',
    avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Connor&background=e11d48&color=fff'
  },
  {
    id: 'doc3',
    role: UserRole.DOCTOR,
    name: 'Dr. Gregory House',
    email: 'house@mediconnect.fr',
    specialty: 'Diagnosticien',
    matricule: 'RPPS-10003',
    avatarUrl: 'https://ui-avatars.com/api/?name=Gregory+House&background=4f46e5&color=fff'
  },
  {
    id: 'doc4',
    role: UserRole.DOCTOR,
    name: 'Dr. Meredith Grey',
    email: 'grey@mediconnect.fr',
    specialty: 'Chirurgie Générale',
    matricule: 'RPPS-10004',
    avatarUrl: 'https://ui-avatars.com/api/?name=Meredith+Grey&background=059669&color=fff'
  }
];

const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    age: 45,
    gender: 'M',
    history: ['Hypertension', 'Diabète Type 2'],
    avatarUrl: 'https://picsum.photos/id/64/200/200',
    nextAppointment: '09:00',
    appointmentStatus: 'completed',
    weight: '82kg',
    height: '180cm',
    temperature: '37.2°C',
    bloodPressure: '14/9',
    heartRate: '72 bpm',
    respiratoryRate: '16 rpm',
    allergies: ['Pénicilline'],
    lastVisit: '12 Mars 2024',
    socialSecurityNumber: '1 79 05 75 123 456 78',
    email: 'j.dupont@email.com',
    phone: '06 12 34 56 78',
    doctorId: 'doc1',
    doctorName: 'Dr. Jean Moreau',
    doctorSpecialty: 'Cardiologue'
  },
  {
    id: '2',
    name: 'Sophie Martin',
    age: 32,
    gender: 'F',
    history: ['Asthme', 'Allergies saisonnières'],
    avatarUrl: 'https://picsum.photos/id/65/200/200',
    nextAppointment: '10:00',
    appointmentStatus: 'confirmed',
    weight: '60kg',
    height: '165cm',
    temperature: '36.8°C',
    bloodPressure: '11/7',
    heartRate: '65 bpm',
    respiratoryRate: '14 rpm',
    allergies: [],
    lastVisit: '10 Juin 2024',
    socialSecurityNumber: '2 92 07 92 123 456 78',
    email: 'smartin@test.com',
    phone: '07 98 76 54 32',
    doctorId: 'doc1',
    doctorName: 'Dr. Jean Moreau',
    doctorSpecialty: 'Cardiologue'
  },
  {
    id: '3',
    name: 'Pierre Durand',
    age: 68,
    gender: 'M',
    history: ['Arthrite', 'Cholestérol'],
    avatarUrl: 'https://picsum.photos/id/66/200/200',
    nextAppointment: '14:00',
    appointmentStatus: 'proposed', // Cas proposé par le médecin
    weight: '75kg',
    height: '172cm',
    temperature: '37.0°C',
    bloodPressure: '13/8',
    heartRate: '80 bpm',
    respiratoryRate: '18 rpm',
    allergies: ['Arachides', 'Sulfamides'],
    lastVisit: '05 Septembre 2024',
    socialSecurityNumber: '1 56 01 13 123 456 78',
    email: 'p.durand@provider.fr',
    phone: '01 23 45 67 89'
  },
  {
    id: '4',
    name: 'Marie Curie',
    age: 55,
    gender: 'F',
    history: ['Migraines Chroniques'],
    avatarUrl: 'https://picsum.photos/id/68/200/200',
    appointmentStatus: 'pending', // Cas demande simple
    weight: '58kg',
    height: '162cm',
    temperature: '37.5°C',
    bloodPressure: '12/8',
    heartRate: '70 bpm',
    respiratoryRate: '15 rpm',
    allergies: ['Latex'],
    lastVisit: '01 Janvier 2024',
    socialSecurityNumber: '2 69 11 75 123 000 11',
    email: 'm.curie@science.org',
    phone: '06 00 00 00 00'
  },
  {
    id: '5',
    name: 'Lucas Bernard',
    age: 24,
    gender: 'M',
    history: ['Fracture Tibia'],
    avatarUrl: 'https://picsum.photos/id/75/200/200',
    appointmentStatus: 'pending',
    isEmergency: true, // Cas URGENCE
    weight: '70kg',
    height: '175cm',
    temperature: '38.2°C',
    bloodPressure: '15/10',
    heartRate: '110 bpm',
    respiratoryRate: '22 rpm',
    allergies: [],
    lastVisit: 'Hier',
    socialSecurityNumber: '1 99 12 75 000 111 22',
    email: 'lucas.b@test.com',
    phone: '06 99 88 77 66'
  }
];

export default function App() {
  const [user, setUser] = useState<User | Doctor | Patient | null>(null);
  const [view, setView] = useState<ViewState>('auth');
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

  const handleLogin = (loggedInUser: Doctor | Patient) => {
      // Si c'est un patient qui se connecte pour la première fois via Auth.tsx, on l'ajoute à la liste s'il n'existe pas
      if (loggedInUser.role === UserRole.PATIENT) {
        setPatients(prev => {
            const existing = prev.find(p => p.email === loggedInUser.email);
            if (!existing) {
                return [...prev, loggedInUser as Patient];
            } else {
                // Mettre à jour l'utilisateur connecté avec les données les plus récentes
                // (ex: statuts de RDV)
                return prev; 
            }
        });
        
        // Trouver le patient à jour dans la liste pour l'user courant
        const currentData = patients.find(p => p.email === loggedInUser.email) || loggedInUser;
        setUser(currentData);
        setView('patient-portal');
      } else {
        setUser(loggedInUser);
        setView('dashboard');
      }
  };

  const handleLogout = () => {
      setUser(null);
      setView('auth');
      setCurrentPatient(null);
  }

  const startConsultation = (patient: Patient) => {
    // Update status to confirmed if it was pending
    const updatedPatient = { 
        ...patient, 
        appointmentStatus: 'confirmed' as const,
        isEmergency: false // Clear emergency flag on start
    };
    handleUpdatePatient(updatedPatient);
    setCurrentPatient(updatedPatient);
    setView('consultation');
  };

  const endConsultation = () => {
    if (currentPatient) {
       // Mark as completed
       const updatedPatient = { ...currentPatient, appointmentStatus: 'completed' as const, lastVisit: new Date().toLocaleDateString('fr-FR') };
       handleUpdatePatient(updatedPatient);
    }
    setCurrentPatient(null);
    setView('dashboard');
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prevPatients => 
      prevPatients.map(p => p.id === updatedPatient.id ? updatedPatient : p)
    );
    // Sync current patient if active in consultation
    if (currentPatient && currentPatient.id === updatedPatient.id) {
        setCurrentPatient(updatedPatient);
    }
    // Sync authenticated user if it is the patient
    if (user && user.role === UserRole.PATIENT && user.id === updatedPatient.id) {
        setUser(updatedPatient);
    }
  };

  if (view === 'auth') {
      return <Auth onLogin={handleLogin} />;
  }

  if (view === 'patient-portal' && user && user.role === UserRole.PATIENT) {
      // On s'assure de passer le patient le plus à jour depuis l'état global
      const patientData = patients.find(p => p.id === user.id) || (user as Patient);
      
      return (
        <PatientPortal 
            patient={patientData} 
            doctors={MOCK_DOCTORS} 
            onLogout={handleLogout} 
            onUpdatePatient={handleUpdatePatient}
        />
      );
  }

  return (
    <div className="font-sans text-slate-800 h-screen overflow-hidden bg-gray-50">
      {view === 'dashboard' && user && user.role === UserRole.DOCTOR ? (
        <Dashboard 
          user={user as Doctor}
          patients={patients} 
          onStartConsultation={startConsultation} 
          onUpdatePatient={handleUpdatePatient}
          onLogout={handleLogout}
        />
      ) : (
        currentPatient && (
          <VideoRoom 
            patient={currentPatient} 
            onEndCall={endConsultation} 
            onUpdatePatient={handleUpdatePatient}
          />
        )
      )}
    </div>
  );
}

export enum UserRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT'
}

export type AppointmentStatus = 'pending' | 'proposed' | 'confirmed' | 'completed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Doctor extends User {
  role: UserRole.DOCTOR;
  specialty: string;
  matricule: string; // Numéro RPPS/License
}

export interface LabTest {
  id: string;
  name: string;
  reason: string;
}

export interface LabOrder {
  id: string;
  date: string; // ISO String
  doctorName: string;
  tests: LabTest[];
}

export interface Patient extends Omit<User, 'role'> {
  // role est optionnel ici car on utilise Patient pour l'affichage dans le dashboard aussi
  role?: UserRole.PATIENT; 
  age: number;
  gender: string;
  history: string[];
  nextAppointment?: string; // Format HH:MM
  appointmentDate?: string; // Format YYYY-MM-DD
  appointmentStatus?: AppointmentStatus;
  
  // Constantes Vitales
  weight?: string;
  height?: string;
  temperature?: string;     // T°
  bloodPressure?: string;   // TA (Tension Artérielle)
  heartRate?: string;       // FC (Fréquence Cardiaque)
  respiratoryRate?: string; // FR (Fréquence Respiratoire)

  allergies?: string[];
  lastVisit?: string;
  socialSecurityNumber?: string;
  notes?: string;
  phone?: string;
  // Nouveaux champs pour le choix du médecin
  doctorId?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  // Indicateur d'urgence
  isEmergency?: boolean;
  // Modifications en attente de validation par le patient
  pendingUpdates?: Partial<Patient>;
  
  // Documents médicaux
  labOrders?: LabOrder[];
  prescriptions?: Prescription[]; 
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

export interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  date: Date;
  items: PrescriptionItem[];
  notes: string;
}

export type ViewState = 'auth' | 'dashboard' | 'consultation' | 'patient-portal';

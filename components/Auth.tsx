import React, { useState } from 'react';
import { UserRole, Doctor, Patient } from '../types';
import { Stethoscope, User, Lock, Mail, FileBadge, Hash, Activity, ArrowRight, CheckCircle } from 'lucide-react';

interface Props {
  onLogin: (user: Doctor | Patient) => void;
}

export const Auth: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.DOCTOR);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Doctor Specific
  const [specialty, setSpecialty] = useState('');
  const [matricule, setMatricule] = useState('');
  
  // Patient Specific
  const [ssn, setSsn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulation d'authentification
    if (role === UserRole.DOCTOR) {
      const doctor: Doctor = {
        id: Math.random().toString(),
        role: UserRole.DOCTOR,
        email,
        name: name || "Dr. " + email.split('@')[0],
        specialty: specialty || "Médecine Générale",
        matricule: matricule || "UNKNOWN",
        avatarUrl: `https://ui-avatars.com/api/?name=${name || email}&background=0D8ABC&color=fff`
      };
      onLogin(doctor);
    } else {
      const patient: Patient = {
        id: Math.random().toString(),
        role: UserRole.PATIENT,
        email,
        name: name || "Patient",
        age: 30, // Default for new auth
        gender: 'M',
        history: [],
        avatarUrl: `https://ui-avatars.com/api/?name=${name || email}&background=random`,
        socialSecurityNumber: ssn
      };
      onLogin(patient);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Branding */}
        <div className="md:w-5/12 bg-medical-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/30 rounded-full -ml-10 -mb-10 blur-2xl"></div>
           
           <div className="relative z-10">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 border border-white/30">
                <Activity className="w-8 h-8 text-white" />
             </div>
             <h1 className="text-4xl font-bold mb-4">MediConnect AI</h1>
             <p className="text-medical-100 text-lg leading-relaxed">
               La plateforme de téléconsultation nouvelle génération assistée par intelligence artificielle.
             </p>
           </div>

           <div className="space-y-4 relative z-10 mt-12">
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                 <CheckCircle className="w-5 h-5 text-green-300" />
                 <span className="text-sm font-medium">Consultations HD Sécurisées</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                 <CheckCircle className="w-5 h-5 text-green-300" />
                 <span className="text-sm font-medium">Ordonnances Numériques & QR</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                 <CheckCircle className="w-5 h-5 text-green-300" />
                 <span className="text-sm font-medium">Assistant IA en temps réel</span>
              </div>
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-7/12 p-8 md:p-12 bg-white">
          <div className="flex justify-end mb-8">
             <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                <button 
                  onClick={() => setIsLogin(true)}
                  className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Connexion
                </button>
                <button 
                  onClick={() => setIsLogin(false)}
                  className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${!isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Inscription
                </button>
             </div>
          </div>

          <div className="mb-8 text-center">
             <h2 className="text-2xl font-bold text-slate-800 mb-2">{isLogin ? 'Bon retour parmi nous' : 'Créer votre compte'}</h2>
             <p className="text-slate-500">Accédez à votre espace sécurisé</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
             <button 
               onClick={() => setRole(UserRole.DOCTOR)}
               className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${role === UserRole.DOCTOR ? 'border-medical-500 bg-medical-50 text-medical-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
             >
                <Stethoscope className={`w-8 h-8 ${role === UserRole.DOCTOR ? 'text-medical-600' : 'text-slate-400'}`} />
                <span className="font-bold text-sm">Praticien</span>
             </button>
             <button 
               onClick={() => setRole(UserRole.PATIENT)}
               className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${role === UserRole.PATIENT ? 'border-medical-500 bg-medical-50 text-medical-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
             >
                <User className={`w-8 h-8 ${role === UserRole.PATIENT ? 'text-medical-600' : 'text-slate-400'}`} />
                <span className="font-bold text-sm">Patient</span>
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             {!isLogin && (
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Nom complet" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                </div>
             )}

             <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="Adresse email professionnel" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
             </div>

             <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="Mot de passe" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
             </div>

             {/* Doctor Specific Fields */}
             {!isLogin && role === UserRole.DOCTOR && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 fade-in">
                   <div className="relative">
                        <FileBadge className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 outline-none transition-all appearance-none text-slate-600"
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            required
                        >
                            <option value="">Spécialité...</option>
                            <option value="Généraliste">Généraliste</option>
                            <option value="Cardiologue">Cardiologue</option>
                            <option value="Dermatologue">Dermatologue</option>
                            <option value="Pédiatre">Pédiatre</option>
                            <option value="Psychiatre">Psychiatre</option>
                        </select>
                   </div>
                   <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Matricule RPPS" 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                            value={matricule}
                            onChange={(e) => setMatricule(e.target.value)}
                            required
                        />
                   </div>
                </div>
             )}

            {/* Patient Specific Fields */}
            {!isLogin && role === UserRole.PATIENT && (
                <div className="animate-in slide-in-from-top-4 fade-in">
                   <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Numéro de Sécurité Sociale" 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                            value={ssn}
                            onChange={(e) => setSsn(e.target.value)}
                            required
                        />
                   </div>
                </div>
             )}

             <button type="submit" className="w-full bg-medical-600 text-white font-bold py-3.5 rounded-xl hover:bg-medical-700 shadow-lg shadow-medical-200 transition-all flex items-center justify-center gap-2 mt-4">
                {isLogin ? 'Se connecter' : "S'inscrire"} <ArrowRight className="w-5 h-5" />
             </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            <p>En continuant, vous acceptez nos Conditions Générales d'Utilisation et notre Politique de Confidentialité Médicale.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
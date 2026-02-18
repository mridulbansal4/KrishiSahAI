import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Chatbot from './pages/Chatbot';
import BusinessAdvisory from './pages/BusinessAdvisory';
import CropCare from './pages/CropCare';
import WasteToValue from './pages/WasteToValue';
import KnowledgeHub from './pages/KnowledgeHub';
import BusinessDetail from './pages/BusinessDetail';
import Roadmap from './pages/Roadmap';
import NewsPage from './pages/NewsPage';
import EditProfile from './pages/EditProfile';
import ArticleDetail from './pages/ArticleDetail';
import { Leaf } from 'lucide-react';
import { Language, UserProfile } from './types';
<<<<<<< HEAD
import { auth, db, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from './firebase';
import { onSnapshot, doc, setDoc } from 'firebase/firestore';
import { RefreshCw, LogOut, Settings } from 'lucide-react';
import { api } from './services/api';
=======
import { translations } from './translations';
import { auth, db } from './src/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

import { onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { RefreshCw, Sun, Moon, User, LogOut, Settings } from 'lucide-react';
import { api } from './src/services/api';
>>>>>>> 655364a (i have add notification servie)
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import logo from './src/assets/logo.png';
<<<<<<< HEAD
import WeatherModal from './components/WeatherModal';
=======
import NotificationBell from './components/NotificationBell';
>>>>>>> 655364a (i have add notification servie)

const getBestLocation = (u: UserProfile | null) => {
  if (!u) return "";
  if (u.district && u.state) return `${u.district}, ${u.state}`;
  return u.district || u.state || "India";
};

const getDisplayLocation = (u: UserProfile | null) => {
  if (!u) return "";
  return u.district || u.state || "India";
};

const Header: React.FC<{
  toggleNotifications: () => void;
  toggleWeather: () => void;
  user: UserProfile | null;
  logout: () => void;
  weatherData?: any;
  weatherLoading?: boolean;
  refreshWeather: () => void;
}> = ({ toggleNotifications, toggleWeather, user, logout, weatherData, weatherLoading, refreshWeather }) => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: t.navHome, path: '/' },
    { label: t.navAdvisory, path: '/advisory' },
    { label: t.navAskAI, path: '/chat' },
    { label: t.navNews, path: '/news' },
    { label: t.navKnowledge, path: '/hub' },
  ];

  const getWeatherDisplay = () => {
    if (weatherLoading) return "...";
    if (!weatherData) return "N/A";
    return `${weatherData.temperature}°C`;
  };

  return (
    <header className="sticky top-5 z-50 mx-4 md:mx-8">
      <div className="max-w-7xl mx-auto bg-[#EAD8BD] rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-[#D4C5A9] px-4 md:px-8">
        <div className="flex items-center justify-between h-[73px]">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 overflow-hidden p-1">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold text-[#3A2E25]">
              {t.brandName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${location.pathname === item.path ? 'text-[#3A2E25] font-bold bg-[#E8F5F5]' : 'text-[#6B7878] hover:text-[#3A2E25] hover:bg-[#FAFCFC]'}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

<<<<<<< HEAD
          {/* Right Side */}
          <div className="flex items-center gap-4">
            {user && (
              <div className={`flex items-center gap-1 bg-[#FAFAF7] border border-[#E6E6E6] rounded-full px-1 py-0.5 transition-all group ${weatherLoading ? 'opacity-80' : ''}`}>
=======
          {user && <NotificationBell />}

          <div className="flex bg-[#FAFAF7] border border-[#E6E6E6] rounded-xl p-1 gap-1">
            {[{ code: 'EN', label: 'ENG' }, { code: 'HI', label: 'हिंदी' }, { code: 'MR', label: 'मराठी' }].map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code as Language)}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all ${lang === l.code ? 'bg-[#043744] text-white shadow-md' : 'text-stone-400 hover:text-[#043744]'} ${l.code !== 'EN' ? 'devanagari' : ''}`}
              >
                {l.label}
              </button>
            ))}
          </div>



          {user && (
            <div className="relative group">
              <button className="flex items-center gap-2 bg-[#FAFAF7] border border-[#E6E6E6] px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#043744] flex items-center justify-center text-white font-bold text-sm">
                  {user.name && user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-[#1E1E1E] leading-tight">{user.name}</p>
                  <p className="text-[10px] text-[#555555] capitalize">{user.occupation}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E6E6E6] rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link to="/profile/edit" className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-[#555555] hover:bg-[#FAFAF7] hover:text-[#043744] transition-colors">
                  <Settings size={16} /> Edit Profile
                </Link>
                <div className="h-px bg-[#E6E6E6]"></div>
>>>>>>> 655364a (i have add notification servie)
                <button
                  onClick={toggleWeather}
                  className="flex items-center gap-2 px-3 py-1.5 bg-transparent rounded-full text-[13px] font-bold text-[#3A2E25] hover:bg-[#E8F5E9] transition-all"
                  title="View Weather Details"
                >
                  <span className="group-hover:scale-110 transition-transform">☁</span>
                  <span className="line-clamp-1 max-w-[150px]">{getDisplayLocation(user)}: {getWeatherDisplay()}</span>
                </button>
                <button
                  onClick={refreshWeather}
                  className={`p-1.5 rounded-full hover:bg-[#E8F5E9] text-[#3A2E25] transition-all ${weatherLoading ? 'animate-spin' : 'hover:scale-110'}`}
                  title="Refresh Weather"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            )}

            {/* Language Switcher */}
            <div className="hidden sm:flex bg-[#FAFAF7] border border-[#E6E6E6] rounded-xl p-1 gap-1">
              {[{ code: 'EN', label: 'EN' }, { code: 'HI', label: 'HI' }, { code: 'MR', label: 'MR' }].map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code as Language)}
                  className={`px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all ${language === l.code ? 'bg-[#3A2E25] text-white shadow-md' : 'text-stone-400 hover:text-[#3A2E25]'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 bg-[#FAFAF7] border border-[#E6E6E6] px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#3A2E25] flex items-center justify-center text-white font-bold text-sm">
                    {user.name && user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-[#1E1E1E] leading-tight">{user.name}</p>
                    <p className="text-[10px] text-[#555555] capitalize">{user.occupation}</p>
                  </div>
                </button>

                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E6E6E6] rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link to="/profile/edit" className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-[#555555] hover:bg-[#FAFAF7] hover:text-[#3A2E25] transition-colors">
                    <Settings size={16} /> Edit Profile
                  </Link>
                  <div className="h-px bg-[#E6E6E6]"></div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} /> {t.logout}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-[#3A2E25] hover:text-[#8B5E3C]">
                  {t.login}
                </Link>
                <Link to="/signup" className="px-5 py-2.5 bg-[#3A2E25] text-white rounded-xl text-sm font-bold hover:bg-[#2C221C] transition-all shadow-md hover:shadow-lg">
                  {t.signup}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const LoginFlow: React.FC<{ onLogin: (e: string, p: string) => void; onSwitch: () => void }> = ({ onLogin, onSwitch }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section - Login Form (Light Section) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 order-2 md:order-1">
        <div className="w-full max-w-[480px] bg-white rounded-[20px] shadow-sm p-8 md:p-10">
          <div className="mb-8">
            <h1 className="text-[32px] font-bold text-[#2C221C] mb-2">{t.login}</h1>
            <p className="text-[#3A2E25] font-medium">{t.loginTitle}</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#2C221C] mb-2 ml-1">{t.email} / {t.phoneNumber}</label>
                <input
                  required
                  type="text"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-white border border-[#E0E6E6] text-[#2C221C] rounded-[12px] focus:outline-none focus:border-[#3A2E25] focus:shadow-[0_0_0_4px_rgba(4,55,68,0.05)] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#2C221C] mb-2 ml-1">{t.password}</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-white border border-[#E0E6E6] text-[#2C221C] rounded-[12px] focus:outline-none focus:border-[#3A2E25] focus:shadow-[0_0_0_4px_rgba(4,55,68,0.05)] transition-all"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#E0E6E6] text-[#3A2E25] focus:ring-[#3A2E25]" />
                  <span className="text-sm font-medium text-[#3A2E25]/70 group-hover:text-[#2C221C] transition-colors">{t.rememberMe}</span>
                </label>
                <button type="button" className="text-sm font-bold text-[#3A2E25] hover:underline">
                  {t.forgotPassword}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#3A2E25] text-white rounded-[12px] font-bold text-lg hover:bg-[#2C221C] transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? t.loggingIn : t.login}
            </button>

            <div className="text-center mt-6">
              <p className="text-[#3A2E25]/70 text-sm">
                {t.dontHaveAccount} <button type="button" onClick={onSwitch} className="text-[#3A2E25] font-bold hover:underline">{t.signup}</button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Section - Logo (Dark Section) */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-[#3A2E25] via-[#5A4638] to-[#8B5E3C] flex flex-col items-center justify-center p-12 text-center order-1 md:order-2 min-h-[300px] md:min-h-screen">
        <img src={logo} alt="KrishiSahAI Logo" className="h-40 md:h-56 w-auto object-contain mb-8 filter brightness-0 invert opacity-90" />
        <h2 className="text-white text-4xl md:text-5xl font-extrabold mb-4">{t.brandName}</h2>
        <p className="text-white/80 text-lg md:text-xl font-medium tracking-wide">{t.tagline}</p>
      </div>
    </div>
  );
};

const SignupFlow: React.FC<{ onSignup: (p: any, pass: string) => void; onSwitch: () => void }> = ({ onSignup, onSwitch }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState<any>({
    name: '', phone: '', email: '',
    landSize: '', landUnit: 'acre', landType: 'Irrigated',
    state: '', district: '', village: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      if (!formData.email || !password) {
        throw new Error("Email and password are required");
      }
      const profile = {
        ...formData,
        age: '0',
        gender: 'Not specified',
        occupation: 'Farmer',
        soilType: 'Not specified',
        waterAvailability: 'Not specified',
        mainCrops: [],
        location: `${formData.village}, ${formData.district}`
      };
      await onSignup(profile, password);
    } catch (err: any) {
      console.error("Signup Error:", err);
      setError(err.message || "Signup failed. Please try again.");
      setLoading(false);
    }
  };

  const inputClasses = "w-full p-4 bg-white border border-[#E0E6E6] text-[#2C221C] rounded-[12px] focus:outline-none focus:border-[#3A2E25] focus:shadow-[0_0_0_4px_rgba(4,55,68,0.05)] transition-all";
  const labelClasses = "block text-sm font-bold text-[#2C221C] mb-2 ml-1";
  const sectionTitleClasses = "text-xl font-bold text-[#2C221C] mb-6";

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section - Logo (Dark Section) */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-[#3A2E25] via-[#5A4638] to-[#8B5E3C] flex flex-col items-center justify-center p-12 text-center min-h-[300px] md:min-h-screen">
        <img src={logo} alt="KrishiSahAI Logo" className="h-40 md:h-56 w-auto object-contain mb-8 filter brightness-0 invert opacity-90" />
        <h2 className="text-white text-4xl md:text-5xl font-extrabold mb-4">{t.brandName}</h2>
        <p className="text-white/80 text-lg md:text-xl font-medium tracking-wide">{t.tagline}</p>
      </div>

      {/* Right Section - Signup Form (Light Section) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-[480px] bg-white rounded-[20px] shadow-sm p-8 md:p-10 my-8">
          <div className="mb-10">
            <h1 className="text-[32px] font-bold text-[#2C221C] mb-2">{t.signup}</h1>
            <p className="text-[#3A2E25]/70 font-medium">{t.signupTitle}</p>
          </div>

          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-[#3A2E25]' : 'bg-[#E0E6E6]'}`} />
            ))}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className={sectionTitleClasses}>{t.sectionPersonal}</h3>
                <div>
                  <label className={labelClasses}>{t.fullName} *</label>
                  <input required placeholder={t.enterName} className={inputClasses} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className={labelClasses}>{t.phoneNumber} *</label>
                  <input required placeholder={t.enterphone} className={inputClasses} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label className={labelClasses}>{t.email} *</label>
                  <input required type="email" placeholder="name@example.com" className={inputClasses} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className={labelClasses}>{t.password} *</label>
                  <input required type="password" placeholder="••••••••" className={inputClasses} value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div>
                  <label className={labelClasses}>{t.confirmPassword} *</label>
                  <input required type="password" placeholder="••••••••" className={inputClasses} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className={sectionTitleClasses}>{t.sectionLand}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>{t.landArea} *</label>
                    <input required type="number" step="0.1" placeholder="0.0" className={inputClasses} value={formData.landSize} onChange={e => setFormData({ ...formData, landSize: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClasses}>&nbsp;</label>
                    <select className={inputClasses} value={formData.landUnit} onChange={e => setFormData({ ...formData, landUnit: e.target.value })}>
                      <option value="acre">{t.unitAcre}</option>
                      <option value="hectare">{t.unitHectare}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>{t.landType} *</label>
                  <select className={inputClasses} value={formData.landType} onChange={e => setFormData({ ...formData, landType: e.target.value })}>
                    <option value="Irrigated">{t.irrigated}</option>
                    <option value="Rainfed">{t.rainfed}</option>
                    <option value="Mixed">{t.mixed}</option>
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className={sectionTitleClasses}>{t.sectionLocation}</h3>
                <div>
                  <label className={labelClasses}>{t.state} *</label>
                  <select className={inputClasses} value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })}>
                    <option value="">{t.selectState}</option>
                    <option>Maharashtra</option><option>Karnataka</option><option>Punjab</option><option>Uttar Pradesh</option>
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>{t.district} *</label>
                  <input required placeholder={t.enterDistrict} className={inputClasses} value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} />
                </div>
                <div>
                  <label className={labelClasses}>{t.village} *</label>
                  <input required placeholder={t.enterVillage} className={inputClasses} value={formData.village} onChange={e => setFormData({ ...formData, village: e.target.value })} />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 pt-4">
              <div className="flex gap-4">
                {step > 1 && (
                  <button type="button" onClick={handleBack} className="flex-1 py-4 bg-white border border-[#E0E6E6] text-[#3A2E25] rounded-[12px] font-bold hover:bg-[#F5F8F8] transition-all">
                    {t.back}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 bg-[#3A2E25] text-white rounded-[12px] font-bold hover:bg-[#2C221C] transition-all shadow-sm disabled:opacity-50"
                >
                  {loading ? t.loading : (step === 3 ? t.submit : t.next)}
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="text-[#3A2E25]/70 text-sm font-medium">
                  {t.alreadyHaveAccount} <button type="button" onClick={onSwitch} className="text-[#3A2E25] font-bold hover:underline">{t.login}</button>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { language: lang, t } = useLanguage();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(true);

  // Weather State
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      if (u) {
        profileUnsub = onSnapshot(doc(db, "users", u.uid), (docSnap) => {
          if (docSnap.exists()) {
            const profile = docSnap.data() as UserProfile;
            setUser(profile);
            fetchWeather(getBestLocation(profile));
          }
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  const fetchWeather = async (location: string) => {
    if (!location) return;
    setWeatherLoading(true);
    try {
      const data = await api.getCurrentWeather(location);
      if (data.success) {
        setWeatherData(data.weather);
      }
    } catch (error) {
      console.error("Weather Fetch Error:", error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleToggleWeather = () => {
    setIsWeatherOpen(true);
    if (!weatherData && user) {
      fetchWeather(getBestLocation(user));
    }
  };

  const handleRefreshWeather = () => {
    if (user) {
      fetchWeather(getBestLocation(user));
    }
  };

  // ... (Login/Signup logic omitted for brevity, no changes needed inside)

  const handleLogin = async (e: string, p: string) => {
    try {
      await signInWithEmailAndPassword(auth, e, p);
    } catch (err: any) {
      throw err;
    }
  };

  const handleSignup = async (profile: any, pass: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, profile.email, pass);
      await setDoc(doc(db, "users", res.user.uid), profile);
      // setUser(profile); // onSnapshot will handle this or we can set it
    } catch (err: any) {
      throw err;
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center text-[#1F5F4A]">{t.loading}</div>
      ) : !user ? (
        authView === 'login' ? <LoginFlow onLogin={handleLogin} onSwitch={() => setAuthView('signup')} /> : <SignupFlow onSignup={handleSignup} onSwitch={() => setAuthView('login')} />
      ) : (
        <Router>
          <div className="min-h-screen">
            {/* Updated Header with refresh and loading props */}
            <Header
              toggleNotifications={() => { }}
              toggleWeather={handleToggleWeather}
              user={user}
              logout={handleLogout}
              weatherData={weatherData}
              weatherLoading={weatherLoading}
              refreshWeather={handleRefreshWeather}
            />

            <WeatherModal
              isOpen={isWeatherOpen}
              onClose={() => setIsWeatherOpen(false)}
              data={weatherData}
              loading={weatherLoading}
              location={getBestLocation(user)}
            />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chatbot />} />
              <Route path="/advisory" element={<BusinessAdvisory lang={lang} user={user} />} />
              <Route path="/news" element={<NewsPage lang={lang} user={user} />} />
              <Route path="/crop-care" element={<CropCare lang={lang} />} />
              <Route path="/waste-to-value" element={<WasteToValue lang={lang} />} />
              <Route path="/hub" element={<KnowledgeHub />} />
              <Route path="/knowledge/:slug" element={<ArticleDetail />} />
              <Route path="/business/:id" element={<BusinessDetail lang={lang} />} />
              <Route path="/roadmap/:businessName" element={<Roadmap lang={lang} />} />
              <Route path="/profile/edit" element={<EditProfile lang={lang} />} />
            </Routes>
          </div>
        </Router>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;

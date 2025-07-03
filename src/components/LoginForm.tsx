import React, { useState } from 'react';
import { Mail, Lock, User, Languages } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Language } from '../types';

interface LoginFormProps {
  languages: Language[];
}

export const LoginForm: React.FC<LoginFormProps> = ({ languages }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nativeLanguage: '',
    targetLanguage: ''
  });
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  // Get translations based on selected native language
  const getTranslation = (key: string, lang: string = 'en') => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        title: 'PolyChord',
        subtitle: 'Learn languages for free',
        signIn: 'Sign In',
        createAccount: 'Create Account',
        name: 'Name',
        email: 'Email',
        password: 'Password',
        iSpeak: 'I speak',
        iWantToLearn: 'I want to learn',
        selectNativeLanguage: 'Select your native language',
        selectTargetLanguage: 'Select target language',
        yourName: 'Your name',
        yourEmail: 'your@email.com',
        dontHaveAccount: "Don't have an account? Sign up",
        alreadyHaveAccount: 'Already have an account? Sign in'
      },
      es: {
        title: 'PolyChord',
        subtitle: 'Aprende idiomas gratis',
        signIn: 'Iniciar Sesión',
        createAccount: 'Crear Cuenta',
        name: 'Nombre',
        email: 'Correo',
        password: 'Contraseña',
        iSpeak: 'Hablo',
        iWantToLearn: 'Quiero aprender',
        selectNativeLanguage: 'Selecciona tu idioma nativo',
        selectTargetLanguage: 'Selecciona idioma objetivo',
        yourName: 'Tu nombre',
        yourEmail: 'tu@correo.com',
        dontHaveAccount: '¿No tienes cuenta? Regístrate',
        alreadyHaveAccount: '¿Ya tienes cuenta? Inicia sesión'
      },
      fr: {
        title: 'PolyChord',
        subtitle: 'Apprenez les langues gratuitement',
        signIn: 'Se Connecter',
        createAccount: 'Créer un Compte',
        name: 'Nom',
        email: 'Email',
        password: 'Mot de passe',
        iSpeak: 'Je parle',
        iWantToLearn: 'Je veux apprendre',
        selectNativeLanguage: 'Sélectionnez votre langue maternelle',
        selectTargetLanguage: 'Sélectionnez la langue cible',
        yourName: 'Votre nom',
        yourEmail: 'votre@email.com',
        dontHaveAccount: "Vous n'avez pas de compte? Inscrivez-vous",
        alreadyHaveAccount: 'Vous avez déjà un compte? Connectez-vous'
      },
      de: {
        title: 'PolyChord',
        subtitle: 'Sprachen kostenlos lernen',
        signIn: 'Anmelden',
        createAccount: 'Konto Erstellen',
        name: 'Name',
        email: 'E-Mail',
        password: 'Passwort',
        iSpeak: 'Ich spreche',
        iWantToLearn: 'Ich möchte lernen',
        selectNativeLanguage: 'Wählen Sie Ihre Muttersprache',
        selectTargetLanguage: 'Zielsprache auswählen',
        yourName: 'Ihr Name',
        yourEmail: 'ihre@email.com',
        dontHaveAccount: 'Haben Sie kein Konto? Registrieren',
        alreadyHaveAccount: 'Haben Sie bereits ein Konto? Anmelden'
      },
      fi: {
        title: 'PolyChord',
        subtitle: 'Opi kieliä ilmaiseksi',
        signIn: 'Kirjaudu Sisään',
        createAccount: 'Luo Tili',
        name: 'Nimi',
        email: 'Sähköposti',
        password: 'Salasana',
        iSpeak: 'Puhun',
        iWantToLearn: 'Haluan oppia',
        selectNativeLanguage: 'Valitse äidinkielesi',
        selectTargetLanguage: 'Valitse tavoitekieli',
        yourName: 'Sinun nimesi',
        yourEmail: 'sinun@email.com',
        dontHaveAccount: 'Eikö sinulla ole tiliä? Rekisteröidy',
        alreadyHaveAccount: 'Onko sinulla jo tili? Kirjaudu sisään'
      }
    };

    return translations[lang]?.[key] || translations['en'][key] || key;
  };

  const currentLang = formData.nativeLanguage || 'en';
  const t = (key: string) => getTranslation(key, currentLang);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const success = await login(formData.email, formData.password);
        if (!success) {
          setError('Invalid email or password');
        }
      } else {
        if (!formData.nativeLanguage || !formData.targetLanguage) {
          setError('Please select both languages');
          return;
        }
        if (formData.nativeLanguage === formData.targetLanguage) {
          setError('Native and target languages must be different');
          return;
        }
        const success = await register(
          formData.name,
          formData.email,
          formData.password,
          formData.nativeLanguage,
          formData.targetLanguage
        );
        if (!success) {
          setError('User with this email already exists');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Languages className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={t('yourName')}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={t('yourEmail')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={t('password')}
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('iSpeak')}</label>
                <select
                  required
                  value={formData.nativeLanguage}
                  onChange={(e) => setFormData({ ...formData, nativeLanguage: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">{t('selectNativeLanguage')}</option>
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('iWantToLearn')}</label>
                <select
                  required
                  value={formData.targetLanguage}
                  onChange={(e) => setFormData({ ...formData, targetLanguage: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">{t('selectTargetLanguage')}</option>
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            {isLogin ? t('signIn') : t('createAccount')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-indigo-600 hover:text-indigo-800 text-sm"
          >
            {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
          </button>
        </div>
      </div>
    </div>
  );
};
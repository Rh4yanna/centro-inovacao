import { useState } from 'react';
import LoginPage from './features/auth/pages/LoginPage';
import EsqueciSenhaPage from './features/auth/pages/EsqueciSenhaPage';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');

  if (currentScreen === 'forgot-password') {
    return <EsqueciSenhaPage onBackToLogin={() => setCurrentScreen('login')} />;
  }

  return <LoginPage onNavigateToForgot={() => setCurrentScreen('forgot-password')} />;
}
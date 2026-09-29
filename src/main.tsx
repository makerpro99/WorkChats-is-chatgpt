import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
      <LanguageSelectorModal />
    </LanguageProvider>
  </StrictMode>,
);

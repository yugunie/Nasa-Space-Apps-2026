
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import BackgroundMusic from '../../components/BackgroundMusic';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <BackgroundMusic />
  </>
);

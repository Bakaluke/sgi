import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from './context/AuthContext.tsx';
import { SettingsProvider } from './context/SettingsContext.tsx';
import { DatesProvider } from '@mantine/dates';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';
import '@mantine/core/styles.css';
import 'dayjs/locale/pt-br';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <MantineProvider>
          <DatesProvider settings={{ locale: 'pt-br', firstDayOfWeek: 0 }}>
            <Notifications position="top-right" />
            <App />
          </DatesProvider>
        </MantineProvider>
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>,
)
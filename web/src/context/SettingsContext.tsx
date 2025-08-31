import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import api from '../api/axios';
import type { Settings, SettingsContextType } from '../types';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        api.get('/settings')
            .then(response => {
                setSettings(response.data);
            })
            .catch(error => {
                console.error("Não foi possível carregar as configurações da empresa.", error);
            });
    }, []);

    return (
        <SettingsContext.Provider value={{ settings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
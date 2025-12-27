import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notifications } from '@mantine/notifications';
import api from '../api/axios';

export function LoginViaTokenPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const processLogin = async () => {
            const token = searchParams.get('token');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                localStorage.setItem('@SGI:token', token);
                
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const response = await api.get('/user');
                const user = response.data;

                login(user, token); 

                notifications.show({ 
                    title: 'Modo Deus Ativado 🕵️‍♂️', 
                    message: `Acessando como ${user.name}`, 
                    color: 'orange' 
                });

                navigate('/dashboard');

            } catch (error) {
                console.error('Falha no Impersonate', error);
                notifications.show({ title: 'Erro', message: 'Token inválido ou expirado', color: 'red' });
                navigate('/login');
            }
        };

        processLogin();
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1A1B1E', color: 'white' }}>
            <h2>🕶️ Acessando Painel do Cliente...</h2>
        </div>
    );
}
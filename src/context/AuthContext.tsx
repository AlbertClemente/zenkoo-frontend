'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<true | string>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);


  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/api/users/login/', {
        email,
        password,
      });
      
      // Obtenemos token y lo guardamos como cookie en navegador
      const { access, refresh } = response.data;
      Cookies.set('accessToken', access);
      Cookies.set('refreshToken', refresh);
      setIsAuthenticated(true);
  
      // Obtener datos del usuario
      const userData = await api.get('/api/users/profile/', {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });
  
      setUser(userData.data);

      showNotification({
        title: 'Bienvenido',
        message: 'Inicio de sesión exitoso',
        color: 'teal',
        icon: <IconCheck size={16} />,
      });

      return true;
    } catch (error) {
      console.error('Error de login:', error.response?.data || error.message);

      // Errores API HTTP

      if (error.response?.status === 400) {
        return 'Solicitud incorrecta';
      }

      if (error.response?.status === 401) {
        return 'Credenciales incorrectas';
      }

      if (error.response?.status === 403) {
        return 'Acceso prohibido';
      }

      if (error.response?.status === 500) {
        return 'Error en el servidor';
      }

      return 'Error desconocido';
    }
  };

  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setUser(null);
    setIsAuthenticated(false);

    showNotification({
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión correctamente',
      color: 'blue',
      icon: <IconCheck size={16} />,
    });
  };

  // Cargar token si existe
  useEffect(() => {
    const access = Cookies.get('accessToken');
    if (access) {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      })
        .then((res) => {
          setUser(res.data);
          setIsAuthenticated(true);
        })
        .catch(() => logout())
        .finally(() => setLoading(false)); // loading a false cuando se finaliza la comprobación inicial del token
    } else {
      // Si no hay token en la cookie, loading a false
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
};
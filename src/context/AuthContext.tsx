'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import { LoginUser } from '@/types/user';

import { showNotification } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';

interface AuthContextType {
  user: LoginUser | null;
  login: (email: string, password: string) => Promise<LoginUser | string>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isRegularUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const isAdmin = user?.is_superuser === true
  const isStaff = user?.is_staff === true && !isAdmin
  const isRegularUser = !user?.is_staff && !user?.is_superuser

  type LoginResult = { is_staff: boolean; is_superuser: boolean } | string;

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await api.post('/api/users/login/', { email, password });
      const { access, refresh } = response.data;

      // Guardar tokens
      Cookies.set('accessToken', access);
      Cookies.set('refreshToken', refresh);
      setIsAuthenticated(true);

      // Obtener datos de usuario usando `api` (el header ya se agrega con el token desde la cookie)
      const userData = await api.get('/api/users/profile/');
      setUser(userData.data);

      return userData.data as LoginUser;
    } catch (error: any) {
      console.error('Error de login:', error.response?.data || error.message);

      if (error.response?.status === 400) return 'Solicitud incorrecta';
      if (error.response?.status === 401) return 'Credenciales incorrectas';
      if (error.response?.status === 403) return 'Acceso prohibido';
      if (error.response?.status === 500) return 'Error en el servidor';

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
      color: 'zenkooBlue',
      icon: <IconCheck size={16} />,
    });
  };

  // Cargar token si existe
  useEffect(() => {
    //Protección de hidratación
    setMounted(true); // Esperamos a montar en cliente

    const access = Cookies.get('accessToken');
    
    if (access) {
      api
        .get('/api/users/profile/')
        .then((res) => {
          setUser(res.data);
          setIsAuthenticated(true);
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (!mounted) return null; // Evita render antes del montaje

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      loading, 
      isAdmin,
      isStaff,
      isRegularUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
};

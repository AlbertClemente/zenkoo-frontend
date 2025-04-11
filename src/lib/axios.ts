import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(
  config => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// interceptor con Axios para renovar el access token automáticamente cuando expire usando el refresh token
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        Cookies.set('accessToken', newAccessToken);

        // Reintentar con nuevo token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Error al refrescar el token', refreshError);
        
        //Limpiamos los tokens de las cookies
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');

        //Redirigimos al Login
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);
export default api;
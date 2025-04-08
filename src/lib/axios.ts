import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

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

        // Reintentar la petición con el nuevo token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Error al refrescar el token', refreshError);
        // Aquí podrías hacer logout automático si lo deseas
      }
    }

    return Promise.reject(error);
  }
);

export default api;
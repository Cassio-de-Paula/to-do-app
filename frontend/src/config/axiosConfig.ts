import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // envia cookies automaticamente
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag para evitar múltiplos refresh simultâneos
let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor de resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Só tenta refresh se for 401 e não estiver já tentando
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já estiver tentando refresh, adiciona à fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("api/session/refresh"); // endpoint que gera novo access token
        isRefreshing = false;
        processQueue(null); // Processa requisições pendentes
        return api(originalRequest); // Refaça a requisição original
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

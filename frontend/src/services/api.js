import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) => {
    const form = new FormData();
    form.append("username", username);
    form.append("password", password);
    return api.post("/auth/login", form);
  },
  register: (data) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

export const inspectionAPI = {
  predict: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/inspections/predict", form);
  },
  history: (skip = 0, limit = 20) =>
    api.get(`/inspections/history?skip=${skip}&limit=${limit}`),
};

export const userAPI = {
  list: () => api.get("/users/"),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;

import axios from "axios";
import { BASE_URL } from "@/config/api";

localStorage.removeItem("auth_token");

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if we're already refreshing to avoid duplicate refresh calls.
let isRefreshing = false;
let failedQueue: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve();
  });
  failedQueue = [];
};

const isRefreshRequest = (url?: string) => Boolean(url?.includes("/auth/refresh"));
const isAuthRequest = (url?: string) => Boolean(url?.includes("/auth/") && !url.includes("/auth/logout"));

const refreshSession = async () => {
  const legacyRefreshToken = localStorage.getItem("refresh_token");
  try {
    await axios.post(
      `${BASE_URL}/auth/refresh`,
      legacyRefreshToken ? { refreshToken: legacyRefreshToken } : undefined,
      { withCredentials: true }
    );
  } finally {
    localStorage.removeItem("refresh_token");
  }
};

// Response interceptor - unwrap ApiResponse, auto-refresh cookie auth on 401.
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object" && "success" in response.data && "data" in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest(originalRequest.url) &&
      !isAuthRequest(originalRequest.url)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(apiClient(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshSession();
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem("auth_user");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

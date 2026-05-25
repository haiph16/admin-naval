/**
 * API Client Configuration
 * Axios instance with JWT interceptors for automatic token refresh
 */

import axios from "axios";
import { StorageKey, storage } from "../constants/storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let tokenPromise = null;
let apiClientInstance = null;
let requestQueue = [];
let isRefreshing = false;

/**
 * Refresh access token using HTTP Only Cookie
 * @returns {Promise<string>} - New access token
 */
const refreshAccessToken = async () => {
  try {
    const refreshToken = storage.get(StorageKey.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken }
    );

    const newAccessToken = response?.data?.data?.access_token;
    const newRefreshToken = response?.data?.data?.refresh_token;

    if (!newAccessToken) {
      throw new Error("No access token returned from refresh endpoint");
    }

    storage.set(StorageKey.ACCESS_TOKEN, newAccessToken);
    if (newRefreshToken) {
      storage.set(StorageKey.REFRESH_TOKEN, newRefreshToken);
    }
    return newAccessToken;
  } catch (error) {
    console.error("Token refresh failed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    storage.remove(StorageKey.ACCESS_TOKEN);
    storage.remove(StorageKey.REFRESH_TOKEN);
    storage.remove(StorageKey.USER);
    requestQueue = [];
    throw error;
  }
};

/**
 * Process queued requests after token refresh
 */
const processQueue = (error, token = null) => {
  requestQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  requestQueue = [];
};

/**
 * Prevent multiple refresh token calls
 * @returns {Promise<string>} - Valid access token
 */
const getValidToken = () => {
  if (!tokenPromise) {
    tokenPromise = refreshAccessToken().finally(() => {
      tokenPromise = null;
    });
  }
  return tokenPromise;
};

/**
 * Create or return cached Axios instance with JWT interceptors
 * @param {string} baseURL - API base URL
 * @returns {AxiosInstance} - Configured axios instance
 */
export const getApiClient = (baseURL = API_BASE_URL) => {
  if (apiClientInstance) {
    return apiClientInstance;
  }

  const instance = axios.create({
    baseURL,
    // withCredentials: true,
  });

  /**
   * Request interceptor - Add JWT token and API key to headers
   */
  instance.interceptors.request.use(
    (config) => {
      try {
        const accessToken = storage.get(StorageKey.ACCESS_TOKEN);

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        if (!(config.data instanceof FormData)) {
          config.headers["Content-Type"] = "application/json";
        } else {
          delete config.headers["Content-Type"];
        }
        return config;
      } catch (error) {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      }
    },
    (error) => {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    },
  );

  /**
   * Response interceptor - Handle 401 and token refresh with queue management
   */
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      try {
        const originalRequest = error.config;
        const isAuthRequest =
          originalRequest?.url?.includes("/auth/login") ||
          originalRequest?.url?.includes("/auth/register") ||
          originalRequest?.url?.includes("/auth/forgot-password");

        // Only attempt refresh for 401 errors, not auth endpoints
        if (
          error.response?.status === 401 &&
          !originalRequest?._retry &&
          !isAuthRequest
        ) {
          originalRequest._retry = true;

          // Check if token exists before attempting refresh
          const hasToken = storage.get(StorageKey.ACCESS_TOKEN);
          if (!hasToken) {
            console.warn("No token found, redirecting to login");
            window.location.href = "/login";
            return Promise.reject(error);
          }

          // If already refreshing, queue this request
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              requestQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return instance(originalRequest);
              })
              .catch((err) => {
                console.error("Queued request retry failed:", err);
                return Promise.reject(err);
              });
          }

          // Start token refresh
          isRefreshing = true;

          try {
            const newAccessToken = await getValidToken();
            isRefreshing = false;
            processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return instance(originalRequest);
          } catch (refreshError) {
            isRefreshing = false;
            processQueue(refreshError, null);
            console.error("Token refresh failed, clearing storage");
            storage.remove(StorageKey.ACCESS_TOKEN);
            storage.remove(StorageKey.USER);
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        if (error.response?.status === 401 && !isAuthRequest) {
          console.warn("Unauthorized request, redirecting to login");
          window.location.href = "/login";
        }

        return Promise.reject(error);
      } catch (err) {
        console.error("Response interceptor error:", err);
        return Promise.reject(err);
      }
    },
  );

  apiClientInstance = instance;
  return instance;
};

export default getApiClient;

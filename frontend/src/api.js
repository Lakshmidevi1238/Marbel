// src/api.js
import axiosInstance from "./auth/axiosInstance";

const ACCESS_KEY = "mabel_access";
const REFRESH_KEY = "mabel_refresh";

function saveAccessToken(token) {
  if (!token) return localStorage.removeItem(ACCESS_KEY);
  localStorage.setItem(ACCESS_KEY, token);
}

function saveRefreshToken(token) {
  if (!token) return localStorage.removeItem(REFRESH_KEY);
  localStorage.setItem(REFRESH_KEY, token);
}

export function getSavedRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function getSavedAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

/* -----------------------------------------
   REGISTER
----------------------------------------- */
export async function register({ name, email, password }) {
  try {
    const res = await axiosInstance.post("/api/auth/register", {
      name,
      email,
      password,
    });
    return res.data;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Registration failed";
    throw new Error(msg);
  }
}

/* -----------------------------------------
   LOGIN — store tokens
----------------------------------------- */
export async function login({ email, password }) {
  try {
    const resp = await axiosInstance.post("/api/auth/login", {
      email,
      password,
    });

    const data = resp.data || {};

    const access =
      data.accessToken || data.access || data.token || data.jwt || null;
    const refresh =
      data.refreshToken || data.refresh || data.rawRefresh || null;
    const user = data.user || null;

    if (!access) {
      throw new Error(
        "Login response missing access token — check backend response."
      );
    }

    saveAccessToken(access);
    if (refresh) saveRefreshToken(refresh);

    return { user, access, refresh, raw: data };
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Login failed";
    throw new Error(msg);
  }
}

/* -----------------------------------------
   REFRESH — get new access token
----------------------------------------- */
export async function refresh() {
  const refreshToken = getSavedRefreshToken();
  if (!refreshToken) throw new Error("No refresh token stored");

  try {
    const resp = await axiosInstance.post("/api/auth/refresh", {
      refreshToken,
    });

    const data = resp.data || {};

    const access =
      data.accessToken || data.access || data.token || null;
    const newRefresh =
      data.refreshToken || data.refresh || null;
    const user = data.user || null;

    if (!access) throw new Error("Refresh response missing access token");

    saveAccessToken(access);
    if (newRefresh) saveRefreshToken(newRefresh);

    return { user, access, refresh: newRefresh, raw: data };
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Token refresh failed";
    throw new Error(msg);
  }
}

/* -----------------------------------------
   LOGOUT — safe cleanup
----------------------------------------- */
export async function logout() {
  const refreshToken = getSavedRefreshToken();

  try {
    if (refreshToken) {
      await axiosInstance.post("/api/auth/logout", { refreshToken });
    }
  } catch {
    // ignore server revoke errors
  } finally {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
}

/* -----------------------------------------
   GENERIC AUTH REQUEST HELPERS
----------------------------------------- */
export async function postAuth(path, body) {
  const res = await axiosInstance.post(path, body);
  return res.data;
}

export async function getAuth(path, params) {
  const res = await axiosInstance.get(path, { params });
  return res.data;
}

/* -----------------------------------------
   TASKS
----------------------------------------- */
export async function getTasks() {
  const res = await axiosInstance.get("/api/tasks");
  return res.data || [];
}

export async function createTask({ title, description, priority }) {
  const res = await axiosInstance.post("/api/tasks", {
    title,
    description,
    priority,
  });
  return res.data;
}

export async function deleteTask(id) {
  const res = await axiosInstance.delete(`/api/tasks/${id}`);
  return res.data;
}

export async function completeTask(id) {
  const res = await axiosInstance.post(`/api/tasks/${id}/complete`);
  return res.data;
}

/* -----------------------------------------
   MARBLES
----------------------------------------- */
export async function getMarbles() {
  const res = await axiosInstance.get("/api/marbles");
  return res.data || [];
}

export async function getMarbleInventory() {
  const res = await axiosInstance.get("/api/marbles/inventory");
  return res.data || { normal: 0, gold: 0, special: 0 };
}

export async function setMarbleStyle(style) {
  const res = await axiosInstance.post("/api/marbles/style", style, {
    headers: { "Content-Type": "text/plain" },
  });
  return res.data;
}

export default {
  register,
  login,
  refresh,
  logout,
  postAuth,
  getAuth,
  getSavedRefreshToken,
  getSavedAccessToken,
};

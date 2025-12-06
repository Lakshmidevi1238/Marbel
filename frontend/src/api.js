import axiosInstance from "./auth/axiosInstance";

export async function register(data) {
    const res = await axiosInstance.post("/auth/register", data);
    return res.data;
}

export async function login(data) {
  const res = await axiosInstance.post("/auth/login", data);

  localStorage.setItem("marbel_access", res.data.accessToken);
  localStorage.setItem("marbel_refresh", res.data.refreshToken); // ✅ FIXED

  return res.data;
}

export async function logout() {
  const refreshToken = localStorage.getItem("marbel_refresh");

  if (refreshToken) {
    await axiosInstance.post("/auth/logout", {
      refreshToken, // ✅ FIXED VARIABLE NAME
    });
  }

  localStorage.removeItem("marbel_access");
  localStorage.removeItem("marbel_refresh");
}


// ✅ TASK APIs

export async function getTasks() {
  const res = await axiosInstance.get("/tasks");
  return res.data;
}

export async function createTask(data) {
  const res = await axiosInstance.post("/tasks", data);
  return res.data;
}

export async function completeTask(id) {
  const res = await axiosInstance.post(`/tasks/${id}/complete`);
  return res.data;
}

export async function deleteTask(id) {
  const res = await axiosInstance.delete(`/tasks/${id}`);
  return res.data;
}

export async function getMarbles() {
  const res = await axiosInstance.get("/marbles");
  return res.data;
}

export async function getMarbleInventory() {
  const res = await axiosInstance.get("/marbles/inventory");
  return res.data;
}

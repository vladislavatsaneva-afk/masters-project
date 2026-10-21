import { apiPost } from "./services/api";

export const login = async (username, password) => {
  const data = await apiPost("/auth/login", {
    username,
    password,
  });

  const token = data.access_token;

  if (!token) {
    throw new Error("No access_token returned from backend");
  }

  localStorage.setItem("token", token);

  return data;
};
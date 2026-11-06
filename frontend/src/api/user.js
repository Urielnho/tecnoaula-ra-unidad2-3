import { request, authRequest } from "./client";
export const loginApi = (values) =>
  request("/auth/token/", { method: "POST", body: values });
export const registerApi = (values) =>
  request("/auth/register/", { method: "POST", body: values });
export const getMeApi = () => authRequest("/auth/me/");

import { Api } from "./swagger/Api";

export const backendAPI = new Api({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
});

export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

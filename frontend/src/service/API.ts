import { Api } from "./swagger/Api";

export const backendAPI = new Api({
  baseUrl: process.env.BACKEND_URL || "http://loalhost:8080",
});

export const BASE_URL = process.env.BACKEND_URL || "http://localhost:8080";

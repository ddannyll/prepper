import { Api } from "./swagger/Api";

export const backendAPI = new Api({
  baseUrl: "http://localhost:8080",
});

export const BASE_URL = "http://localhost:8080";

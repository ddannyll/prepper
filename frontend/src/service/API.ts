import { Api } from "./swagger/Api";

export const backendAPI = new Api({
  baseUrl: "http://localhost:8080",
});
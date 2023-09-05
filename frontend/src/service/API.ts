import { Api } from "./swagger/Api";

export const backendAPI = new Api({
  baseUrl: "http://localhost:8080",
  securityWorker: () => {
    return Promise.resolve({
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
  },
});

export const BASE_URL = "http://localhost:8080";

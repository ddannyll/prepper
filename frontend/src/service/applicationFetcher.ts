import { backendAPI } from "./API";
import { ApplicationCreateBody } from "./swagger/Api";

export class HTTPApplicatonFetcher {
  async fetchUserApplications() {
    const applications = await backendAPI.application.getApplication({
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return applications.data;
  }
  async newApplication(application: ApplicationCreateBody) {
    const newApp = await backendAPI.application.createCreate(application, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return newApp.data;
  }
  async fetchApplicationQuestions(id: string) {
    const questions = await backendAPI.application.applicationIdQuestionsList(
      id,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return questions.data;
  }
  async deleteApplication(id: string) {
    return await backendAPI.application.applicationDelete(
      { id: id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
  }
}

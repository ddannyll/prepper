import { backendAPI } from "./API"
import { ApplicationCreateBody } from "./swagger/Api"

interface applicationFetcher {
}

export class HTTPApplicatonFetcher {
  async fetchUserApplications () {
    const applications = await backendAPI.application.getApplication(
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    )
    console.log(applications.data)
    console.log(applications)
    return applications.data
  }
  async newApplication(application: ApplicationCreateBody) {
    const newApp = await backendAPI.application.createCreate(
      application,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    )
    return newApp
  }
}

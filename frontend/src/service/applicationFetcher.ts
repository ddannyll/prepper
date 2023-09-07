
interface Application {
  id: string
  companyName: string
  interviewStages: string[]
  // add other fields here
}

interface ApplicationFetcher {
  getApplicationInfo: (applicationId: string) => Promise<Application>
}

export class MockApplicaitonFetcher {
  async getApplicationInfo(applicationId: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockApplication: Application = {
      id: applicationId,
      companyName: "SafetyCulture",
      interviewStages: ["stage1id", "stage2id"]
    }
    return mockApplication
  }
}

import { backendAPI } from "@/service/API";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";

interface ApplicationForm {
  name: string;
  description: string;
  jobDescription: string;
  icon: string;
}

const NewApplication = (props: {
  setOpen: (open: boolean) => void;
  setApplications: Dispatch<SetStateAction<any[] | null>>;
}) => {
  // TODO update the data store...
  // then close self

  const [isLoading, setIsLoading] = useState(false); // State to manage the submit button loading state

  const { register, handleSubmit, formState, reset } =
    useForm<ApplicationForm>();

  const onSubmit = async (data: ApplicationForm) => {
    console.log(data);

    // call the api to create the application

    try {
      const response = await backendAPI.application.createCreate(
        {
          name: data.name,
          description: data.description,
          jobDescription: data.jobDescription,
          icon: data.icon || "https://picsum.photos/200",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        // Handle successful API response here
        // add a redirect

        props.setApplications((prev) => {
          if (prev) {
            return [
              {
                id: response.data.id,
                name: response.data.name,
                description: response.data.description,
                jobDescription: response.data.jobDescription,
                icon: response.data.icon,
                createdAt: response.data.createdAt,
              },
              ...prev,
            ];
          } else {
            return [
              {
                id: response.data.id,
                name: response.data.name,
                description: response.data.description,
                jobDescription: response.data.jobDescription,
                icon: response.data.icon,
                createdAt: response.data.createdAt,
              },
            ];
          }
        });
      } else {
        // Handle API errors here
        console.error("API error:", response.statusText);
      }
    } catch (error) {
      // Handle network errors here
      console.error("Network error:", error.message);
    }

    props.setOpen(false);
    setIsLoading(false);
    reset(); // Reset the form
  };

  return (
    <div className="mt-4">
      This is a lil form to create an Application
      {/* TODO FORM*/}
      <form
        className="bg-white p-4 rounded shadow"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Form fields go here */}
        <div className="grid">
          <div>
            <label>Company Name</label>
            <input
              {...register("name")}
              className="w-full"
              type="text"
              placeholder="SC"
            />
          </div>

          <div>
            <label>Notes</label>
            <input
              {...register("description")}
              className="w-full"
              type="text"
              placeholder="Looks like a cool place to work!"
            />
          </div>

          <div>
            <label>Job Description</label>
            <input
              {...register("jobDescription")}
              className="w-full"
              type="text"
              placeholder="Huh a job? Gimme that"
            />
          </div>
        </div>

        <input
          type="submit"
          value="Submit"
          disabled={isLoading || formState.isSubmitting}
        />
      </form>
    </div>
  );
};

export default NewApplication;

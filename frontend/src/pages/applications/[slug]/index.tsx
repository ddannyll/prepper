import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface ApplicationForm {
  jobDescription: string;
  cvData: string;
}

const CurrentApplication = ({}: { application: any }) => {
  // TODO add in the application data

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false); // State to manage the submit button loading state

  const { register, handleSubmit, formState, reset } =
    useForm<ApplicationForm>();

  const onSubmit = async (data: ApplicationForm) => {
    console.log(data);
  };

  return (
    <div className="flex flex-col gap-2 max-w-xl">
      {router.query.slug}

      <form
        className="bg-white p-4 rounded shadow"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Form fields go here */}
        <div className="grid">
          <div>
            <label>Job Description</label>
            <input
              {...register("jobDescription")}
              className="w-full"
              type="text"
              placeholder="SC"
            />
          </div>

          <div>
            <label>CV Data</label>
            <input
              {...register("cvData")}
              className="w-full"
              type="text"
              placeholder="Looks like a cool place to work!"
            />
          </div>
        </div>

        <input
          type="submit"
          value="Submit"
          disabled={isLoading || formState.isSubmitting}
        />
      </form>

      <Link href={`/interview/${router.query.slug}`} className="color-blue-500">
        Begin Interview
      </Link>
    </div>
  );
};

export default CurrentApplication;

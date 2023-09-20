import { Textarea } from "@/components/ui/textarea";
import { SubmitHandler, useForm } from "react-hook-form";
import Button from "@/components/ui-kit/Button";
import QuestionTypeWithTags from "@/components/QuestionTypeWithTags";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { HTTPApplicatonFetcher } from "@/service/aplicationFetcher";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import BeatLoader from "react-spinners/BeatLoader";
import { cn, getErrorMessage } from "@/lib/utils";
import { toast } from "react-hot-toast";
interface FormValues {
  jobName: string;
  jobDescription: string;
}
const applicationFetcher = new HTTPApplicatonFetcher();
export default function NewApplication() {
  const [questions, setQuestions] = useState<{ tags: string[] }[]>([
    { tags: [] },
  ]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const newQuestion = () => {
    setQuestions([...questions, { tags: [] }]);
  };
  const deleteQuestion = (i: number) => {
    setQuestions(questions.slice(0, i).concat(questions.slice(i + 1)));
  };
  const setQuestionTags = (i: number, tags: string[]) => {
    const newQuestions = [...questions];
    newQuestions[i] = { ...newQuestions[i], tags };
    setQuestions(newQuestions);
  };
  const queryClient = useQueryClient();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setLoading(true);
      const app = await applicationFetcher.newApplication({
        name: data.jobName,
        jobDescription: data.jobDescription,
        questions: questions.map((q) => q.tags),
      });
      queryClient.invalidateQueries(["applications"]);
      router.push(`/applications/${app.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const { register, handleSubmit } = useForm<FormValues>();
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full h-full flex flex-col gap-5 items-center p-10"
    >
      <input
        className="text-3xl w-fit border-b-2 py-2 px-4 border-blue-500 bg-inherit outline-none"
        defaultValue={"Willy Wonka's Chocolate Factory"}
        placeholder={"Company Name"}
        {...register("jobName")}
      />
      <div className="w-full h-full grid grid-cols-1 grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-5 overflow-hidden">
        <div className="flex flex-col gap-3">
          <Label>Job Description</Label>
          <Textarea
            defaultValue={`Job Title: Oompa Loompa

Location: Willy Wonka's Chocolate Factory, Chocolateville

Job Type: Full-time, Permanent

Job Summary:
Willy Wonka's Chocolate Factory is seeking energetic, enthusiastic, and hardworking Oompa Loompas to join our team in Chocolateville. As an Oompa Loompa, you will play a crucial role in the daily operations of the factory, ensuring the production of the world's finest chocolates and candies. You will be responsible for a variety of tasks, from candy-making to assisting with factory maintenance and promoting a positive and magical atmosphere.

Key Responsibilities:

Candy Production: Assist in the creation and packaging of delicious chocolates, candies, and confections according to Willy Wonka's secret recipes and quality standards.

Quality Control: Inspect candies for quality, taste, and appearance, and report any issues or deviations from the expected standards.

Factory Maintenance: Help maintain a clean and safe working environment by cleaning workstations, equipment, and common areas regularly.

Problem Solving: Collaborate with fellow Oompa Loompas to troubleshoot and resolve production issues, ensuring smooth operations.

Safety Compliance: Follow all safety protocols and guidelines to prevent accidents and maintain a hazard-free workspace.

Entertainment: Occasionally participate in musical and theatrical performances to entertain factory visitors, sharing the Oompa Loompa culture and wisdom.

Teamwork: Foster a positive and collaborative team spirit among Oompa Loompas and work together to achieve production goals.

Creativity: Assist in developing new candy ideas and flavors to keep the factory's offerings exciting and innovative.

Qualifications:

Passion for chocolate and candy-making.
Strong attention to detail and commitment to producing high-quality products.
Ability to work efficiently in a fast-paced environment.
Excellent teamwork and communication skills.
Willingness to learn and adapt to new tasks and challenges.
Musical and theatrical talents are a plus, but not mandatory.
Must be adaptable to a variety of working conditions and tasks.
Physical Requirements:

Ability to stand for extended periods.
Lift and carry heavy objects (up to 50 pounds).
Bend, kneel, and reach as required to perform tasks.
Work in a warm and sometimes humid environment.
Benefits:

Competitive salary and bonus opportunities.
Access to a wide variety of delectable chocolates and candies.
Magical and enchanting work environment.
Opportunities for career growth within the factory.
Work alongside Willy Wonka, a legendary figure in the candy industry.
If you have a sweet tooth, a passion for candy, and a desire to be part of a whimsical world of chocolate, apply today to become an Oompa Loompa at Willy Wonka's Chocolate Factory. We look forward to welcoming you to our team and creating delightful experiences for the world!

Note: This job description is intended to describe the general nature and level of work to be performed and is not an exhaustive list of qualifications, duties, and responsibilities associated with the role of an Oompa Loompa at Willy Wonka's Chocolate Factory.
          `}
            className="h-full box-border resize-none outline-white focus-visible:ring-0"
            placeholder="Copy and paste a job description here"
            id="job-description"
            {...register("jobDescription")}
          />
        </div>
        <div className="flex flex-col gap-3 overflow-hidden">
          <Label className="w-full">Interview Format</Label>
          <div className="overflow-y-auto flex flex-col gap-3">
            {questions.map((q, i) => (
              <QuestionTypeWithTags
                key={uuid()}
                deleteQuestion={() => deleteQuestion(i)}
                setTags={(tags: string[]) => setQuestionTags(i, tags)}
                tags={q.tags}
                label={`Question ${i + 1}`}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="tertiary"
            className="text-sm"
            onClick={newQuestion}
          >
            + New Question
          </Button>
        </div>
      </div>
      <Button
        disabled={loading}
        className="self-end flex items-center relative"
        type="submit"
      >
        <BeatLoader
          color="white"
          className={cn("opacity-100 absolute left-1/2 -translate-x-1/2", {
            "opacity-0": !loading,
          })}
        />
        <span
          className={cn({
            "opacity-0": loading,
          })}
        >
          Create Application
        </span>
      </Button>
    </form>
  );
}

function Label({ children }: React.ComponentProps<"label">) {
  return (
    <label className="self-start text-gray-600 font-bold text-xl">
      {children}
    </label>
  );
}

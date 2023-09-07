import { useUser } from "@/context/UserContext";
import { backendAPI } from "@/service/API";
import { Router, useRouter } from "next/router";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

interface LoginForm {
  username: string;
  password: string;
}
const CustomForm = () => {
  const { register, handleSubmit, formState, reset } = useForm<LoginForm>();
  const [isLoading, setIsLoading] = useState(false); // State to manage the submit button loading state

  const router = useRouter();

  const { login } = useUser();

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    setIsLoading(true); // Set loading state when the form is submitted

    try {
      const response = await backendAPI.user.signupCreate({
        username: data.username,
        password: data.password,
      });

      console.log(response.data);

      const jsonData = response.data;
      console.log(jsonData);

      if (response.ok && jsonData.access_token && jsonData.id) {
        // store the access token in the local storage
        localStorage.setItem("token", jsonData.access_token);

        login({
          username: "Test User",
          id: jsonData.id,
        });
        // Handle successful API response here
        // add a redirect
        router.push("/applications");
      } else {
        // Handle API errors here
        console.error(
          "API error:",
          response.statusText || "something went wrong"
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false); // Reset loading state after API call
      reset(); // Reset the form
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="font-bold inline text-2xl text-gray-800">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 font-medium">
            Username
          </label>
          <input
            {...register("username")}
            type="text"
            id="username"
            className="w-full border rounded-md p-2"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            id="password"
            className="w-full border rounded-md p-2"
          />
        </div>
        <button
          type="submit"
          className="place-self-end text-sm text-blue-500 font-medium py-0.5 px-2.5 rounded hover:bg-blue-100 active:translate-y-0.5"
          disabled={isLoading || formState.isSubmitting}
        >
          {isLoading ? "Logging In..." : "Log In"}
        </button>
      </form>
    </div>
  );
};

export default CustomForm;

import Link from "next/link";
import BG from "../assets/blob-scene-haikei.svg";
import Logo from "../assets/prepper-logo.png";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { backendAPI } from "@/service/API";
import Button from "@/components/ui-kit/Button";
import { useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { cn, getErrorMessage } from "@/lib/utils";
import toast from "react-hot-toast";

type RegisterInputs = {
  username: string;
  password: string;
  confirmPassword: string;
};

const labelClasses = "font-bold text-sm mt-2 flex text-gray-700";
const inputClasses = "p-2 px-4 w-full rounded bg-gray-100";
const RequiredStar = () => (
  <div className="text-red-500 inline text-xs pl-1">*</div>
);

export default function Register() {
  const router = useRouter();
  const { login } = useUser();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputs>({
    reValidateMode: "onChange",
  });

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    setLoading(true);
    try {
      const res = await backendAPI.user.signupCreate(data);
      if (res.ok) {
        login({ id: res.data.id as string, username: data.username });
        localStorage.setItem("token", res.data.access_token as string);
        router.push("applications");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setLoading(false);
  };

  return (
    <div className="w-screen h-screen flex justify-between relative bg-gray-50">
      <div className="shrink-0 w-full h-full max-w-xl shadow-lg flex justify-center items-center bg-white z-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-md w-full flex flex-col gap-2 p-6 rounded"
        >
          <h1 className="mx-auto mb-10 text-2xl font-bold text-gray-700">
            <Image src={Logo} alt="prepper logo" className="w-52" />
          </h1>

          <label htmlFor="username" className={labelClasses}>
            Username
            <RequiredStar />
            {errors.username && (
              <span className="text-red-500 font-normal grow text-end">
                Username is required
              </span>
            )}
          </label>
          <input
            id="username"
            type="text"
            className={inputClasses}
            {...register("username", { required: true })}
          />

          <label htmlFor="password" className={labelClasses}>
            Password
            <RequiredStar />
            {errors.password && (
              <span className="text-red-500 font-normal grow text-end">
                Password is required
              </span>
            )}
          </label>
          <input
            id="password"
            type="password"
            className={inputClasses}
            {...register("password", {
              required: true,
            })}
          />

          <label htmlFor="confirmPassword" className={labelClasses}>
            Confirm Password
            <RequiredStar />
            {errors.confirmPassword && (
              <span className="text-red-500 font-normal grow text-end">
                Passwords are not the same
              </span>
            )}
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={inputClasses}
            {...register("confirmPassword", {
              required: true,
              validate: (value, formValues) => value === formValues.password,
            })}
          />
          <Button
            className={cn("mt-4 relative transition justify-center", {
              "text-opacity-0": loading,
            })}
          >
            <BeatLoader
              color="white"
              className={cn(
                "transition absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[40%]",
                { "opacity-0": !loading }
              )}
            />
            Register
          </Button>
          <p className="text-sm">
            Have an account?
            <Link
              href={"/login"}
              className="text-blue-400 hover:underline px-1"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
      <Image
        src={BG}
        alt="background graphic"
        className="absolute w-screen h-screen object-cover"
      />
    </div>
  );
}

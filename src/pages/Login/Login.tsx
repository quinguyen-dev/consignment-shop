import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { loginSchema, type LoginSchemaType } from "./types";

export function Login() {
  const { register, handleSubmit } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();
  const onSubmit: SubmitHandler<LoginSchemaType> = () => {
    // todo post for authentication
    navigate("/account");
  };

  return (
    <div className="flex justify-center items-center h-screen flex-col">
      <div className="px-4 py-3 border text-gray-00 text-center mb-4">
        Website Logo / Name
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-col flex w-[272px]"
      >
        <input
          className="border px-4 py-2 mb-2"
          placeholder="Enter your email"
          type="email"
          {...register("email")}
        />
        <input
          className="border px-4 py-2 mb-4"
          placeholder="Enter your password"
          type="password"
          {...register("password")}
        />
        <input
          className="cursor-pointer bg-[#545F71] text-white rounded-md h-11"
          type="submit"
          value="Login"
        />
      </form>
      <button className="cursor-pointer border rounded-md h-11 w-[272px] mt-2">
        Create an account
      </button>
    </div>
  );
}

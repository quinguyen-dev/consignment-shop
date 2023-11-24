import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { RegistrationSchemaType } from "./types";
import axios from "axios";
import { useContext } from "react";
import { AuthContext, type IAuthContext } from "react-oauth2-code-pkce";

export function Register() {
  const authContext = useContext<IAuthContext>(AuthContext);

  const { register, handleSubmit } = useForm<RegistrationSchemaType>();

  const navigate = useNavigate();
  const onSubmit: SubmitHandler<RegistrationSchemaType> = async (
    data: RegistrationSchemaType,
  ) => {
    const obj = {
      storeName: data.storeName,
      longitude: data.longitude,
      latitude: data.latitude,
    } satisfies RegistrationSchemaType;

    await axios.post(`/store-owner/new-store`, obj, {
      headers: {
        Authorization: `Bearer ${authContext.token}`,
      },
    });

    navigate("/account");
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="text-gray-00 mb-4 border px-4 py-3 text-center">
        Website Logo / Name
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-[272px] flex-col"
      >
        <input
          className="mb-2 border px-4 py-2"
          placeholder="Store name"
          {...register("storeName")}
        />
        <input
          className="mb-2 border px-4 py-2"
          placeholder="Latitude"
          {...register("longitude")}
        />
        <input
          className="mb-2 border px-4 py-2"
          placeholder="Longitude"
          {...register("latitude")}
        />
        <input
          className="h-11 cursor-pointer rounded-md bg-[#545F71] text-white"
          type="submit"
          value="Create store"
        />
      </form>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { registrationSchema, RegistrationSchemaType } from "./types";
import axios from "axios";
import { useContext } from "react";
import { AuthContext, type IAuthContext } from "react-oauth2-code-pkce";

export function Register() {
  const authContext = useContext<IAuthContext>(AuthContext);

  const { register, handleSubmit } = useForm<RegistrationSchemaType>();

  const navigate = useNavigate();
  const onSubmit: SubmitHandler<RegistrationSchemaType> = async (
    data: RegistrationSchemaType
  ) => {
    const obj = {
      storeName: data.storeName,
      longitude: data.longitude,
      latitude: data.latitude,
    } satisfies RegistrationSchemaType;

    await axios.post(
      "/store-owner/new-user",
      { username: authContext.idTokenData!["cognito:username"] },
      {
        headers: {
          Authorization: `Bearer ${authContext.token}`,
        },
      }
    );

    await axios.post(`/store-owner/new-store`, obj, {
      headers: {
        Authorization: `Bearer ${authContext.token}`,
      },
    });

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
          placeholder="Store name"
          {...register("storeName")}
        />
        <input
          className="border px-4 py-2 mb-2"
          placeholder="Latitude"
          type="number"
          {...register("longitude")}
        />
        <input
          className="border px-4 py-2 mb-2"
          placeholder="Longitude"
          type="number"
          {...register("latitude")}
        />
        <input
          className="cursor-pointer bg-[#545F71] text-white rounded-md h-11"
          type="submit"
          value="Create store"
        />
      </form>
    </div>
  );
}

import { useSearchParams } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// export async function loader({ request }: { request: Request }) {
//   const queryClient = new QueryClient();
//   const { searchParams } = new URL(request.url);
//   const ids = searchParams.get("list")?.split(",") ?? [];

//   await queryClient.prefetchQuery({
//     queryKey: ["compare_devices"],
//     queryFn: async (): Promise<Computer[]> => {
//       const computers: any[] = [];

//       await axios
//         .all(ids.map((id: string) => axios.get(`/devices?=${id}`)))
//         .then(
//           axios.spread(function (...res) {
//             computers.push(res);
//           }),
//         );

//       return computers;
//     },
//   });

//   return json({ dehydratedState: dehydrate(queryClient) });
// }

export default function Compare() {
  // const { dehydratedState } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const ids = searchParams.get("list")?.split(",") ?? [];

  const data = useQuery({
    queryKey: ["compare_devices"],
    // queryFn: async (): Promise<any> => {
    //   const response = await axios.get(`customer/device?deviceId=${ids.at(0)}`);
    //   return response;
    // },
    queryFn: async (): Promise<any> => {
      const computers = [];
      const response = await axios
        .all(
          ids.map((id: string) => axios.get(`customer/device?deviceId=${id}`)),
        )
        .then(
          axios.spread(function (...res) {
            console.log(res);
            // computers.push(re);
          }),
        );
    },
  });

  if (data.isLoading) return "Loading";

  return (
    <div className="flex space-x-4">
      {/* <div className="p-4 rounded-2xl">
        <div className="w-[256px] aspect-square flex justify-center items-center rounded-lg bg-gray-200 mb-4 self-center">
          <img src={placeholderIcon} alt="product image" />
        </div>
        <h1 className="font-bold text-lg text-center">{data.deviceName}</h1>
        <h2 className="font-medium text-lg mb-4 text-center">
          ${computer.price}
        </h2>
        <div className="flex space-x-12">
          <div className="w-fit font-medium">
            <p>Form factor: </p>
            <p>Processor manufacturer: </p>
            <p>Processor model: </p>
            <p>Memory type: </p>
            <p>Memory capacity: </p>
            <p>Storage type: </p>
            <p>Storage capacity: </p>
            <p>GPU manufacturer: </p>
            <p>GPU model: </p>
            <p>Operating system: </p>
          </div>
          <div className="w-fit">
            <p>{computer.formFactor} </p>
            <p>{computer.processorManufacturer}</p>
            <p>{computer.processorModel}</p>
            <p>{computer.memoryType}</p>
            <p>{computer.memoryMb}</p>
            <p>{computer.storageType}</p>
            <p>{computer.storageGb}</p>
            <p>{computer.gpuManufacturer}</p>
            <p>{computer.gpuModel}</p>
            <p>{computer.operatingSystem}</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}

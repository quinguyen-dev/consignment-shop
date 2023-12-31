import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import cautionIcon from "~/assets/caution.svg";
import dataIcon from "~/assets/data.svg";
import trashIcon from "~/assets/trash.svg";
import { TableView } from "~/components";
import { StoreReport } from "~/hooks/types";
import { useSiteManagerData } from "~/hooks/useSiteManagerData";
import { authenticator } from "~/services/auth.server";

// Loader to fetch the JSON token
export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
}

function StoresDataTable() {
  const navigate = useNavigate();
  const [deletePopupId, setDeletePopupId] = useState<string | null>(null);
  const [inputDeletePopupId, setDeleteInputPopupId] = useState("");
  const [deletePopupName, setDeletePopupName] = useState("");
  const loaderData = useLoaderData<typeof loader>();
  const managerData = useSiteManagerData(loaderData.token);

  const query = managerData.fetchReport();

  useEffect(() => {
    if (query.data !== undefined && deletePopupId !== null) {
      setDeletePopupName(
        query.data.storeBalances.filter(
          (store) => store.storeId == deletePopupId,
        )[0].storeName,
      );
    }
  }, [deletePopupId, query]);

  const columns = useMemo(() => {
    const helper = createColumnHelper<StoreReport>();
    return [
      helper.accessor("storeId", { header: "#" }),
      helper.accessor("storeName", { header: "Store Name" }),
      helper.accessor(
        (item) => {
          return `$${item.balance.toLocaleString()}`;
        },
        { header: "Balance" },
      ),
      helper.display({
        header: "",
        id: "viewDataColumn",
        cell: (props) => (
          <button
            onClick={() =>
              navigate(
                "/sr?" +
                  new URLSearchParams({
                    storeName: props.row.original.storeName,
                  }),
              )
            }
          >
            <img src={dataIcon} alt="View Data"></img>
          </button>
        ),
      }),
      helper.display({
        header: "",
        id: "trashColumn",
        cell: (props) => (
          <button
            onClick={() => {
              setDeletePopupId(props.row.original.storeId);
            }}
          >
            <img src={trashIcon} alt="Delete Store"></img>
          </button>
        ),
      }),
    ];
  }, []);

  return (
    <>
      <Modal
        isOpen={deletePopupId != null}
        onRequestClose={() => {
          setDeletePopupId(null);
        }}
        contentLabel={`Delete ${deletePopupId}?`}
        onAfterClose={() => setDeleteInputPopupId("")}
        className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"
        overlayClassName="fixed top-0 bottom-0 left-0 right-0 bg-black/50"
      >
        <div className="flex w-min flex-col space-y-2.5 rounded-lg bg-white p-6">
          <h1 className="text-xl font-bold text-black">
            Confirm this deletion?
          </h1>
          <label className="text-xl text-black">
            You are attempting to remove{" "}
            <span className="font-bold">{deletePopupName}</span>. To confirm
            deletion, please type in the store name exactly as it is below.
          </label>
          <input
            onChange={(event) => setDeleteInputPopupId(event.target.value)}
            placeholder={deletePopupName}
            className="w-full rounded-md p-3 text-gray-600 outline outline-1 outline-gray-600"
          />
          <div className="inline-flex space-x-2.5 rounded-md bg-red-300 p-3">
            <div className="w-[20px] self-center">
              <img src={cautionIcon} alt="Caution Icon" />
            </div>
            <label className="whitespace-nowrap text-base text-gray-600">
              Store deletion is an irreversible action. Please verify that this
              action is intended.
            </label>
          </div>
          <div className="flex flex-row space-x-2 self-end">
            <button
              onClick={() => setDeletePopupId(null)}
              className="rounded-md bg-white p-3 text-gray-600 outline outline-1 outline-gray-600"
            >
              Cancel
            </button>
            <button
              disabled={deletePopupName != inputDeletePopupId}
              onClick={() => {
                setDeletePopupId(null);
                managerData.remove.mutate(deletePopupId!);
              }}
              className="rounded-md bg-red-500 p-3 text-white disabled:opacity-50"
            >
              Delete store
            </button>
          </div>
        </div>
      </Modal>
      <TableView data={query.data?.storeBalances ?? []} columns={columns} />
    </>
  );
}

export default StoresDataTable;

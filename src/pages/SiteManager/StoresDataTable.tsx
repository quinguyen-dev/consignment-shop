import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {useEffect, useMemo, useState} from "react";
import {Store} from "@/hooks/types.ts";
import dataIcon from "@/assets/data.svg";
import trashIcon from "@/assets/trash.svg";
import cautionIcon from "@/assets/caution.svg";
import {useSiteManagerData} from "@/hooks/useSiteManagerData.ts";
import Modal from 'react-modal';

function StoresDataTable() {
    const [deletePopupId, setDeletePopupId] = useState<string | null>(null);
    const [inputDeletePopupId, setDeleteInputPopupId] = useState("");
    const [deletePopupName, setDeletePopupName] = useState("");

    const managerData = useSiteManagerData();
    const query = managerData.fetchAll();


  useEffect(() => {
      if (query.data !== undefined && deletePopupId !== null) {
          setDeletePopupName(query.data.stores.filter(store => store.storeId == deletePopupId)[0].storeName);
      }
  }, [deletePopupId ,query]);

    const columns = useMemo(() => {
    const helper = createColumnHelper<Store>();
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
        cell: (_) => (
          <button>
            <img src={dataIcon} alt="View Data"></img>
          </button>
        ),
      }),
      helper.display({
        header: "",
        id: "trashColumn",
        cell: (props) => (
          <button onClick={() => {
            setDeletePopupId(props.row.original.storeId);
          }}>
            <img src={trashIcon} alt="Delete Store"></img>
          </button>
        ),
      }),
    ];
  }, []);

  const table = useReactTable({
    data: query.data?.stores ?? useMemo(() => [], []),
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

    return (
        <>
            <Modal isOpen={deletePopupId != null} onRequestClose={() => {
                setDeletePopupId(null);
            }} contentLabel={`Delete ${deletePopupId}?`} onAfterClose={() => {
                setDeleteInputPopupId("");
            }} className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]" overlayClassName="fixed top-0 bottom-0 left-0 right-0 bg-black/50">
                <div className="rounded-lg bg-white p-6 flex flex-col space-y-2.5 w-min">
                    <h1 className="font-bold text-xl text-black">Confirm this deletion?</h1>
                    <label className="text-xl text-black">
                        You are attempting to remove <span className="font-bold">{deletePopupName}</span>. To confirm deletion, please type in the store name exactly as it is below.
                    </label>
                    <input onChange={(event) => setDeleteInputPopupId(event.target.value)}
                           placeholder={deletePopupName}
                           className="w-full rounded-md outline outline-1 outline-gray-600 text-gray-600 p-3"/>
                    <div className="inline-flex space-x-2.5 p-3 bg-red-300 rounded-md">
                        <div className="w-[20px] self-center">
                            <img src={cautionIcon} alt="Caution Icon"/>
                        </div>
                        <label className="text-base text-gray-600 whitespace-nowrap">Store deletion is an irreversible action. Please verify that this action is intended.</label>
                    </div>
                    <div className="self-end flex flex-row space-x-2">
                        <button onClick={() => setDeletePopupId(null)}
                                className="bg-white outline outline-1 rounded-md outline-gray-600 text-gray-600 p-3">Cancel</button>
                        <button
                            disabled={deletePopupName != inputDeletePopupId}
                            onClick={() => {
                                setDeletePopupId(null);
                                managerData.remove.mutate(deletePopupId!);
                            }}
                                className="bg-red-500 rounded-md text-white p-3 disabled:opacity-50">Delete store</button>
                    </div>
                </div>
            </Modal>

            <table className="mt-4 w-full">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b-2">
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-2 px-4 text-sm font-bold text-gray-900 text-left"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b-[1px]">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </>
    );
}

export default StoresDataTable;
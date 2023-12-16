import { useSearchParams } from "@remix-run/react";

type FilterItemProps = Pick<HTMLInputElement, "name" | "value"> & {
  checked?: boolean;
  text: string;
};

export function FilterItem({
  name,
  value,
  text, // defaultChecked,
}: FilterItemProps) {
  const [searchParams] = useSearchParams();
  const price = searchParams.get(name);

  return (
    <label>
      <input
        type="checkbox"
        name={name}
        value={value}
        className="mr-2"
        defaultChecked={price?.includes(value)}
      />
      {text}
    </label>
  );
}

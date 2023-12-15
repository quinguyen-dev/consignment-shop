type FilterItemProps = Pick<HTMLInputElement, "name" | "value"> & {
  text: string;
};

export function FilterItem({ name, value, text }: FilterItemProps) {
  return (
    <label>
      <input type="checkbox" name={name} value={value} className="mr-2" />
      {text}
    </label>
  );
}

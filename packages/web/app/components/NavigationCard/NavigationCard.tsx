export interface NavigationCardProps {
  onClick: () => void;
  image: string;
  headerText: string;
  descriptionText: string;
  selected?: boolean;
}

export function NavigationCard(props: NavigationCardProps) {
  const {
    onClick,
    image,
    headerText,
    descriptionText,
    selected = false,
  } = props;
  return (
    <button
      className={`border-1 flex w-full flex-row space-x-4 rounded-md border border-gray-600 px-4 py-3 hover:bg-gray-300 ${
        selected ? "bg-gray-300" : ""
      }`}
      onClick={onClick}
    >
      <img src={image} alt="placeholder" className="self-center" />
      <div className="flex flex-col items-start text-left">
        <h2 className="text-base font-semibold text-gray-600">{headerText}</h2>
        <h3 className="text-left text-sm text-black">{descriptionText}</h3>
      </div>
    </button>
  );
}

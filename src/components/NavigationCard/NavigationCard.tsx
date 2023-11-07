/**
 * Props for the navigation card component
 */
export interface NavigationCardProps {
    /**
     * Handler for what to do when the card is clicked
     */
    onClick: () => void;

    /**
     * The image to display in the card
     */
    image: string;

    /**
     * The header text to display in the card
     */
    headerText: string;

    /**
     * The description text to display in the card
     */
    descriptionText: string;

    /**
     * Whether the background of the card should be gray (e.g., selected). Defaults to false (not selected)
     */
    selected?: boolean;
}

/**
 * Creates a navigation card component, which takes up the full width of its parent, that allows for navigation
 * @param props the props to pass in, see the exported interface
 */
function NavigationCard(props: NavigationCardProps) {
    const {onClick, image, headerText, descriptionText, selected= false} = props;
    return (<button className={`px-4 py-3 rounded-md border border-1 border-gray-600 flex flex-row space-x-10 w-full hover:bg-gray-300 ${selected ? "bg-gray-300" : ""}`}
                    onClick={onClick}>
            <img src={image} alt="placeholder" className="self-center"/>
            <div className="flex flex-col items-start text-left">
              <h2 className="font-semibold text-base text-gray-600">
                  {headerText}
              </h2>
              <h3 className="text-sm text-black text-left">{descriptionText}</h3>
            </div>
          </button>);
}

export default NavigationCard;
import { Link } from "react-router-dom";

function NavigationBar() {
  return (
    <div className="flex flex-row space-x-2 h-12">
      <div className="px-4 py-3 border text-gray-00 min-w-[256px] text-center">
        Website Logo / Name
      </div>
      <input
        className="border-2 px-4 flex-1"
        placeholder="Search for items"
        type="search"
      />
      <Link
        className="px-4 border-2 rounded-md text-center flex items-center"
        to="/login"
      >
        Login / Sign up
      </Link>
    </div>
  );
}

export { NavigationBar };

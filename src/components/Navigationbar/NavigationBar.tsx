import { useContext } from "react";
import { AuthContext, type IAuthContext } from "react-oauth2-code-pkce";
import { Link } from "react-router-dom";

export function NavigationBar() {
  const { token, loginInProgress, logOut, login } =
    useContext<IAuthContext>(AuthContext);

  return (
    <div className="flex h-12 flex-row space-x-2">
      <Link
        to="/"
        className="text-gray-00 min-w-[256px] border px-4 py-3 text-center"
      >
        Website Logo / Name
      </Link>
      <input
        className="flex-1 border-2 px-4"
        placeholder="Search for items"
        type="search"
      />
      {token !== "" && (
        <Link
          to="/account"
          className="flex items-center rounded-md border-2 px-4 text-center"
        >
          Account
        </Link>
      )}
      <button
        className="flex items-center rounded-md border-2 px-4 text-center"
        onClick={() => {
          if (token !== "") {
            logOut();
          } else {
            login(
              JSON.stringify({
                returnTo: location.pathname,
              }),
            );
          }
        }}
      >
        {token !== "" || loginInProgress ? "Log Out" : "Log In"}
      </button>
    </div>
  );
}

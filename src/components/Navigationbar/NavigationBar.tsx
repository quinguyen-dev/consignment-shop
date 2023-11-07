import { useContext } from "react";
import { AuthContext, type IAuthContext } from "react-oauth2-code-pkce";
import { Link } from "react-router-dom";

export function NavigationBar() {
  const authContext = useContext<IAuthContext>(AuthContext);

  return (
    <div className="flex flex-row space-x-2 h-12">
      <Link
        to="/"
        className="px-4 py-3 border text-gray-00 min-w-[256px] text-center"
      >
        Website Logo / Name
      </Link>
      <input
        className="border-2 px-4 flex-1"
        placeholder="Search for items"
        type="search"
      />
      {authContext.token === "" ||
        (!authContext.loginInProgress && (
          <Link
            to="/account"
            className="px-4 border-2 rounded-md text-center flex items-center"
          >
            Account
          </Link>
        ))}
      <button
        className="px-4 border-2 rounded-md text-center flex items-center"
        onClick={() => {
          if (authContext.token !== "") {
            authContext.logOut();
          } else {
            authContext.login(
              JSON.stringify({
                returnTo: location.pathname,
              }),
            );
          }
        }}
      >
        {authContext.token !== "" || authContext.loginInProgress
          ? "Log Out"
          : "Log In"}
      </button>
    </div>
  );
}

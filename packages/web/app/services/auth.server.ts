import { jwtDecode } from "jwt-decode";
import { Authenticator } from "remix-auth";
import { OAuth2Strategy } from "remix-auth-oauth2";
import { sessionStorage } from "~/services/session.server";

interface User {
  readonly username: string;
  readonly token: string;
}

/**
 * Function to update the redirect URL stored in the package, enabling automated discovery
 * @param newRedirectUrl
 */
export function setRedirectUrl(newRedirectUrl: string) {
  authenticator.unuse("oauth2");

  authenticator.use(
    new OAuth2Strategy(
      {
        authorizationURL:
          "https://cs509-dev-2023-fall.auth.us-east-2.amazoncognito.com" +
          "/oauth2/authorize",
        tokenURL:
          "https://cs509-dev-2023-fall.auth.us-east-2.amazoncognito.com" +
          "/oauth2/token",
        clientID: "2t49b07b6dqou0c6ibqpnbjchb",
        clientSecret: "dd0rlkvdpqtl304ftv8mqmlfvkfoffmrdcgpsq8o10uh0bmpnbd",
        callbackURL: newRedirectUrl,
        scope: "openid profile email",
      },
      async ({ accessToken }) => {
        return {
          username: jwtDecode<Record<string, string>>(accessToken).username,
          token: accessToken,
        } satisfies User;
      },
    ),
    "oauth2",
  );
}

export const authenticator = new Authenticator<User>(sessionStorage);

setRedirectUrl("");

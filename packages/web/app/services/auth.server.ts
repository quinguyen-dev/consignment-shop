import { Authenticator } from "remix-auth";
import { OAuth2Strategy } from "remix-auth-oauth2";
import { sessionStorage } from "~/services/session.server";

interface User {
    readonly token: string;
}

/**
 * Function to update the redirect URL stored in the package, enabling automated discovery
 * @param newRedirectUrl 
 */
export function setRedirectUrl(newRedirectUrl: string) {
    authenticator.unuse("oauth2");

    authenticator.use(new OAuth2Strategy({
        authorizationURL: "https://cs509-dev-2023-fall.auth.us-east-2.amazoncognito.com" + "/oauth2/authorize",
    tokenURL: "https://cs509-dev-2023-fall.auth.us-east-2.amazoncognito.com" + "/oauth2/token",
    clientID: "63gndti4mq9kg1p3ibuu6nr1k2",
    clientSecret: "1ou0iitg4pseunkh7v6aled6bifla1d7h1gnn2sa256jv3offan2",
        callbackURL: newRedirectUrl + "auth/callback/",
        scope: "openid profile email"
    }, async ({
        accessToken,
        refreshToken,
        extraParams,
        profile,
        context,
        request,
      }) => {
        return {
            token: accessToken
        } satisfies User;
    }), "oauth2")
}

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<User>(sessionStorage);

// Provide an initial state for the redirect URL
setRedirectUrl("");
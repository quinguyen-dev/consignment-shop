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
    clientID: "4hj4ava71f62lr5uq49tqaoeht",
    clientSecret: "bsaprf7o93mj2v41b3nct0vb47hdagfi1ade0d58a40fu894r26",
        callbackURL: newRedirectUrl,
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
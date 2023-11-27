import { Authenticator } from "remix-auth";
import { OAuth2Strategy } from "remix-auth-oauth2";
import { sessionStorage } from "~/services/session.server";
import { Config } from "sst/node/config";

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
        authorizationURL: process.env.COGNITO_BASE_URL + "/login",
        tokenURL: process.env.COGNITO_BASE_URL + "/oauth2/token",
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
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

authenticator.use(new OAuth2Strategy({
    authorizationURL: process.env.COGNITO_BASE_URL + "/oauth2/authorize",
    tokenURL: process.env.COGNITO_BASE_URL + "/oauth2/token",
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "",
    scope: "openid profile email aws.cognito.signin.user.admin"
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
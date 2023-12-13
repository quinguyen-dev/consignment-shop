declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_BASE_URL: string;
    readonly COGNITO_BASE_URL: string;
    readonly CLIENT_ID: string;
    readonly CLIENT_SECRET: string;
  }
}

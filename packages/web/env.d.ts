declare namespace NodeJS {
  /**
   * Override types for process.env
   */
  interface ProcessEnv {
    /**
     * The URL to use as the API base
     */
    readonly API_BASE_URL: string;
    /**
     * The URL to use for the AWS Cognito OAuth flow
     */
    readonly COGNITO_BASE_URL: string;

    /**
     * The client ID to use for the cognito app
     */
    readonly CLIENT_ID: string;

    /**
     * The client secret to use for the cognito app
     */
    readonly CLIENT_SECRET: string;
  }
}

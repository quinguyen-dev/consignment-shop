import {
    Links,
    Meta,
    Outlet,
    Scripts,
  } from "@remix-run/react";
import React from "react";
  
  export default function App() {
    return (
      <html>
        <head>
          <Meta />
          <Links />
        </head>
        <body>
          <h1>Hello world!</h1>
          <Outlet />
  
          <Scripts />
        </body>
      </html>
    );
  }
  
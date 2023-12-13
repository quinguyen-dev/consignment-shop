import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import axios from "axios";
import ReactModal from "react-modal";
import stylesheet from "~/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

/* Set React Modal base element */
ReactModal.setAppElement("body");

/* Axios default setup */
axios.defaults.baseURL =
  "https://vo8vlr6cyc.execute-api.us-east-2.amazonaws.com/dev"; // todo dockerize

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </div>
      </body>
    </html>
  );
}

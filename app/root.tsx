import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ClerkApp } from "@clerk/remix";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import Footer from "./components/Footer";
import Header from "./components/Header";

import "./tailwind.css";

export const meta: MetaFunction = () => {
  return [
    { title: "Pollo" },
    { name: "description", content: "Simple Real-Time Voting" },
  ];
};

export const loader: LoaderFunction = (args) => rootAuthLoader(args);

function App() {
  return (
    <html data-theme="dark" lang="en" className="h-[100%] w-[100%] fixed overflow-y-auto">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-[100%] w-[100%] fixed overflow-y-auto">
        <Header title={"Pollo"} />
        <div className="flex flex-row items-center justify-center min-h-[calc(100%-114px)]">
          <Outlet />
        </div>
        <Footer />

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default ClerkApp(App);

import { Link, isRouteErrorResponse, useRouteError } from "@remix-run/react";

export default function FourOhFour() {
  const error = useRouteError();

  // Default errors
  let status = 500;
  let message =
    "Something wen't wrong! Please sign out, back in, and give it another try!";

  // If error response is sent, use correct errors
  if (isRouteErrorResponse(error)) {
    message = error.statusText;
    status = error.status;
  }

  return (
    <span className="text-center">
      <h1 className="text-5xl font-bold m-2">Error {status}</h1>
      <h1 className="text-5xl font-bold m-2">{message}</h1>
      <h2 className="text-2xl font-bold m-2">
        If you believe you reached this page in error, please file an issue{" "}
        <a
          href="https://github.com/atridadl/sprintpadawan/issues/new"
          className="link link-secondary"
        >
          here
        </a>
      </h2>
      <Link
        about="Back to home."
        to="/"
        className="btn btn-secondary normal-case text-xl m-2"
      >
        Back to Home
      </Link>
    </span>
  );
}

import { Link, isRouteErrorResponse, useRouteError } from "@remix-run/react";

export default function FourOhFour() {
  const error = useRouteError();

  // If error response is sent, use correct errors
  if (isRouteErrorResponse(error)) {
    return (
      <span className="text-center">
      <h1 className="text-5xl font-bold m-2">Error {error.status}</h1>
      <h1 className="text-5xl font-bold m-2">{error.statusText}</h1>
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
  } else if (error instanceof Error) {
    return (
    <span className="text-center">
      <h1 className="text-5xl font-bold m-2">Error 500</h1>
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
  } else {
    return(
    <span className="text-center">
      <h1 className="text-5xl font-bold m-2">Error {error.status}</h1>
      <h1 className="text-5xl font-bold m-2">{error.statusText}</h1>
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
    </span>)
  }
}

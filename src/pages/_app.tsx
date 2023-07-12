import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Footer from "~/components/Footer";
import Navbar from "~/components/Navbar";
import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeStart", () => {
      setPageLoading(true);
    });

    router.events.on("routeChangeComplete", () => {
      setPageLoading(false);
    });

    return () => {
      router.events.off("routeChangeStart", () => {
        setPageLoading(true);
      });

      router.events.off("routeChangeComplete", () => {
        setPageLoading(false);
      });
    };
  }, [router.events]);

  return (
    <SessionProvider session={ session }>
      <div className="block h-[100%]">
        <Navbar title="Sprint Padawan" />
        <div className="flex flex-row items-center justify-center min-h-[calc(100%-114px)]">
          { pageLoading ? (
            <span className="loading loading-dots loading-lg"></span>
          ) : (
            <Component { ...pageProps } />
          ) }
        </div>
        <Footer />
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);

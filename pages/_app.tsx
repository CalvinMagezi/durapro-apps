import "../styles/globals.css";
import "nprogress/nprogress.css";
import type { AppProps } from "next/app";
import { ChakraProvider, extendTheme, Skeleton } from "@chakra-ui/react";
import Router from "next/router";
import NProgress from "nprogress";
import { RecoilRoot } from "recoil";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Head from "next/head";
import { useEffect, useState } from "react";
import { DBProvider } from "@/contexts/DBContext";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(false);

  const handleRouteStart = () => {
    NProgress.start();
    setLoading(true);
  };
  const handleRouteDone = () => {
    NProgress.done();
    setLoading(false);
  };

  useEffect(() => {
    Router.events.on("routeChangeStart", handleRouteStart);
    Router.events.on("routeChangeComplete", handleRouteDone);
    Router.events.on("routeChangeError", handleRouteDone);

    return () => {
      // Make sure to remove the event handler on unmount!
      Router.events.off("routeChangeStart", handleRouteStart);
      Router.events.off("routeChangeComplete", handleRouteDone);
      Router.events.off("routeChangeError", handleRouteDone);
    };
  }, []);

  const theme = extendTheme({
    colors: {
      brand: {
        100: "#273e87",
        200: "#ee2f26",
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <ChakraProvider theme={theme}>
          <Toaster />
          <Head>
            <meta charSet="utf-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta
              name="viewport"
              content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
            />
            <meta
              name="description"
              content="Durapro Solutions Suite Of Applications"
            />
            <title>DP Apps</title>
            <link
              href="/icons/favicon-16x16.png"
              rel="icon"
              type="image/png"
              sizes="16x16"
            />
            <link
              href="/icons/favicon-32x32.png"
              rel="icon"
              type="image/png"
              sizes="32x32"
            />
            <link rel="apple-touch-icon" href="/icons/favicon-32x32.png"></link>
            <meta name="theme-color" content="#273e87" />
          </Head>
          <DBProvider>
            <Skeleton
              isLoaded={!loading}
              width="100vw"
              fadeDuration={1}
              className="z-[99] min-h-screen"
            >
              <Component {...pageProps} />
            </Skeleton>
          </DBProvider>
        </ChakraProvider>
      </RecoilRoot>
    </QueryClientProvider>
  );
}

export default MyApp;

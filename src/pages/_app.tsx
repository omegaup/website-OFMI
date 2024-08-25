import "@/styles/globals.css";
import "@/styles/react-calendar.css";
import { Provider } from "jotai";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Navbar } from "@/components/navbar";

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <title>OFMI</title>
        <link rel="icon" href="lightLogo.svg" />
      </Head>
      <Provider>
        <Navbar />
        <Component {...pageProps} />
      </Provider>
    </SessionProvider>
  );
}

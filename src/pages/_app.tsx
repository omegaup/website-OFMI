import { Navbar } from "@/components/navbar";
import "@/styles/globals.css";
import { Provider } from "jotai";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <title>OFMI</title>
      </Head>
      <Provider>
        <Component {...pageProps} />
      </Provider>
    </SessionProvider>
  );
}

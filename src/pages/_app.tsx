import "@/styles/globals.css";
import { Provider } from "jotai";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <Provider>
      <Head>
        <title>OFMI</title>
      </Head>
      <Component {...pageProps} />
    </Provider>
  );
}

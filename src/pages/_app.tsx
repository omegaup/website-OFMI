import "@/styles/globals.css";
import { Provider } from "jotai";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <SessionProvider session={pageProps.session}>
      <Provider>
        <Component {...pageProps} />;
      </Provider>
    </SessionProvider>
  );
}

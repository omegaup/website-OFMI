import { Navbar } from "@/components/navbar";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document(): JSX.Element {
  return (
    <Html lang="en">
      <Head>
        <Navbar />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

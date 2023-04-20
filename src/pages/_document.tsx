import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="application-name" content="Sprint Padawan" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sprint Padawan" />
        <meta name="description" content="Plan. Sprint. Repeat." />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#1F2937" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#1F2937" />

        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://sprintpadawan.dev" />
        <meta name="twitter:title" content="Sprint Padawan" />
        <meta name="twitter:description" content="Plan. Sprint. Repeat." />
        <meta
          name="twitter:image"
          content="https://sprintpadawan.dev/android-chrome-192x192.png"
        />
        <meta name="twitter:creator" content="@atridadl" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Sprint Padawan" />
        <meta property="og:description" content="Plan. Sprint. Repeat." />
        <meta property="og:site_name" content="Sprint Padawan" />
        <meta property="og:url" content="https://sprintpadawan.dev" />
        <meta
          property="og:image"
          content="https://sprintpadawan.dev/icons/apple-touch-icon.png"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

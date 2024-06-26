// pages/_document.js

import { ColorModeScript } from "@chakra-ui/react";
import NextDocument, { Html, Head, Main, NextScript } from "next/document";
import theme from "../styles/theme";

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/icons/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/icons/favicon-16x16.png"
          />

          <link rel="apple-touch-icon" href="/logo.png" />
          <link
            rel="apple-touch-icon"
            sizes="152x152"
            href="/icons/touch-icon-ipad.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/icons/touch-icon-iphone-retina.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="167x167"
            href="/icons/touch-icon-ipad-retina.png"
          />

          <meta name="application-name" content="DP Apps" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="DP Apps" />
          <meta
            name="description"
            content="Durapro Solutions Suite Of Applications"
          />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />

          <meta name="msapplication-TileColor" content="#273e87" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="theme-color" content="#273e87" />

          <meta name="twitter:card" content="summary" />
          <meta name="twitter:url" content="https://durapro-apps.vercel.app" />
          <meta name="twitter:title" content="DP Apps" />
          <meta
            name="twitter:description"
            content="Durapro Solutions Suite Of Applications"
          />
          <meta
            name="twitter:image"
            content="https://durapro-apps.vercel.app/icons/android-chrome-192x192.png"
          />
          <meta name="twitter:creator" content="@calvinmagezi" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="DP Apps" />
          <meta
            property="og:description"
            content="Durapro Solutions Suite Of Applications"
          />
          <meta property="og:site_name" content="DP Apps" />
          <meta property="og:url" content="https://durapro-apps.vercel.app" />
          <meta
            property="og:image"
            content="https://durapro-apps.vercel.app/icons/apple-touch-icon.png"
          />

          <link
            rel="apple-touch-startup-image"
            href="/images/apple_splash_2048.png"
            sizes="2048x2732"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/apple_splash_1668.png"
            sizes="1668x2224"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/apple_splash_1536.png"
            sizes="1536x2048"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/apple_splash_1125.png"
            sizes="1125x2436"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/apple_splash_1242.png"
            sizes="1242x2208"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/apple_splash_750.png"
            sizes="750x1334"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/apple_splash_640.png"
            sizes="640x1136"
          />
        </Head>
        <body>
          {/* 👇 Here's the script */}
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

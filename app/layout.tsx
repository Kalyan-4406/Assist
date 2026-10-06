import type { Metadata } from "next";
import globalCss from "./globals.css?inline";
import realisticCss from "./realistic.css?inline";
import { Header, Footer, DemoBanner } from "@/components/shell";
import { demoHidden } from "@/lib/data";
export const metadata: Metadata = {
  title: {
    default: "Campus Build Race | Build your first AI project",
    template: "%s | Campus Build Race",
  },
  description:
    "Choose your college, claim a free workshop seat and build your first AI project in 60 minutes. A NxtWave Growth Challenge simulation.",
  icons: { icon: "/favicon.svg" },
};
export const dynamic = "force-dynamic";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hideDemo = await demoHidden();
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{__html: globalCss}} />
        <style dangerouslySetInnerHTML={{__html: realisticCss}} />
        <link rel="preload" href="/fonts/SpaceGrotesk.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <meta name="description" content="Find your college and build your first AI project in a free online workshop. Campus Build Race is a NxtWave Growth Challenge simulation." />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <DemoBanner hidden={hideDemo} />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import "./globals.css";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://www.repopaglu.in"),
  title: {
    default: "RepoPaglu - AI GitHub Automation, API Docs & README Generator",
    template: "%s | RepoPaglu"
  },
  description: "Automate your developer workflow with RepoPaglu. Generate beautiful API documentation, READMEs, and analyze tech stacks instantly from any GitHub repository.",
  keywords: [
    "github automation",
    "api docs generator",
    "readme generator",
    "tech stack analyzer",
    "developer tools",
    "ai documentation",
    "repopaglu",
    "github repository analyzer",
    "automatic documentation",
    "code analysis",
    "test case generator"
  ],
  authors: [{ name: "Rohan", url: "https://x.com/rjha72" }],
  creator: "Rohan",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_IN"],

    url: "https://www.repopaglu.in",
    title: "RepoPaglu - AI GitHub Automation Tools",
    description: "Generate API docs, READMEs, and analyze tech stacks with AI.",
    siteName: "RepoPaglu",
    images: [
      {
        url: "/image.png", 
        width: 1200,
        height: 630,
        alt: "RepoPaglu Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RepoPaglu - AI GitHub Automation",
    description: "Generate API docs, READMEs, and analyze tech stacks with AI.",
    images: ["/image.png"],
    creator: "@rjha72",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/RepoLogo.png",
    shortcut: "/RepoLogo.png",
    apple: "/RepoLogo.png", 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">

        <div className="min-h-screen flex flex-col">
          <main className="flex-1 w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}






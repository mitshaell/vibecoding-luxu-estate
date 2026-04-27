import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Luxe Estate",
  description: "Premium Real Estate Application",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  return (
    <html lang={locale} className="h-full antialiased">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`min-h-full flex flex-col font-display bg-background-light text-nordic-dark selection:bg-mosque selection:text-white`}>
        {children}
      </body>
    </html>
  );
}

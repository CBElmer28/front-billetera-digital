import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";

const geistSans = Geist({ 
  variable: "--font-geist-sans", 
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({ 
  variable: "--font-geist-mono", 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: "Pixel Money - Tu Billetera Digital Inteligente",
  description: "Gestiona tus finanzas de forma fácil, segura e inteligente con Pixel Money",
  keywords: "billetera digital, finanzas, dinero, transferencias, préstamos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-full`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
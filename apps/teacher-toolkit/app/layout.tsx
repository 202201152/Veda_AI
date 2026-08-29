import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "VedaAI — AI Teacher's Toolkit",
  description: 'Assessment extraction, answer mapping, and AI grading toolkit for teachers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#EAEDF2] text-[#0F172A] h-full h-[100dvh] overflow-hidden">
        {children}
      </body>
    </html>
  );
}

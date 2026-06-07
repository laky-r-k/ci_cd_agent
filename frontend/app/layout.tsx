import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'TraceFix AI — Self-Improving CI/CD Failure Analysis',
  description:
    'AI-powered CI/CD failure diagnosis platform that learns from outcomes, identifies weak spots, and automatically improves its diagnostic prompts for higher accuracy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-background text-white antialiased">
        <Sidebar />
        <Navbar />
        <main className="lg:ml-[260px] min-h-screen">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}

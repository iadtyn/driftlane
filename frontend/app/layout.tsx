import '../styles/globals.css';
import { ReactNode } from 'react';
import { Prompt } from 'next/font/google';

const prompt = Prompt({
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'Driftline',
  description: 'Personalized adventure recommendations powered by AI',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/logo.png" type="image/png" />

        {/* FontAwesome for icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className={`${prompt.className} bg-gray-50 text-gray-800`}>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}

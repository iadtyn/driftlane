import '../styles/globals.css';
import { ReactNode } from 'react';

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

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-50 text-gray-800 font-sans">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}

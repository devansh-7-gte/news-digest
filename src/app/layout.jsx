import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata = {
  title: 'SwiftIQ | Autonomous AI News Intelligence',
  description: 'SwiftIQ delivers high-density, AI-summarized market news straight to your inbox. Autonomous agents scrape, classify, and summarize market-moving headlines in seconds.',
  icons: {
    icon: '/logo.png?v=3',
    shortcut: '/logo.png?v=3',
    apple: '/logo.png?v=3',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${plusJakartaSans.variable}`}>
      <head>
        <link rel="icon" href="/logo.png?v=3" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/logo.png?v=3" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png?v=3" />
      </head>
      <body className="font-sans bg-brand-dark text-white antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}


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
  title: 'AI News Digest | market-moving news simplified',
  description: 'AI-powered, high-density market news aggregation and summarization. Autonomous agents scrape, classify, and summarize the latest news straight to your inbox.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${plusJakartaSans.variable}`}>
      <body className="font-sans bg-brand-dark text-white antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}


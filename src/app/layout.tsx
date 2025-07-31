import { Provider } from '@/components/ui/provider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AstroFlora AI - Advanced Biological Intelligence',
  description: 'Your premier AI assistant for plant biology, genetics, biotechnology, and life sciences. Get expert insights on botanical research, genetic analysis, and biological systems.',
  keywords: 'biology, genetics, plant science, biotechnology, AI assistant, botanical research, life sciences',
  authors: [{ name: 'AstroFlora Research Labs' }],
  creator: 'AstroFlora AI',
  publisher: 'AstroFlora Research Labs',
  robots: 'index, follow',
  openGraph: {
    title: 'AstroFlora AI - Advanced Biological Intelligence',
    description: 'Your premier AI assistant for plant biology, genetics, biotechnology, and life sciences.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AstroFlora AI - Advanced Biological Intelligence',
    description: 'Your premier AI assistant for plant biology, genetics, biotechnology, and life sciences.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}

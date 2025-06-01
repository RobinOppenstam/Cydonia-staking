import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '../providers/Web3Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cydonia Protocol - Cyberpunk DeFi Staking',
  description: 'Stake ETH, USDT, USDC, and Cydonia tokens for dynamic rewards in our cyberpunk-themed DeFi protocol.',
  keywords: 'DeFi, staking, ethereum, cydonia, cryptocurrency, cyberpunk',
  authors: [{ name: 'Cydonia Protocol Team' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
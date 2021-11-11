import type { AppProps } from 'next/app';
import React from 'react';
import '../../styles/globals.css';
import { ClientContext, ClientProvider } from '../components/ClientProvider';

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ClientProvider>
      <Component {...pageProps} />
    </ClientProvider>
  );
}
export default App
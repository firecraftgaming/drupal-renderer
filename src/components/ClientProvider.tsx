import React, { useEffect, useMemo, useRef, useState } from "react";
import { Client } from "../lib/api";

export const ClientContext = React.createContext<{
  client: Client | null;
}>({
  client: null
});

export const ClientProvider: React.FC = ({
  children,
}) => {
  const [client, setClient] = useState<Client | null>(null);
  useEffect(() => {
    if (!client) setClient(new Client()); else (window as any).client = client;
  }, [client]);

  return (
    <ClientContext.Provider
      value={{
        client
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};
import useUser from "@/hooks/useUser";
import { ReactNode, createContext, useContext, useEffect } from "react";

type dbContextType = {};

const dbContextDefaultValues: dbContextType = {};

const DBContext = createContext<dbContextType>(dbContextDefaultValues);

type Props = {
  children: ReactNode;
};

export function DBProvider({ children }: Props) {
  const { profile, setProfile, user, manualFetch } = useUser();

  useEffect(() => {
    if (!user) return;

    if ((user && !profile) || (user && profile === null)) {
      manualFetch();
    }
  }, [user, profile]);

  const value = {};
  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}

export function useDB() {
  return useContext(DBContext);
}

import { UserPermissionsState } from "@/atoms/ProfileAtom";
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import { ReactNode, createContext, useContext, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useRecoilState } from "recoil";

type dbContextType = {
  permissions?: string[];
};

const dbContextDefaultValues: dbContextType = {};

const DBContext = createContext<dbContextType>(dbContextDefaultValues);

type Props = {
  children: ReactNode;
};

export function DBProvider({ children }: Props) {
  const { profile, setProfile, user, manualFetch } = useUser();
  const [permissions, setPermissions] = useRecoilState(UserPermissionsState);
  const permissionsFetched = useRef(false);

  const fetchUserPermissions = async () => {
    if (!user || !profile) return;

    const { data, error } = await supabase
      .from("role_permission")
      .select("*, permission_id(*)")
      .eq("role_id", profile.role_id);

    if (error) {
      console.log(error);
      toast.error("Error fetching user permissions, please re-login", {
        duration: 5000,
      });
      return;
    }

    if (data) {
      const filtered_to_string_array = data.map(
        (item) => item.permission_id.title
      );
      setPermissions(filtered_to_string_array);
    } else {
      setPermissions([]);
      toast.error(
        "User role has no assigned permissions, please contact admin",
        {
          duration: 5000,
        }
      );
    }
  };

  useEffect(() => {
    if (!user) return;

    if ((user && !profile) || (user && profile === null)) {
      manualFetch();
    }
  }, [user, profile]);

  useEffect(() => {
    if (!profile) return;
    if (permissions && permissions.length > 0) return;
    if (permissionsFetched.current) return;
    fetchUserPermissions();
    permissionsFetched.current = true;
  }, [profile, permissions]);

  const value = {
    permissions,
  };
  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}

export function useDB() {
  return useContext(DBContext);
}

import { profileAtom } from "@/atoms/ProfileAtom";
import { supabase } from "@/lib/supabaseClient";
import { ProfileType } from "@/typings";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useRecoilState } from "recoil";

const useUser = () => {
  const [profile, setProfile] = useRecoilState(profileAtom);

  const router = useRouter();

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  };

  const { data: user, isLoading: loadingUser } = useQuery(
    ["current_user"],
    fetchUser
  );

  const manualFetch = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();

    if (error || !data) {
      console.log(error);
      toast.error("Error retrieving user details. Please login again.", {
        duration: 3000,
      });
      router.push("/");
    } else {
      const p = data as ProfileType;
      setProfile(p);
    }

    return;
  };

  return {
    profile,
    setProfile,
    fetchUser,
    user,
    loadingUser,
    manualFetch,
  };
};

export default useUser;

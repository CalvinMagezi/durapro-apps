import Image from "next/image";
import { useRecoilState } from "recoil";
import { AuthAtom } from "@/atoms/ProfileAtom";
import useUser from "@/hooks/useUser";
import { useEffect } from "react";
import AuthenticationForms from "@/components/forms/AuthenticationForms";
import { Grid, GridItem, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { FaSignOutAlt } from "react-icons/fa";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function Home() {
  const [authenticated, setAuthenticated] = useRecoilState(AuthAtom);
  const { user, manualFetch, setProfile, profile } = useUser();

  const logout = async () => {
    await supabase.auth
      .signOut()
      .then(() => {
        setProfile(null);
        toast.success("Successfully logged out", { duration: 3000 });
        setAuthenticated(false);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error logging out, please try again", { duration: 3000 });
      });
  };

  useEffect(() => {
    if (!user) return;

    if (user) {
      manualFetch();
      setAuthenticated(true);
    }
  }, [user]);

  console.log(profile);
  return (
    <div>
      {!authenticated ? (
        <div>
          <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-white text-black">
            <main className="flex flex-col items-center justify-center flex-1 w-full px-20 text-center">
              <Image
                priority
                src="/logo.png"
                width="300"
                height="150"
                alt="DP"
              />

              <div className="flex items-center justify-around max-w-4xl mt-6 sm:w-full">
                <AuthenticationForms />
              </div>
            </main>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto p-5 flex flex-col justify-between h-full min-h-screen">
          <main className="flex w-full flex-1 flex-col items-center justify-center lg:px-20 text-center">
            <Image priority src="/logo.png" width="300" height="150" alt="DP" />
            <Heading size="lg" className="text-center mt-10">
              Select Application
            </Heading>
            <Grid className="grid-cols-1 md:grid-cols-2 gap-8 mt-6 p-3 items-center">
              {profile?.role === "admin" && (
                <GridItem>
                  <Link href="/apps/commission" passHref>
                    <div className=" w-full rounded-xl border hover:border-[#273e87] p-6 text-left hover:text-[#273e87] focus:text-[#273e87] cursor-pointer">
                      <h3 className="text-2xl font-bold">
                        Commission Application &rarr;
                      </h3>
                      <p className="mt-4 text-xl">
                        Access the commission tracker application.
                      </p>
                    </div>
                  </Link>
                </GridItem>
              )}
              <GridItem>
                <Link href="/apps/cashback_feedback" passHref>
                  <div className=" w-full rounded-xl border hover:border-[#273e87] p-6 text-left hover:text-[#273e87] focus:text-[#273e87] cursor-pointer">
                    <h3 className="text-2xl font-bold">
                      Cashback Feedback Application &rarr;
                    </h3>
                    <p className="mt-4 text-xl">
                      Access the cashback feedback application.
                    </p>
                  </div>
                </Link>
              </GridItem>
            </Grid>
          </main>

          <footer className="flex h-24 w-full items-center justify-center border-t mt-10">
            <div
              onClick={logout}
              className="flex items-center space-x-4 text-xl cursor-pointer transition duration-100 ease-in-out"
            >
              <p>Sign Out </p>
              <FaSignOutAlt />
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}

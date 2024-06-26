import FirstLoginModal from "@/components/modals/cashback_feedback/FirstLoginModal";
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import { Grid, GridItem, Heading } from "@chakra-ui/react";
import { SignOut } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

function AppsChoicesPage() {
  const { user, manualFetch, setProfile, profile } = useUser();
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  const allowedEmails = [
    "molly.ngute@tilemarket.co.ug",
    "daniel.musinguzi@durapro.co.ug",
    "bob.kugonza@durapro.co.ug",
    "gregmagezi@gmail.com",
    "greg.magezi@durapro.co.ug",
    "hadija.nahara@durapro.co.ug",
    "calvin.magezi@mts-africa.tech",
  ];

  const logout = async () => {
    await supabase.auth
      .signOut()
      .then(() => {
        setProfile(null);
        toast.success("Successfully logged out", { duration: 3000 });
        router.push("/");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error logging out, please try again", {
          duration: 3000,
        });
      });
  };

  useEffect(() => {
    if (!profile) return;

    if (profile.role === "admin" || allowedEmails.includes(profile.email)) {
      setHasAccess(true);
    }
  }, []);
  return (
    <div className="mx-auto flex h-full min-h-screen max-w-6xl flex-col justify-between p-5">
      <main className="flex w-full flex-1 flex-col items-center justify-center text-center lg:px-20">
        <Image priority src="/logo.png" width="300" height="150" alt="DP" />
        <Heading size="lg" className="mt-10 text-center">
          Select Application
        </Heading>
        {profile && (
          <>
            <Grid className="mt-6 grid-cols-1 items-center gap-8 p-3 md:grid-cols-2">
              {allowedEmails.includes(profile.email) && (
                <>
                  {/* <GridItem>
                <Link href="/apps/commission" passHref>
                  <div className=" w-full cursor-pointer rounded-xl border p-6 text-left hover:border-[#273e87] hover:text-[#273e87] focus:text-[#273e87]">
                    <h3 className="text-2xl font-bold">
                      Commission Application &rarr;
                    </h3>
                    <p className="mt-4 text-xl">
                      Access the commission tracker application.
                    </p>
                  </div>
                </Link>
              </GridItem> */}
                  <GridItem>
                    <Link href="/apps/cashback-admin" passHref>
                      <div className=" w-full cursor-pointer rounded-xl border p-6 text-left hover:border-[#273e87] hover:text-[#273e87] focus:text-[#273e87]">
                        <h3 className="text-2xl font-bold">
                          Cashback Admin Application &rarr;
                        </h3>
                        <p className="mt-4 text-xl">
                          Access the cashback admin application.
                        </p>
                      </div>
                    </Link>
                  </GridItem>
                  {hasAccess && (
                    <GridItem>
                      <Link href="/apps/service-tracking" passHref>
                        <div className=" w-full cursor-pointer rounded-xl border p-6 text-left hover:border-[#273e87] hover:text-[#273e87] focus:text-[#273e87]">
                          <h3 className="text-2xl font-bold">
                            Servicing Tracking Application &rarr;
                          </h3>
                          <p className="mt-4 text-xl">
                            Access the service tracking application.
                          </p>
                        </div>
                      </Link>
                    </GridItem>
                  )}
                </>
              )}
              <GridItem>
                <Link href="/apps/cashback_feedback" passHref>
                  <div className=" w-full cursor-pointer rounded-xl border p-6 text-left hover:border-[#273e87] hover:text-[#273e87] focus:text-[#273e87]">
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
          </>
        )}
      </main>
      {profile?.first_login === false && <FirstLoginModal />}

      <footer className="mt-10 flex h-24 w-full items-center justify-center border-t">
        <div
          onClick={logout}
          className="flex cursor-pointer items-center space-x-4 text-xl transition duration-100 ease-in-out"
        >
          <p>Sign Out </p>
          <SignOut />
        </div>
      </footer>
    </div>
  );
}

export default AppsChoicesPage;

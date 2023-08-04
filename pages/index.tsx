import Image from "next/image";
import useUser from "@/hooks/useUser";
import { useEffect } from "react";
import AuthenticationForms from "@/components/forms/AuthenticationForms";
import { useRouter } from "next/router";

export default function Home() {
  const { user, manualFetch } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    if (user) {
      manualFetch();
      router.push("/apps");
    }
  }, [user]);

  // console.log(profile);
  return (
    <div>
      <div>
        <div className="flex min-h-screen flex-col items-center justify-center bg-white py-2 text-black">
          <main className="flex w-full flex-1 flex-col items-center justify-center sm:px-10 md:px-20 text-center">
            <Image priority src="/logo.png" width="300" height="150" alt="DP" />

            <div className="mt-6 flex max-w-4xl items-center justify-around sm:w-full">
              <AuthenticationForms />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

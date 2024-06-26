import React, { useEffect, useState } from "react";
import PrimaryLayout from "./PrimaryLayout";
import useUser from "@/hooks/useUser";

interface Section {
  title: string;
  links: {
    title: string;
    href: string;
  }[];
}

function CommissionLayout({ children }: React.PropsWithChildren<{}>) {
  const { profile } = useUser();
  const [availableSections, setAvailableSections] = useState<Section[]>([]);

  const sections: Section[] = [
    {
      title: "Dashboard",
      links: [{ title: "Dashboard", href: "/apps/cashback_feedback" }],
    },
    {
      title: "Admin",
      links: [
        { title: "Tiler Profiles", href: "/apps/cashback_feedback/tilers" },
        {
          title: "Tiler Transactions",
          href: "/apps/cashback_feedback/tilers/transactions",
        },
      ],
    },
  ];

  useEffect(() => {
    if (profile?.role === "admin" || profile?.role === "superadmin") {
      setAvailableSections(sections);
    }
  }, [profile]);
  return (
    <PrimaryLayout sections={availableSections}>
      <div className="w-full p-3 flex-grow h-screen">{children}</div>
    </PrimaryLayout>
  );
}

export default CommissionLayout;

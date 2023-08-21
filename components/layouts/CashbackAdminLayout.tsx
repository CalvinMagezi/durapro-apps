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

function CashbackAdminLayout({ children }: React.PropsWithChildren<{}>) {
  const { profile } = useUser();
  const [availableSections, setAvailableSections] = useState<Section[]>([]);

  const sections: Section[] = [
    {
      title: "Admin",
      links: [
        { title: "All Codes", href: "/apps/cashback-admin/codes" },
        {
          title: "Generate Codes",
          href: "/apps/cashback-admin/codes/generate",
        },
        {
          title: "All Users",
          href: "/apps/cashback-admin/users",
        },
      ],
    },
  ];

  useEffect(() => {
    if (profile?.role === "admin") {
      setAvailableSections(sections);
    }
  }, [profile]);
  return (
    <PrimaryLayout sections={availableSections} cbfeedback={true}>
      <div className="w-full p-3 flex-grow h-screen">{children}</div>
    </PrimaryLayout>
  );
}

export default CashbackAdminLayout;

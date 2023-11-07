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
      title: "Dashboard",
      links: [{ title: "Statistics", href: "/apps/cashback-admin" }],
    },
    {
      title: "Codes",
      links: [
        { title: "All Codes", href: "/apps/cashback-admin/codes" },
        {
          title: "Generate Codes",
          href: "/apps/cashback-admin/codes/generate",
        },
      ],
    },
    {
      title: "Users",
      links: [
        {
          title: "Ready to pay",
          href: "/apps/cashback-admin/users/ready-to-pay",
        },
        {
          title: "Ban List",
          href: "/apps/cashback-admin/users/ban-list",
        },
      ],
    },
  ];

  useEffect(() => {
    if (!profile) return;

    const allowedEmails = [
      "molly.ngute@tilemarket.co.ug",
      "daniel.musinguzi@durapro.co.ug",
      "bob.kugonza@durapro.co.ug",
      "gregmagezi@gmail.com",
      "hadija.nahara@durapro.co.ug",
    ];
    if (profile?.role === "admin" || allowedEmails.includes(profile?.email)) {
      setAvailableSections(sections);
    }
  }, []);
  return (
    <PrimaryLayout sections={availableSections} cbfeedback={true}>
      <div className="w-full p-3 flex-grow h-screen">{children}</div>
    </PrimaryLayout>
  );
}

export default CashbackAdminLayout;

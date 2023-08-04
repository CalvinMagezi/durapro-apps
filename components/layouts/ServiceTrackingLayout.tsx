import React from "react";
import PrimaryLayout from "./PrimaryLayout";

interface Section {
  title: string;
  links: {
    title: string;
    href: string;
  }[];
}

function ServiceTrackingLayout({ children }: React.PropsWithChildren<{}>) {
  const sections: Section[] = [
    {
      title: "Equipment",
      links: [
        { title: "All", href: "/apps/service-tracking/equipment" },
        {
          title: "Add",
          href: "/apps/service-tracking/equipment/add",
        },
      ],
    },
  ];
  return (
    <PrimaryLayout sections={sections}>
      <div className="w-full">{children}</div>
    </PrimaryLayout>
  );
}

export default ServiceTrackingLayout;

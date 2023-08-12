import React, { ReactNode } from "react";
import PrimaryHeader from "../navigation/PrimaryHeader";
import PrimarySidebar from "../navigation/PrimarySidebar";

interface Section {
  title: string;
  links: {
    title: string;
    href: string;
  }[];
}

interface LayoutProps {
  children: ReactNode;
  sections: Section[];
  cbfeedback?: boolean;
}

const PrimaryLayout: React.FC<LayoutProps> = ({
  children,
  sections,
  cbfeedback,
}) => {
  return (
    <div>
      <div>
        <PrimaryHeader sections={sections} cbfeedback={cbfeedback} />
        <div className="flex">
          <div className="hidden lg:block">
            <PrimarySidebar sections={sections} />
          </div>

          <div className="max-h-[90vh] flex-grow overflow-y-scroll">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimaryLayout;

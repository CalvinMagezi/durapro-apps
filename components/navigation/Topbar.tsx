import Image from "next/image";
import Link from "next/link";
import React from "react";

function Topbar() {
  return (
    <div className="sticky top-0 z-50 w-full">
      <div className="flex items-center justify-between w-full z-50 sticky top-0 px-10 py-5 border-b-gray-500 border border-opacity-40 ">
        <Link href="/">
          <Image src="/logo.png" width="160" height="160" alt="DP" />
        </Link>
      </div>
    </div>
  );
}

export default Topbar;

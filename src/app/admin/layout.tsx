import {ReactNode} from "react";
import Sidebar from "@/components/admin/layout/sidebar/Sidebar";

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className={"flex flex-row"}>
      <Sidebar/>
      <div className={"flex-1 p-4 border border-grey-c300 shadow-lg rounded-lg m-4 min-w-0"}>
        {children}
      </div>
    </div>

  );
}

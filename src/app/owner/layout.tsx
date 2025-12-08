import {ReactNode} from "react";
import Sidebar from "@/components/owner/layout/sidebar/Sidebar";

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className={"flex flex-row h-screen"}>
      <Sidebar/>
      <div className={"flex-1 flex flex-col p-4 border border-grey-c300 shadow-lg rounded-lg m-4 min-w-0 overflow-hidden"}>
        {children}
      </div>
    </div>

  );
}

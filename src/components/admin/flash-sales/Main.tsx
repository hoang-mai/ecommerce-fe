"use client";
import React, {useState} from "react";
import ScrollTab, {TabItem} from "@/libs/ScrollTab";
import TodayFlashSale from "@/components/admin/flash-sales/today/TodayFlashSale";
import TomorrowFlashSale from "@/components/admin/flash-sales/tomorrow/TomorrowFlashSale";
import ScheduleFlashSale from "@/components/admin/flash-sales/schedule/ScheduleFlashSale";
import AllFlashSale from "@/components/admin/flash-sales/all/AllFlashSale";
import Title from "@/libs/Title";





export default function Main() {
  const [activeTab, setActiveTab] = useState<string>("1");

  const tabs: TabItem[] = [
    {key: "1", label: "Flash Sale hôm nay"},
    {key: "2", label: "Flash Sale ngày mai"},
    {key: "3", label: "Lên lịch Flash Sale"},
    {key: "4", label: "Tất cả Flash Sale"},
  ];

  return (
    <div className="h-full flex flex-col">
      <Title title={"Quản lý Flash Sale"} isDivide={true}/>

      {/* Tabs */}
      <div className="px-4 py-2 bg-white mb-2 rounded-2xl shadow-lg border border-grey-c200 flex-1 ">
        <ScrollTab items={tabs} onChange={setActiveTab} activeKey={activeTab}/>
        {activeTab === "1" ? <TodayFlashSale/>
          : activeTab === "2" ? <TomorrowFlashSale/>
            : activeTab === "3" ? <ScheduleFlashSale/>
              : activeTab === "4" ? <AllFlashSale/> : null
        }
      </div>
    </div>
  );
}

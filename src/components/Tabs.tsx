import React from 'react';

interface TabsProps {
  tab: string;
  setTab: (tab: "check" | "history" | "dashboard") => void;
}

const Tabs: React.FC<TabsProps> = ({ tab, setTab }) => {
  return (
    <div className="flex border-b bg-white">
      <button
        onClick={() => setTab("check")}
        className={`flex-1 py-5 text-center font-medium ${tab === "check" ? "border-b-2 border-black" : "text-gray-500"}`}
      >
        CHECK A DECISION
      </button>
      <button
        onClick={() => setTab("history")}
        className={`flex-1 py-5 text-center font-medium ${tab === "history" ? "border-b-2 border-black" : "text-gray-500"}`}
      >
        DECISION LOG
      </button>
      <button
        onClick={() => setTab("dashboard")}
        className={`flex-1 py-5 text-center font-medium ${tab === "dashboard" ? "border-b-2 border-black" : "text-gray-500"}`}
      >
        DASHBOARD
      </button>
    </div>
  );
};

export default Tabs;
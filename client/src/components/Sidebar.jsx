import React from "react";
import RecentQueries from "./RecentQueries";
import { Button } from "./ui/button";

export default function Sidebar({
  open,
  queries,
  onSessionSelect,
  onDeleteSession,
  onNewSession,
}) {
  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100%-64px)] w-80 max-w-full bg-white border-r border-blue-100 border-t z-40 transform transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ minWidth: 280 }}
    >
      <div className="p-4 overflow-y-auto h-full flex flex-col">
        <Button
          variant="outline"
          className="mb-4 w-full border-blue-400 text-blue-700 hover:bg-blue-100"
          onClick={onNewSession}
        >
          + New Session
        </Button>
        <div className="flex-1 flex flex-col justify-center">
          <RecentQueries
            queries={queries}
            onSessionSelect={onSessionSelect}
            onDeleteSession={onDeleteSession}
          />
        </div>
      </div>
    </div>
  );
}

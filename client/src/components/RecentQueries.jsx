import React from "react";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

export default function RecentQueries({
  queries,
  onSessionSelect,
  onDeleteSession,
}) {
  return (
    <div className="p-4 h-full bg-white overflow-hidden flex flex-col">
      <h2 className="font-semibold text-lg mb-3 text-blue-700">
        Recent Sessions
      </h2>
      <div className="space-y-2 overflow-y-auto flex-1">
        {(!queries || queries.length === 0) && (
          <div className="text-gray-400 text-center py-8 flex-1 flex flex-col justify-center items-center">
            No recent sessions yet.
          </div>
        )}
        {queries &&
          queries.map((item, index) => (
            <div
              key={item.sessionId || index}
              className="flex items-center gap-2 mb-2"
            >
              <button
                className="flex-1 text-left bg-blue-50 rounded p-3 text-sm border border-blue-100 hover:bg-blue-100 transition"
                onClick={() => onSessionSelect && onSessionSelect(item)}
              >
                <div className="font-medium text-blue-800">
                  {item.sessionName.length > 20
                    ? `${item.sessionName.slice(0, 20)}...`
                    : item.sessionName}
                </div>
                <div className="text-gray-500 text-xs text-right">
                  {new Date(item.update_time).toLocaleString()}
                </div>
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500"
                title="Delete session"
                onClick={() =>
                  onDeleteSession && onDeleteSession(item.sessionId)
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}

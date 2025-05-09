import React from "react";
import { Button } from "./ui/button";

export default function WeatherResponse({ text }) {
  return (
    <div className="flex mb-4">
      <div className="bg-blue-50 px-4 py-3 rounded-lg max-w-[80%] border border-blue-100">
        <p className="text-gray-800">{text}</p>
      </div>
      <Button variant="ghost" size="sm" className="ml-2 h-8 text-blue-500">
        avastha
      </Button>
    </div>
  );
}

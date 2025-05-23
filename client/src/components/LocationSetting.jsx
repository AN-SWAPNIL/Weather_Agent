import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Save } from "lucide-react";

/**
 * Component for setting and saving the default location
 */
export default function LocationSetting({
  location = "",
  setLocation,
  handleSaveLocation,
}) {
  return (
    <div className="mt-4 flex items-center justify-between bg-gray-50/50 p-3 rounded-lg">
      <span className="text-sm text-gray-600">
        Default Location: {JSON.parse(window.localStorage.getItem("user")).location}
      </span>
      <div className="flex gap-2">
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-48 text-sm shadow-sm"
          placeholder="Enter location..."
        />
        <Button
          size="sm"
          onClick={handleSaveLocation}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="h-4 w-4 mr-1" /> Save
        </Button>
      </div>
    </div>
  );
}

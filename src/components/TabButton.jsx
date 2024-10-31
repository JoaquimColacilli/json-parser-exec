import React from "react";
import { Tab } from "@headlessui/react";

export function TabButton({ children }) {
  return (
    <Tab
      className={({ selected }) =>
        `flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-200
      ${
        selected
          ? "bg-indigo-600 text-white shadow-lg"
          : "text-gray-600 hover:bg-gray-100"
      }`
      }
    >
      {children}
    </Tab>
  );
}

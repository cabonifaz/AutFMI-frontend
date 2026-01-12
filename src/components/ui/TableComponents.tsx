import React from "react";

export const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto w-full border border-gray-200 rounded-md">
    <table className="w-full text-sm border-collapse min-w-max"> 
      {children}
    </table>
  </div>
);

export const Th = ({ children, center }: { children: React.ReactNode; center?: boolean }) => (
  <th className={`p-2 bg-sky-50 text-sky-700 font-semibold border border-gray-200 whitespace-nowrap ${center ? "text-center" : "text-left"}`}>
    {children}
  </th>
);

export const Td = ({ children, center, right, title }: { 
  children: React.ReactNode; 
  center?: boolean; 
  right?: boolean; 
  title?: string; 
}) => (
  <td
    title={title}
    className={`p-2 border border-gray-200 whitespace-nowrap ${
      center ? "text-center" : right ? "text-right" : "text-left"
    }`}
  >
    {children}
  </td>
);

export const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-4 border border-sky-200 rounded-lg p-4 bg-white">
    {children}
  </div>
);
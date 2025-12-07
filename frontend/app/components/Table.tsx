import React from "react";

type TableProps = {
  headers: string[];
  data: Array<Record<string, any>>;
};

export default function Table({ headers, data }: TableProps) {
  return (
    <table className="min-w-full border-collapse border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} className="odd:bg-white even:bg-gray-50">
            {headers.map((header, colIndex) => (
              <td
                key={colIndex}
                className="border border-gray-300 px-4 py-2 text-gray-600"
              >
                {row[header]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

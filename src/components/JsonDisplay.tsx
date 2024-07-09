import React from "react";

export const JsonDisplay = ({ data }: { data: any }) => {
  return (
    <code
      className={
        "block bg-gray-900 p-2 text-xs text-amber-200 border-gray-600 border"
      }
    >
      <pre className={"max-w-full overflow-x-scroll"}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </code>
  );
};

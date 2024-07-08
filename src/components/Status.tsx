import React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/ui/check";
import { CrossIcon } from "@/components/ui/cross";
import { SpinnerIcon } from "@/components/Spinner";

export const Status = ({
  status,
  helpText,
  label,
}: {
  status: boolean | undefined;
  helpText?: string | React.ReactNode;
  label: string;
}) => {
  return (
    <div className={"flex gap-2 items-start"}>
      {(status === true && <CheckIcon />) ||
        (status === false && <CrossIcon />) || <SpinnerIcon />}{" "}
      <div className={"flex flex-col"}>
        <span>{label}</span>
        {(typeof helpText === "string" && (
          <span className={"text-xs text-gray-400"}>{helpText}</span>
        )) ||
          helpText}
      </div>
    </div>
  );
};

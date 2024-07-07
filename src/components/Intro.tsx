import * as React from "react";
import { cn } from "@/lib/utils";

export const Intro = ({
  title,
  description,
  className,
}: {
  title: string;
  description?: string | React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("mb-4 px-2", className)}>
      <h1 className={"mb-2 mt-4 text-xl"}>{title}</h1>
      {typeof description === "string" ? (
        <p className={"mb-0 text-sm"}>{description}</p>
      ) : (
        description
      )}
    </div>
  );
};

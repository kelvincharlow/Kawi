import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border border-gray-200 placeholder:text-gray-500 flex field-sizing-content min-h-20 w-full rounded-lg bg-gray-50/50 px-3 py-2 text-sm text-gray-700 transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:shadow-sm",
        "hover:border-gray-300 hover:bg-gray-50",
        "aria-invalid:border-red-300 aria-invalid:ring-2 aria-invalid:ring-red-100 aria-invalid:bg-red-50/30",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

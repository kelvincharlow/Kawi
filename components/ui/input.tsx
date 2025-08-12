import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-gray-500 selection:bg-blue-200 selection:text-blue-900 flex h-10 w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:shadow-sm",
        "hover:border-gray-300 hover:bg-gray-50",
        "aria-invalid:border-red-300 aria-invalid:ring-2 aria-invalid:ring-red-100 aria-invalid:bg-red-50/30",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

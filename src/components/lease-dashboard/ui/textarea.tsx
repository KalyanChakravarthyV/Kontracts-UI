import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none placeholder:text-muted-foreground/70 flex field-sizing-content min-h-16 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "hover:border-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

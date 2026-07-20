"use client";

import { BlueprintButton } from "@/components/puzzle/BlueprintButton";

export function PrintButton() {
  return (
    <BlueprintButton type="button" variant="primary" onClick={() => window.print()}>
      Download PDF
    </BlueprintButton>
  );
}

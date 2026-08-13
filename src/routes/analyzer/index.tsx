import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/analyzer/")({
  component: () => <div className="p-8">Analyzer Page Placeholder</div>,
});

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/templates/")({
  component: () => <div className="p-8">Templates Page Placeholder</div>,
});

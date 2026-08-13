import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/health")({
  component: () => <div className="p-8">Health Report Page Placeholder</div>,
});

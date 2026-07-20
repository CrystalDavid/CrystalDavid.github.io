import type { Metadata } from "next";
import { AgentLab } from "../agent-lab";

export const metadata: Metadata = {
  title: "Agent 1 · Native motion comparison",
  description: "Direct requestAnimationFrame pointer response test.",
};

export default function AgentOnePage() {
  return <AgentLab mode="native" />;
}

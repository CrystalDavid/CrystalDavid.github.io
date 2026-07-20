import type { Metadata } from "next";
import { AgentLab } from "../agent-lab";

export const metadata: Metadata = {
  title: "Agent 2 · Wickret motion comparison",
  description: "Wickret-style requestAnimationFrame and GSAP pointer response test.",
};

export default function AgentTwoPage() {
  return <AgentLab mode="wickret" />;
}

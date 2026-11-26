import type { Metadata } from "next";
import { ScreeningFlow } from "@/screening/ScreeningFlow";

export const metadata: Metadata = {
  title: "Near vision screening · ReaderOps",
};

/**
 * /test: the standalone near vision screening (ticket #67). No login, no server:
 * it runs on the phone and saves each screening locally.
 */
export default function TestPage() {
  return <ScreeningFlow />;
}

import { redirect } from "next/navigation";

/** The screening is the only feature so far, so the home page opens it. */
export default function Home() {
  redirect("/test");
}

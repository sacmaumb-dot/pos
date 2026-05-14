import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const user = await getSession();

  if (user) {
    redirect("/pos"); // Go straight to POS or Dashboard
  } else {
    redirect("/login");
  }

  return null;
}

import { redirect } from "next/navigation";

/** The story library now lives in the practice room. */
export default function ReaderIndexPage() {
  redirect("/practice?tab=stories");
}

import { BentoDashboard } from "@/components/dashboard/BentoDashboard";
import { getLessons, getStories } from "@/lib/data";

export default async function HomePage() {
  const [lessons, stories] = await Promise.all([getLessons(), getStories()]);
  return <BentoDashboard lessons={lessons} stories={stories} />;
}

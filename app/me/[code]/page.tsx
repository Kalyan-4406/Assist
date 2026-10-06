import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { publicRegistration, publicConfig } from "@/lib/data";
import { readSession } from "@/lib/auth";
import { PersonalPage } from "@/components/personal-page";
export default async function Personal({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const jar = await cookies();
  const owner = await readSession(jar.get("cbr_owner")?.value, "owner");
  const profile = await publicRegistration(code, owner);
  if (!profile) notFound();
  return <PersonalPage profile={profile} config={publicConfig()} />;
}

import MembersSection from "@/components/members/MembersSection";
import { fetchMembers } from "@/lib/api/members";

export default async function MembersPage() {
    const members = await fetchMembers();

    return <MembersSection members={members} />;
}

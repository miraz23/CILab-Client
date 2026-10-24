import type { Member } from "@/lib/api/members";
import { Mail, Users } from "lucide-react";

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

export default function MembersSection({ members }: { members: Member[] }) {
    return (
        <section className="min-h-[70vh] bg-[#F8FAFC] px-5 py-24 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#716f49]">Our community</p>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#1f321c] sm:text-5xl">Members</h1>
                    <p className="mt-5 text-base leading-8 text-slate-600">
                        Meet the researchers, students, and collaborators who make CILab a community for
                        computational intelligence research.
                    </p>
                </div>

                {members.length === 0 ? (
                    <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-[#1f321c]/10 bg-white p-12 text-center shadow-sm">
                        <Users className="mx-auto h-10 w-10 text-[#716f49]" />
                        <h2 className="mt-4 text-xl font-bold text-[#1f321c]">No members to display yet</h2>
                        <p className="mt-2 text-sm text-slate-500">The CILab member directory will appear here soon.</p>
                    </div>
                ) : (
                    <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {members.map((member) => (
                            <article
                                key={member.id}
                                className="rounded-3xl border border-[#1f321c]/10 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1f321c] text-lg font-bold text-white">
                                        {initials(member.name)}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="truncate text-lg font-bold text-[#1f321c]">{member.name}</h2>
                                        <p className="mt-1 text-sm font-semibold text-[#716f49]">{member.academicRole}</p>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-3 text-sm text-slate-600">
                                    <p className="leading-6">{member.institution}</p>
                                    <a
                                        href={`mailto:${member.email}`}
                                        className="flex items-center gap-2 break-all text-[#716f49] transition hover:text-[#1f321c]"
                                    >
                                        <Mail className="h-4 w-4 shrink-0" />
                                        {member.email}
                                    </a>
                                    <p className="border-t border-[#1f321c]/10 pt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                        Scholar ID: <span className="normal-case tracking-normal text-slate-700">{member.scholarId}</span>
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

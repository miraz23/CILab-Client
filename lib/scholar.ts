/** Google Scholar profile URL for an ID, or undefined when the value does not look like one. */
export function scholarUrl(id: string | null | undefined): string | undefined {
    const value = (id ?? "").trim();
    return /^[\w-]{6,30}$/.test(value)
        ? `https://scholar.google.com/citations?user=${encodeURIComponent(value)}`
        : undefined;
}

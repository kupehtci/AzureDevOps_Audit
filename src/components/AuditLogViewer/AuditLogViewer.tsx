import { useState, useEffect, useMemo } from "react";

interface AuditLogEntry {
    id: string;
    correlationId: string;
    actorUPN: string;
    authenticationMechanism: string;
    timestamp: string;
    scopeType: string;
    scopeDisplayName: string;
    projectId: string;
    projectName: string | null;
    ipAddress: string;
    userAgent: string;
    actionId: string;
    data: Record<string, unknown>;
    details: string;
    area: string;
    category: string;
    categoryDisplayName: string;
    actorDisplayName: string;
    actorImageUrl: string;
    activityId?: string;
    actorUserId?: string;
}

const SAMPLE_DATA = {
    decoratedAuditLogEntries: [
        {
            id: "2516291699374345579;00000064-0000-8888-8000-000000000000;a4559d4b-b854-4c29-b272-9d8a1fd24d3f",
            correlationId: "a4559d4b-b854-4c29-b272-9d8a1fd24d3f",
            actorUPN: "dlaplana@hiberus.com",
            authenticationMechanism: "AAD",
            timestamp: "2026-03-10T08:21:02.565442Z",
            scopeType: "organization",
            scopeDisplayName: "serviciosmin-omc (Organization)",
            projectId: "00000000-0000-0000-0000-000000000000",
            projectName: null,
            ipAddress: "77.230.129.83",
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
            actionId: "Search.Code",
            data: { SearchQuery: "Web.config", SearchSource: "UI" },
            details: "Search Query 'Web.config'",
            area: "Search",
            category: "execute",
            categoryDisplayName: "Execute",
            actorDisplayName: "Daniel Laplana Gimeno",
            actorImageUrl: "https://dev.azure.com/serviciosmin-omc/_apis/GraphProfile/MemberAvatars/aad.MzJkNzEwNjQtOTFjYi03NTkxLTg4NzEtZGFjN2NlYTg2NDc3"
        },
        {
            id: "2516291699665890531;00000064-0000-8888-8000-000000000000;42a2eae9-ddf0-40cd-badd-46b033d58965",
            correlationId: "42a2eae9-ddf0-40cd-badd-46b033d58965",
            actorUPN: "dlaplana@hiberus.com",
            authenticationMechanism: "AAD",
            timestamp: "2026-03-10T08:20:33.4109468Z",
            scopeType: "organization",
            scopeDisplayName: "serviciosmin-omc (Organization)",
            projectId: "00000000-0000-0000-0000-000000000000",
            projectName: null,
            ipAddress: "77.230.129.83",
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
            actionId: "Search.Code",
            data: { SearchQuery: "Web.config", SearchSource: "UI" },
            details: "Search Query 'Web.config'",
            area: "Search",
            category: "execute",
            categoryDisplayName: "Execute",
            actorDisplayName: "Daniel Laplana Gimeno",
            actorImageUrl: "https://dev.azure.com/serviciosmin-omc/_apis/GraphProfile/MemberAvatars/aad.MzJkNzEwNjQtOTFjYi03NTkxLTg4NzEtZGFjN2NlYTg2NDc3"
        }
    ]
};

const CATEGORY_COLORS = {
    execute: { bg: "#1a2a1a", border: "#22c55e", text: "#4ade80", dot: "#22c55e" },
    modify: { bg: "#2a1a1a", border: "#f97316", text: "#fb923c", dot: "#f97316" },
    create: { bg: "#1a1a2a", border: "#3b82f6", text: "#60a5fa", dot: "#3b82f6" },
    delete: { bg: "#2a1a1a", border: "#ef4444", text: "#f87171", dot: "#ef4444" },
    read: { bg: "#1a2a2a", border: "#06b6d4", text: "#22d3ee", dot: "#06b6d4" },
    default: { bg: "#1e1e2e", border: "#6366f1", text: "#818cf8", dot: "#6366f1" }
};

function getCategoryStyle(category: string) {
    return (CATEGORY_COLORS as Record<string, typeof CATEGORY_COLORS.default>)[category?.toLowerCase()] || CATEGORY_COLORS.default;
}

function formatTimestamp(ts: string) {
    const d = new Date(ts);
    return { date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) };
}

function Avatar({ url, name }: { url: string; name: string }) {
    const [err, setErr] = useState(false);
    const initials = name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
    if (err || !url) return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[13px] font-bold text-white shrink-0">
            {initials}
        </div>
    );
    return <img src={url} alt={name} onError={() => setErr(true)} className="w-9 h-9 rounded-full object-cover shrink-0 border-2 border-rim" />;
}

function Badge({ label, color }: { label: string; color: typeof CATEGORY_COLORS.default }) {
    return (
        <span
            className="text-[10px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded"
            style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.text }}
        >
            {label}
        </span>
    );
}

function LogRow({ entry, onClick, selected }: { entry: AuditLogEntry; onClick: (e: AuditLogEntry) => void; selected: boolean }) {
    const cat = getCategoryStyle(entry.category);
    const { date, time } = formatTimestamp(entry.timestamp);
    return (
        <div
            onClick={() => onClick(entry)}
            className="grid gap-4 items-center px-5 py-3 cursor-pointer border-b border-edge transition-colors hover:bg-deep"
            style={{
                gridTemplateColumns: "36px 140px minmax(0,1fr) 120px 90px",
                background: selected ? "#1a1a2e" : undefined,
                borderLeft: `3px solid ${selected ? "#6366f1" : "transparent"}`,
            }}
        >
            <Avatar url={entry.actorImageUrl} name={entry.actorDisplayName} />
            <div>
                <div className="text-xs font-semibold text-slate-200 truncate">{entry.actorDisplayName}</div>
                <div className="text-[10px] text-slate-500 truncate">{entry.actorUPN}</div>
            </div>
            <div className="min-w-0">
                <div className="text-xs font-medium text-slate-300 mb-0.5 truncate">{entry.actionId}</div>
                <div className="text-[11px] text-slate-600 truncate">{entry.details}</div>
            </div>
            <div className="text-right">
                <div className="text-[11px] text-slate-400">{date}</div>
                <div className="text-[11px] text-slate-500 font-mono">{time}</div>
            </div>
            <div className="text-right">
                <Badge label={entry.categoryDisplayName || entry.category} color={cat} />
            </div>
        </div>
    );
}

function DetailPanel({ entry, onClose }: { entry: AuditLogEntry; onClose: () => void }) {
    if (!entry) return null;
    const cat = getCategoryStyle(entry.category);
    const { date, time } = formatTimestamp(entry.timestamp);

    const fields = [
        ["Action", entry.actionId],
        ["Area", entry.area],
        ["Details", entry.details],
        ["Actor UPN", entry.actorUPN],
        ["Auth Mechanism", entry.authenticationMechanism],
        ["IP Address", entry.ipAddress],
        ["Scope", entry.scopeDisplayName],
        ["Scope Type", entry.scopeType],
        ["Project", entry.projectName || "—"],
        ["Timestamp", `${date} ${time}`],
        ["Correlation ID", entry.correlationId],
        ["Activity ID", entry.activityId],
        ["Actor User ID", entry.actorUserId],
        ["User Agent", entry.userAgent],
    ];

    return (
        <div className="w-[400px] shrink-0 border-l border-edge bg-[#0d0d17] flex flex-col h-full">
            <div className="px-5 py-4 border-b border-edge flex justify-between items-center sticky top-0 bg-[#0d0d17] z-10">
                <div className="text-[13px] font-bold text-slate-200 tracking-[0.04em]">LOG DETAIL</div>
                <button
                    onClick={onClose}
                    className="bg-transparent border border-rim text-slate-500 cursor-pointer px-2.5 py-1 rounded text-xs font-mono hover:text-slate-300 hover:border-slate-500 transition-colors"
                >
                    ✕ Close
                </button>
            </div>

            <div className="px-5 py-4 border-b border-edge">
                <div className="flex items-center gap-3 mb-3">
                    <Avatar url={entry.actorImageUrl} name={entry.actorDisplayName} />
                    <div>
                        <div className="text-sm font-bold text-slate-100">{entry.actorDisplayName}</div>
                        <div className="text-[11px] text-slate-500">{entry.actorUPN}</div>
                    </div>
                </div>
                <Badge label={entry.categoryDisplayName || entry.category} color={cat} />
            </div>

            <div className="px-5 py-3 border-b border-edge">
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-600 mb-2 uppercase">Event Data</div>
                <pre className="font-mono text-[11px] text-violet-400 bg-deep p-3 rounded-md overflow-auto border border-edge m-0">
                    {JSON.stringify(entry.data, null, 2)}
                </pre>
            </div>

            <div className="px-5 py-3">
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-600 mb-2 uppercase">All Fields</div>
                {fields.map(([k, v]) => (
                    <div key={k} className="flex gap-2 py-1.5 border-b border-deep">
                        <div className="text-[10px] text-slate-600 font-semibold min-w-[110px] uppercase tracking-[0.06em] pt-px">{k}</div>
                        <div className="text-[11px] text-slate-400 break-all flex-1">{v}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AuditLogViewer() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<AuditLogEntry | null>(null);
    const [search, setSearch] = useState("");
    const [filterArea, setFilterArea] = useState("ALL");
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [filterActor, setFilterActor] = useState("ALL");
    const [sortDir, setSortDir] = useState("desc");
    const [usingSample, setUsingSample] = useState(false);

    // Auth state
    const [orgInput, setOrgInput] = useState("");
    const [patInput, setPatInput] = useState("");
    const [org, setOrg] = useState("");
    const [pat, setPat] = useState("");
    const [startTime, setStartTime] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
    });

    const isConnected = org !== "" && pat !== "";

    function handleConnect(e: React.FormEvent) {
        e.preventDefault();
        const trimOrg = orgInput.trim();
        const trimPat = patInput.trim();
        if (!trimOrg || !trimPat) return;
        setOrg(trimOrg);
        setPat(trimPat);
    }

    function handleDisconnect() {
        setOrg("");
        setPat("");
        setPatInput("");
        setLogs([]);
        setUsingSample(false);
        setError(null);
    }

    async function fetchLogs() {
        if (!org || !pat) return;
        setLoading(true);
        setError(null);
        try {
            const url = `https://auditservice.dev.azure.com/${encodeURIComponent(org)}/_apis/audit/auditlog?api-version=7.1-preview`;
            const token = btoa(`:${pat}`);
            const res = await fetch(url, {
                headers: {
                    "Authorization": `Basic ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
            const json = await res.json();
            setLogs(json.decoratedAuditLogEntries || []);
            setUsingSample(false);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
            setLogs(SAMPLE_DATA.decoratedAuditLogEntries);
            setUsingSample(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isConnected) { fetchLogs(); }
    }, [org, pat]);

    const areas = useMemo(() => ["ALL", ...new Set(logs.map(l => l.area).filter(Boolean))], [logs]);
    const categories = useMemo(() => ["ALL", ...new Set(logs.map(l => l.categoryDisplayName || l.category).filter(Boolean))], [logs]);
    const actors = useMemo(() => ["ALL", ...new Set(logs.map(l => l.actorDisplayName).filter(Boolean))], [logs]);

    const filtered = useMemo(() => {
        let out = [...logs];
        if (search) {
            const q = search.toLowerCase();
            out = out.filter(l => JSON.stringify(l).toLowerCase().includes(q));
        }
        if (filterArea !== "ALL") out = out.filter(l => l.area === filterArea);
        if (filterCategory !== "ALL") out = out.filter(l => (l.categoryDisplayName || l.category) === filterCategory);
        if (filterActor !== "ALL") out = out.filter(l => l.actorDisplayName === filterActor);
        out.sort((a, b) => sortDir === "desc" ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return out;
    }, [logs, search, filterArea, filterCategory, filterActor, sortDir]);

    /* ─── shared input / select class ─────────────────────────────── */
    const ctrlCls = "bg-dark border border-rim text-slate-400 px-2.5 py-1.5 rounded-md text-xs outline-none font-mono cursor-pointer";

    if (!isConnected) {
        return (
            <div className="font-mono bg-[#14141f] min-h-screen flex flex-col items-center justify-center text-slate-200">
                <form onSubmit={handleConnect} className="bg-dark border border-edge rounded-xl p-10 w-full max-w-md flex flex-col gap-5">
                    <div>
                        <div className="text-xl font-extrabold tracking-[0.06em] text-slate-100 mb-1">
                            <span className="text-indigo-500">▮</span> AUDIT LOG
                        </div>
                        <div className="text-[11px] text-slate-600 tracking-[0.1em]">AZURE DEVOPS — CONNECT YOUR ORGANIZATION</div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-600 tracking-[0.1em] uppercase">Organization Name</label>
                        <input
                            type="text"
                            value={orgInput}
                            onChange={e => setOrgInput(e.target.value)}
                            placeholder="my-org"
                            autoComplete="off"
                            required
                            className="bg-deep border border-rim text-slate-200 px-3 py-2 rounded-md text-[13px] outline-none w-full font-mono placeholder:text-slate-700 focus:border-indigo-500 transition-colors"
                        />
                        <div className="text-[10px] text-slate-700">
                            auditservice.dev.azure.com/<strong className="text-indigo-500">{orgInput || "my-org"}</strong>/…
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-600 tracking-[0.1em] uppercase">Personal Access Token (PAT)</label>
                        <input
                            type="password"
                            value={patInput}
                            onChange={e => setPatInput(e.target.value)}
                            placeholder="••••••••••••••••••••••••••••••••••••••••••••••••••••"
                            autoComplete="current-password"
                            required
                            className="bg-deep border border-rim text-slate-200 px-3 py-2 rounded-md text-[13px] outline-none w-full font-mono placeholder:text-slate-700 focus:border-indigo-500 transition-colors"
                        />
                        <div className="text-[10px] text-slate-700">
                            Requires <strong className="text-slate-400">Audit Log (Read)</strong> scope.
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-600 tracking-[0.1em] uppercase">Fetch logs from (start time)</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                            required
                            className="bg-deep border border-rim text-slate-200 px-3 py-2 rounded-md text-[13px] outline-none w-full font-mono focus:border-indigo-500 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-indigo-500 border-none text-white py-2.5 rounded-md text-[13px] font-bold tracking-[0.06em] cursor-pointer font-mono hover:bg-indigo-600 transition-colors"
                    >
                        CONNECT →
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="font-mono min-h-screen bg-[#14141f] flex flex-col items-center py-8 px-4 text-slate-200">
        <div className="w-3/5 min-w-[820px] bg-void rounded-2xl border border-edge shadow-[0_4px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(99,102,241,0.08)] flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-edge bg-dark rounded-t-2xl flex items-center justify-between flex-wrap gap-3">
                <div>
                    <div className="text-lg font-extrabold tracking-[0.06em] text-slate-100">
                        <span className="text-indigo-500">▮</span> AUDIT LOG
                    </div>
                    <div className="text-[10px] text-slate-600 tracking-[0.1em]">AZURE DEVOPS · {org}</div>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    {usingSample && (
                        <span className="text-[10px] text-orange-400 bg-orange-950 border border-orange-500 px-2 py-0.5 rounded">
                            ⚠ SAMPLE DATA — API unreachable
                        </span>
                    )}
                    {error && (
                        <span title={error} className="text-[10px] text-red-400 bg-red-950 border border-red-500 px-2 py-0.5 rounded max-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap">
                            ✕ {error}
                        </span>
                    )}
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className={`${ctrlCls} cursor-text`}
                        title="Fetch logs from this date/time"
                    />
                    <span className="text-[11px] text-slate-600">{filtered.length} entries</span>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="bg-indigo-500 border-none text-white px-3.5 py-1.5 rounded-md text-xs font-bold cursor-pointer font-mono hover:bg-indigo-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "⟳ Loading..." : "⟳ Refresh"}
                    </button>
                    <button
                        onClick={handleDisconnect}
                        className="bg-transparent border border-slate-700 text-slate-500 px-3 py-1.5 rounded-md text-xs cursor-pointer font-mono hover:text-slate-300 hover:border-slate-500 transition-colors"
                        title="Disconnect and change credentials"
                    >
                        Disconnect
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="px-6 py-3 border-b border-edge bg-deeper flex flex-wrap gap-2.5 items-center">
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="🔍 Search all fields..."
                    className={`${ctrlCls} cursor-text flex-1 min-w-[180px] placeholder:text-slate-700`}
                />
                <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className={ctrlCls}>
                    {areas.map(a => <option key={a}>{a}</option>)}
                </select>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={ctrlCls}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={filterActor} onChange={e => setFilterActor(e.target.value)} className={ctrlCls}>
                    {actors.map(a => <option key={a}>{a}</option>)}
                </select>
                <button
                    onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
                    className={`${ctrlCls} flex items-center gap-1 hover:text-slate-200 transition-colors`}
                >
                    {sortDir === "desc" ? "↓ Newest" : "↑ Oldest"}
                </button>
                {(search || filterArea !== "ALL" || filterCategory !== "ALL" || filterActor !== "ALL") && (
                    <button
                        onClick={() => { setSearch(""); setFilterArea("ALL"); setFilterCategory("ALL"); setFilterActor("ALL"); }}
                        className={`${ctrlCls} text-red-400 border-red-500 hover:bg-red-950 transition-colors`}
                    >
                        ✕ Clear
                    </button>
                )}
            </div>

            {/* Table Header */}
            <div className="grid gap-4 px-5 py-2 border-b border-edge bg-void" style={{ gridTemplateColumns: "36px 140px minmax(0,1fr) 120px 90px" }}>
                {["", "Actor", "Action / Details", "Timestamp", "Category"].map(h => (
                    <div key={h} className="text-[10px] font-bold tracking-[0.1em] text-slate-700 uppercase">{h}</div>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden min-h-0">
                <div className="flex-1 overflow-y-auto scroll-fade">
                    {loading && <div className="p-10 text-center text-slate-600">⟳ Fetching audit logs…</div>}
                    {!loading && filtered.length === 0 && <div className="p-10 text-center text-slate-600">No entries match your filters.</div>}
                    {filtered.map(entry => (
                        <LogRow key={entry.id} entry={entry} onClick={(e: AuditLogEntry) => setSelected(s => s?.id === e.id ? null : e)} selected={selected?.id === entry.id} />
                    ))}
                </div>
                <div className={`shrink-0 overflow-x-hidden overflow-y-auto scroll-fade transition-[width] duration-300 ease-in-out ${selected ? 'w-[400px]' : 'w-0'}`}>
                    {selected && <DetailPanel entry={selected} onClose={() => setSelected(null)} />}
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-2 border-t border-edge bg-dark rounded-b-2xl flex justify-between text-[10px] text-slate-700">
                <span>AUDIT LOG VIEWER</span>
                <span>{new Date().toISOString()}</span>
            </div>
        </div>
        </div>
    );
}


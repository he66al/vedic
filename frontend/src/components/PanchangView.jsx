import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function MandalaLoader({ size = 24 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" className="mandala-loader" fill="none">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
            <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
            {Array.from({ length: 8 }).map((_, i) => {
                const a = (i * 45 * Math.PI) / 180;
                return (
                    <line key={i} x1={32} y1={32}
                          x2={32 + Math.cos(a) * 28}
                          y2={32 + Math.sin(a) * 28}
                          stroke="currentColor" strokeWidth="1" opacity="0.6" />
                );
            })}
            <circle cx="32" cy="32" r="3" fill="currentColor" />
        </svg>
    );
}

function fmtTime(iso, tz) {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", hour12: true,
        timeZone: tz,
    });
}

function fmtDateTime(iso, tz) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true,
        timeZone: tz,
    });
}

function CitySearch({ value, onSelect, testId }) {
    const [query, setQuery] = useState(value || "");
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef();
    const boxRef = useRef();

    useEffect(() => { setQuery(value || ""); }, [value]);
    useEffect(() => {
        const h = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const onChange = (e) => {
        const v = e.target.value;
        setQuery(v);
        setOpen(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (v.length < 2) { setResults([]); return; }
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const resp = await axios.get("https://nominatim.openstreetmap.org/search", {
                    params: { q: v, format: "json", limit: 6, addressdetails: 1 },
                    headers: { "Accept-Language": "en" },
                });
                setResults(resp.data || []);
            } catch { setResults([]); }
            finally { setLoading(false); }
        }, 400);
    };

    return (
        <div className="relative" ref={boxRef}>
            <div className="relative">
                <input
                    data-testid={testId || "panchang-city-input"}
                    type="text"
                    value={query}
                    onChange={onChange}
                    onFocus={() => query.length >= 2 && setOpen(true)}
                    placeholder="Search location..."
                    className="w-full bg-white border border-[#E3D5C1] rounded-sm px-3 py-2.5 font-sans text-sm text-[#2C241B] focus:outline-none focus:ring-1 focus:ring-[#D35400] focus:border-[#D35400]"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2"><MandalaLoader size={18} /></div>
                )}
            </div>
            {open && results.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full bg-[#FCFAF5] border border-[#E3D5C1] rounded-sm shadow-lg max-h-64 overflow-auto">
                    {results.map((r, i) => (
                        <li
                            key={r.place_id}
                            data-testid={`panchang-city-option-${i}`}
                            onClick={() => {
                                setQuery(r.display_name);
                                setOpen(false);
                                onSelect({
                                    place_name: r.display_name,
                                    latitude: parseFloat(r.lat),
                                    longitude: parseFloat(r.lon),
                                });
                            }}
                            className="px-3 py-2 text-sm hover:bg-[#F4F1E8] cursor-pointer border-b border-[#E3D5C1]/50 last:border-0"
                        >
                            {r.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function BigCard({ label, value, subtitle, testId, accent = "#8B1E0F" }) {
    return (
        <div
            data-testid={testId}
            className="ornate-frame bg-[#FCFAF5] rounded-sm p-6 card-lift"
            style={{ borderColor: "#C5A059" }}
        >
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#635647] font-bold">{label}</p>
            <p
                className="font-serif mt-2 leading-tight"
                style={{ color: accent, fontSize: "2rem" }}
            >
                {value}
            </p>
            {subtitle && (
                <p className="text-xs text-[#635647] mt-2 font-sans">{subtitle}</p>
            )}
        </div>
    );
}

function KeyValue({ label, value, testId }) {
    return (
        <div className="flex items-baseline justify-between gap-3 py-2 border-b border-[#E3D5C1]/50 last:border-0" data-testid={testId}>
            <span className="text-xs uppercase tracking-[0.15em] text-[#635647] font-bold">{label}</span>
            <span className="font-sans text-sm text-[#2C241B] font-semibold tabular-nums">{value}</span>
        </div>
    );
}

function TimeBand({ title, window, color, testId, desc, tz }) {
    return (
        <div
            data-testid={testId}
            className="rounded-sm p-4 border"
            style={{ borderColor: color, backgroundColor: `${color}0D` }}
        >
            <div className="flex items-center justify-between mb-1">
                <p className="text-xs uppercase tracking-[0.15em] font-bold" style={{ color }}>
                    {title}
                </p>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <p className="font-serif text-lg text-[#2C241B] tabular-nums">
                {window ? `${fmtTime(window.start, tz)} — ${fmtTime(window.end, tz)}` : "—"}
            </p>
            {desc && <p className="text-[11px] text-[#635647] mt-1">{desc}</p>}
        </div>
    );
}

export default function PanchangView({ defaultLocation }) {
    const today = new Date().toISOString().slice(0, 10);
    const [date, setDate] = useState(today);
    const [loc, setLoc] = useState(defaultLocation || {
        place_name: "New Delhi, India",
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: "Asia/Kolkata",
    });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPanchang = async (overrides = {}) => {
        const body = { ...loc, ...overrides };
        setLoading(true);
        setError(null);
        try {
            const resp = await axios.get(`${API}/get-panchang`, {
                params: {
                    latitude: body.latitude,
                    longitude: body.longitude,
                    date: overrides.date || date,
                    timezone: body.timezone || undefined,
                },
            });
            setData(resp.data);
        } catch (e) {
            setError(e?.response?.data?.detail || e.message || "Failed to fetch Panchang");
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPanchang();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const useGeo = () => {
        if (!navigator.geolocation) {
            setError("Geolocation not supported in this browser.");
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                // Reverse-geocode for display
                let name = `Lat ${lat.toFixed(3)}, Lon ${lon.toFixed(3)}`;
                try {
                    const r = await axios.get("https://nominatim.openstreetmap.org/reverse", {
                        params: { lat, lon, format: "json" },
                        headers: { "Accept-Language": "en" },
                    });
                    name = r.data?.display_name || name;
                } catch (_) {}
                const newLoc = {
                    place_name: name,
                    latitude: lat,
                    longitude: lon,
                    timezone: null,
                };
                setLoc(newLoc);
                const today = new Date().toISOString().slice(0, 10);
                setDate(today);
                fetchPanchang({ ...newLoc, date: today });
            },
            (err) => {
                setLoading(false);
                setError("Unable to get location: " + err.message);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <section data-testid="panchang-view" className="space-y-8">
            {/* Controls */}
            <div className="bg-[#FCFAF5] border border-[#E3D5C1] rounded-sm p-5 lg:p-6 card-lift">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-3">
                        <label className="block text-xs uppercase tracking-[0.15em] text-[#635647] font-bold mb-1.5">Date</label>
                        <input
                            data-testid="panchang-date-input"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-white border border-[#E3D5C1] rounded-sm px-3 py-2.5 font-sans text-sm text-[#2C241B] focus:outline-none focus:ring-1 focus:ring-[#D35400]"
                        />
                    </div>
                    <div className="md:col-span-5">
                        <label className="block text-xs uppercase tracking-[0.15em] text-[#635647] font-bold mb-1.5">Place</label>
                        <CitySearch
                            value={loc.place_name}
                            onSelect={(p) => setLoc((v) => ({ ...v, ...p, timezone: null }))}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <button
                            data-testid="use-my-location-btn"
                            onClick={useGeo}
                            className="w-full bg-transparent border border-[#8B1E0F] text-[#8B1E0F] hover:bg-[#8B1E0F]/5 font-semibold text-sm px-4 py-2.5 rounded-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="10" r="3"/>
                                <path d="M12 2a8 8 0 0 1 8 8c0 5.4-8 12-8 12S4 15.4 4 10a8 8 0 0 1 8-8z"/>
                            </svg>
                            Use My Location
                        </button>
                    </div>
                    <div className="md:col-span-2">
                        <button
                            data-testid="panchang-fetch-btn"
                            onClick={() => fetchPanchang()}
                            disabled={loading}
                            className="w-full bg-[#8B1E0F] hover:bg-[#6A160A] disabled:opacity-60 text-[#FCFAF5] font-semibold text-sm px-4 py-2.5 rounded-sm transition-colors"
                        >
                            {loading ? "Loading..." : "Show Panchang"}
                        </button>
                    </div>
                </div>
                {error && (
                    <div data-testid="panchang-error" className="mt-3 text-xs text-[#8B1E0F]">{error}</div>
                )}
            </div>

            {loading && !data && (
                <div className="flex flex-col items-center py-16 gap-4">
                    <MandalaLoader size={56} />
                    <p className="font-serif text-[#635647] italic">Reading the celestial clock...</p>
                </div>
            )}

            {data && (
                <>
                    {/* Header summary */}
                    <div className="bg-[#FCFAF5] border border-[#E3D5C1] rounded-sm p-5 lg:p-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#635647] font-bold">Today's Panchānga</p>
                        <h2 className="font-serif text-3xl lg:text-4xl text-[#8B1E0F] mt-1" data-testid="panchang-title">
                            {new Date(data.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: data.location.timezone })}
                        </h2>
                        <p className="text-sm text-[#635647] mt-1">
                            {loc.place_name} · {data.location.timezone}
                        </p>
                        <div className="divider-ornate my-3">
                            <span className="font-serif italic text-sm">॥ पञ्चाङ्ग ॥</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2 text-sm">
                            <div><span className="text-[#635647] block text-xs uppercase tracking-wider">Vāra</span><span className="font-serif text-base text-[#2C241B]">{data.vara.sanskrit}</span></div>
                            <div><span className="text-[#635647] block text-xs uppercase tracking-wider">Tithi</span><span className="font-serif text-base text-[#2C241B]">{data.tithi.name}</span></div>
                            <div><span className="text-[#635647] block text-xs uppercase tracking-wider">Nakṣatra</span><span className="font-serif text-base text-[#2C241B]">{data.nakshatra.name}</span></div>
                            <div><span className="text-[#635647] block text-xs uppercase tracking-wider">Yoga</span><span className="font-serif text-base text-[#2C241B]">{data.yoga.name}</span></div>
                            <div><span className="text-[#635647] block text-xs uppercase tracking-wider">Karaṇa</span><span className="font-serif text-base text-[#2C241B]">{data.karana.name}</span></div>
                        </div>
                    </div>

                    {/* Big cards row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <BigCard
                            testId="card-tithi"
                            label="Tithi · Lunar Day"
                            value={data.tithi.name}
                            subtitle={`${data.tithi.paksha} · ends ${fmtDateTime(data.tithi.ends_at, data.location.timezone)} · ${data.tithi.progress}% elapsed`}
                        />
                        <BigCard
                            testId="card-nakshatra"
                            label="Nakṣatra · Lunar Mansion"
                            value={data.nakshatra.name}
                            subtitle={`Pada ${data.nakshatra.pada} · ends ${fmtDateTime(data.nakshatra.ends_at, data.location.timezone)}`}
                            accent="#D35400"
                        />
                    </div>

                    {/* Sun & Moon */}
                    <div className="bg-[#FCFAF5] border border-[#E3D5C1] rounded-sm p-5 lg:p-6 card-lift">
                        <h3 className="font-serif text-xl text-[#2C241B] mb-4">Sun &amp; Moon</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div data-testid="sunrise-block" className="p-4 bg-[#F4F1E8] border border-[#E3D5C1] rounded-sm">
                                <p className="text-xs uppercase tracking-[0.15em] text-[#635647] font-bold">Sunrise</p>
                                <p className="font-serif text-2xl text-[#D35400] tabular-nums mt-1">{fmtTime(data.sun.sunrise, data.location.timezone)}</p>
                            </div>
                            <div data-testid="sunset-block" className="p-4 bg-[#F4F1E8] border border-[#E3D5C1] rounded-sm">
                                <p className="text-xs uppercase tracking-[0.15em] text-[#635647] font-bold">Sunset</p>
                                <p className="font-serif text-2xl text-[#8B1E0F] tabular-nums mt-1">{fmtTime(data.sun.sunset, data.location.timezone)}</p>
                            </div>
                            <div data-testid="moonrise-block" className="p-4 bg-[#F4F1E8] border border-[#E3D5C1] rounded-sm">
                                <p className="text-xs uppercase tracking-[0.15em] text-[#635647] font-bold">Moonrise</p>
                                <p className="font-serif text-2xl text-[#2C241B] tabular-nums mt-1">{fmtTime(data.moon.moonrise, data.location.timezone)}</p>
                            </div>
                            <div data-testid="moonset-block" className="p-4 bg-[#F4F1E8] border border-[#E3D5C1] rounded-sm">
                                <p className="text-xs uppercase tracking-[0.15em] text-[#635647] font-bold">Moonset</p>
                                <p className="font-serif text-2xl text-[#2C241B] tabular-nums mt-1">{fmtTime(data.moon.moonset, data.location.timezone)}</p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <KeyValue label="Day Length" value={data.sun.day_length_hours ? `${data.sun.day_length_hours.toFixed(2)} h` : "—"} testId="kv-day-length" />
                            <KeyValue label="Moon Rāśi" value={data.moon.rashi} testId="kv-moon-rashi" />
                            <KeyValue label="Paksha" value={data.tithi.paksha} testId="kv-paksha" />
                            <KeyValue label="Moon Longitude" value={`${data.moon.longitude.toFixed(2)}°`} testId="kv-moon-lon" />
                        </div>
                    </div>

                    {/* Timings */}
                    <div className="bg-[#FCFAF5] border border-[#E3D5C1] rounded-sm p-5 lg:p-6">
                        <h3 className="font-serif text-xl text-[#2C241B] mb-1">Muhūrta Timings</h3>
                        <p className="text-xs text-[#635647] mb-4">Auspicious and inauspicious periods of the day</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <TimeBand
                                testId="band-abhijit"
                                title="Abhijit Muhūrta"
                                window={data.auspicious.abhijit_muhurta}
                                color="#2F7D32"
                                desc="Most auspicious ~48 min at midday"
                                tz={data.location.timezone}
                            />
                            <TimeBand
                                testId="band-rahu"
                                title="Rāhu Kāla"
                                window={data.inauspicious.rahu_kaal}
                                color="#8B1E0F"
                                desc="Avoid new undertakings"
                                tz={data.location.timezone}
                            />
                            <TimeBand
                                testId="band-yamaganda"
                                title="Yamagaṇḍa"
                                window={data.inauspicious.yamaganda}
                                color="#D35400"
                                desc="Inauspicious · avoid travel"
                                tz={data.location.timezone}
                            />
                            <TimeBand
                                testId="band-gulika"
                                title="Gulika Kāla"
                                window={data.inauspicious.gulika}
                                color="#635647"
                                desc="Son of Saturn · neutral-inauspicious"
                                tz={data.location.timezone}
                            />
                        </div>
                    </div>

                    {/* Full details table */}
                    <div className="bg-[#FCFAF5] border border-[#E3D5C1] rounded-sm p-5 lg:p-6 overflow-x-auto">
                        <h3 className="font-serif text-xl text-[#2C241B] mb-4">All Five Limbs (पञ्चाङ्ग)</h3>
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="text-[#635647] uppercase text-xs tracking-wider border-b-2 border-[#E3D5C1]">
                                    <th className="py-2 pr-3">Limb</th>
                                    <th className="py-2 pr-3">Name</th>
                                    <th className="py-2 pr-3">Details</th>
                                    <th className="py-2">Ends / Valid</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-[#E3D5C1]/60"><td className="py-2.5 pr-3 font-semibold">Vāra</td><td>{data.vara.sanskrit}</td><td className="text-[#635647]">{data.vara.english}</td><td className="tabular-nums text-[#635647]">From sunrise</td></tr>
                                <tr className="border-b border-[#E3D5C1]/60"><td className="py-2.5 pr-3 font-semibold">Tithi</td><td>{data.tithi.name}</td><td className="text-[#635647]">{data.tithi.paksha}</td><td className="tabular-nums">{fmtDateTime(data.tithi.ends_at, data.location.timezone)}</td></tr>
                                <tr className="border-b border-[#E3D5C1]/60"><td className="py-2.5 pr-3 font-semibold">Nakṣatra</td><td>{data.nakshatra.name}</td><td className="text-[#635647]">Pada {data.nakshatra.pada}</td><td className="tabular-nums">{fmtDateTime(data.nakshatra.ends_at, data.location.timezone)}</td></tr>
                                <tr className="border-b border-[#E3D5C1]/60"><td className="py-2.5 pr-3 font-semibold">Yoga</td><td>{data.yoga.name}</td><td className="text-[#635647]">#{data.yoga.index}</td><td className="tabular-nums">{fmtDateTime(data.yoga.ends_at, data.location.timezone)}</td></tr>
                                <tr><td className="py-2.5 pr-3 font-semibold">Karaṇa</td><td>{data.karana.name}</td><td className="text-[#635647]">Half-tithi</td><td className="tabular-nums">{fmtDateTime(data.karana.ends_at, data.location.timezone)}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </section>
    );
}

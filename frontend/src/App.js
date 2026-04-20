import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import VedicChart from "./components/VedicChart";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const DEFAULT_FORM = {
    birth_date: "1990-01-01",
    birth_time: "12:00",
    place_name: "New Delhi, India",
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: "Asia/Kolkata",
};

function MandalaLoader({ size = 24 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            className="mandala-loader"
            fill="none"
        >
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
            <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
            {Array.from({ length: 8 }).map((_, i) => {
                const a = (i * 45 * Math.PI) / 180;
                return (
                    <line
                        key={i}
                        x1={32}
                        y1={32}
                        x2={32 + Math.cos(a) * 28}
                        y2={32 + Math.sin(a) * 28}
                        stroke="currentColor"
                        strokeWidth="1"
                        opacity="0.6"
                    />
                );
            })}
            <circle cx="32" cy="32" r="3" fill="currentColor" />
        </svg>
    );
}

function CitySearch({ value, onSelect }) {
    const [query, setQuery] = useState(value || "");
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef();
    const boxRef = useRef();

    useEffect(() => {
        setQuery(value || "");
    }, [value]);

    useEffect(() => {
        const handler = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const onChange = (e) => {
        const v = e.target.value;
        setQuery(v);
        setOpen(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (v.length < 2) {
            setResults([]);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const resp = await axios.get(
                    "https://nominatim.openstreetmap.org/search",
                    {
                        params: { q: v, format: "json", limit: 6, addressdetails: 1 },
                        headers: { "Accept-Language": "en" },
                    }
                );
                setResults(resp.data || []);
            } catch (e) {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 400);
    };

    const choose = (r) => {
        const display = r.display_name;
        const lat = parseFloat(r.lat);
        const lon = parseFloat(r.lon);
        setQuery(display);
        setOpen(false);
        onSelect({ place_name: display, latitude: lat, longitude: lon });
    };

    return (
        <div className="relative" ref={boxRef}>
            <label className="block text-xs uppercase tracking-[0.15em] text-[#635647] font-bold mb-1.5">
                Place of Birth
            </label>
            <div className="relative">
                <input
                    data-testid="city-search-input"
                    type="text"
                    value={query}
                    onChange={onChange}
                    onFocus={() => query.length >= 2 && setOpen(true)}
                    placeholder="Search city..."
                    className="w-full bg-white border border-[#E3D5C1] rounded-sm px-3 py-2.5 font-sans text-sm text-[#2C241B] focus:outline-none focus:ring-1 focus:ring-[#D35400] focus:border-[#D35400]"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <MandalaLoader size={18} />
                    </div>
                )}
            </div>
            {open && results.length > 0 && (
                <ul
                    data-testid="city-search-results"
                    className="absolute z-20 mt-1 w-full bg-[#FCFAF5] border border-[#E3D5C1] rounded-sm shadow-lg max-h-64 overflow-auto"
                >
                    {results.map((r, i) => (
                        <li
                            key={r.place_id}
                            data-testid={`city-option-${i}`}
                            onClick={() => choose(r)}
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

function BirthForm({ form, setForm, onSubmit, loading }) {
    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    return (
        <form
            data-testid="birth-form"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="space-y-4"
        >
            <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-[#635647] font-bold mb-1.5">
                    Date of Birth
                </label>
                <input
                    data-testid="birth-date-input"
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => update("birth_date", e.target.value)}
                    className="w-full bg-white border border-[#E3D5C1] rounded-sm px-3 py-2.5 font-sans text-sm text-[#2C241B] focus:outline-none focus:ring-1 focus:ring-[#D35400] focus:border-[#D35400]"
                    required
                />
            </div>
            <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-[#635647] font-bold mb-1.5">
                    Time of Birth
                </label>
                <input
                    data-testid="birth-time-input"
                    type="time"
                    value={form.birth_time}
                    onChange={(e) => update("birth_time", e.target.value)}
                    className="w-full bg-white border border-[#E3D5C1] rounded-sm px-3 py-2.5 font-sans text-sm text-[#2C241B] focus:outline-none focus:ring-1 focus:ring-[#D35400] focus:border-[#D35400]"
                    required
                />
            </div>
            <CitySearch
                value={form.place_name}
                onSelect={({ place_name, latitude, longitude }) => {
                    setForm((f) => ({
                        ...f,
                        place_name,
                        latitude,
                        longitude,
                        timezone: null, // let backend infer
                    }));
                }}
            />
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs uppercase tracking-[0.15em] text-[#635647] font-bold mb-1.5">
                        Latitude
                    </label>
                    <input
                        data-testid="latitude-input"
                        type="number"
                        step="0.000001"
                        value={form.latitude}
                        onChange={(e) => update("latitude", parseFloat(e.target.value))}
                        className="w-full bg-white border border-[#E3D5C1] rounded-sm px-3 py-2.5 font-sans text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-[0.15em] text-[#635647] font-bold mb-1.5">
                        Longitude
                    </label>
                    <input
                        data-testid="longitude-input"
                        type="number"
                        step="0.000001"
                        value={form.longitude}
                        onChange={(e) => update("longitude", parseFloat(e.target.value))}
                        className="w-full bg-white border border-[#E3D5C1] rounded-sm px-3 py-2.5 font-sans text-sm"
                    />
                </div>
            </div>
            <button
                data-testid="calculate-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B1E0F] hover:bg-[#6A160A] disabled:opacity-60 text-[#FCFAF5] font-sans font-semibold text-sm px-6 py-3 rounded-sm transition-colors shadow-sm tracking-wide flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <MandalaLoader size={18} />
                        <span>Casting Chart...</span>
                    </>
                ) : (
                    "Generate Kundali"
                )}
            </button>
        </form>
    );
}

function BirthHeader({ data, placeName }) {
    if (!data?.birth) return null;
    const b = data.birth;
    const local = new Date(b.local_time);
    const fmt = local.toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
    });
    return (
        <div data-testid="birth-header" className="bg-[#FCFAF5] border border-[#E3D5C1] rounded-sm p-5 lg:p-6 card-lift">
            <p className="text-xs uppercase tracking-[0.2em] text-[#635647] font-bold">Birth Details</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-[#2C241B] mt-1">
                {placeName || "Unnamed Native"}
            </h2>
            <div className="divider-ornate my-3">
                <span className="font-serif italic text-sm">॥ कुण्डली ॥</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-[#2C241B]">
                <div><span className="text-[#635647]">Local:</span> {fmt}</div>
                <div><span className="text-[#635647]">Timezone:</span> {b.timezone}</div>
                <div><span className="text-[#635647]">Latitude:</span> {b.latitude.toFixed(4)}°</div>
                <div><span className="text-[#635647]">Longitude:</span> {b.longitude.toFixed(4)}°</div>
                <div><span className="text-[#635647]">Ayanamsa:</span> {b.ayanamsa.toFixed(4)}° (Lahiri)</div>
                <div><span className="text-[#635647]">Julian Day:</span> {b.julian_day.toFixed(3)}</div>
            </div>
        </div>
    );
}

function PlanetsTable({ planets, ascendant }) {
    if (!planets) return null;
    const rows = [ascendant, ...planets].filter(Boolean);
    return (
        <div data-testid="planets-table" className="bg-[#FCFAF5] border border-[#E3D5C1] rounded-sm p-5 lg:p-6 overflow-x-auto">
            <h3 className="font-serif text-xl text-[#2C241B] mb-4">Graha Positions</h3>
            <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="text-[#635647] uppercase text-xs tracking-wider border-b-2 border-[#E3D5C1]">
                        <th className="py-2 pr-3">Body</th>
                        <th className="py-2 pr-3">Sign</th>
                        <th className="py-2 pr-3 tabular-nums">Degree</th>
                        <th className="py-2 pr-3">Sign Lord</th>
                        <th className="py-2 pr-3">Nakshatra</th>
                        <th className="py-2 pr-3">Pada</th>
                        <th className="py-2 pr-3">House</th>
                        <th className="py-2">R</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((p) => (
                        <tr key={p.name} className="border-b border-[#E3D5C1]/60 last:border-0">
                            <td className="py-2.5 pr-3 font-semibold text-[#2C241B]">{p.name}</td>
                            <td className="py-2.5 pr-3">{p.sign}</td>
                            <td className="py-2.5 pr-3 tabular-nums">{p.dms}</td>
                            <td className="py-2.5 pr-3">{p.sign_lord}</td>
                            <td className="py-2.5 pr-3">{p.nakshatra}</td>
                            <td className="py-2.5 pr-3 tabular-nums">{p.nakshatra_pada}</td>
                            <td className="py-2.5 pr-3 tabular-nums">{p.house}</td>
                            <td className="py-2.5 text-[#8B1E0F] font-bold">{p.retrograde ? "℞" : ""}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function DashaTable({ dasha }) {
    if (!dasha || !dasha.length) return null;
    const fmt = (iso) => new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
    return (
        <div data-testid="dasha-table" className="bg-[#FCFAF5] border border-[#E3D5C1] rounded-sm p-5 lg:p-6">
            <h3 className="font-serif text-xl text-[#2C241B] mb-4">Vimshottari Mahādaśā</h3>
            <p className="text-xs text-[#635647] mb-3">Full 120-year planetary cycle from birth</p>
            <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="text-[#635647] uppercase text-xs tracking-wider border-b-2 border-[#E3D5C1]">
                        <th className="py-2 pr-3">Mahādaśā Lord</th>
                        <th className="py-2 pr-3">Years</th>
                        <th className="py-2 pr-3">From</th>
                        <th className="py-2">To</th>
                    </tr>
                </thead>
                <tbody>
                    {dasha.map((d, i) => (
                        <tr key={i} className="border-b border-[#E3D5C1]/60 last:border-0">
                            <td className="py-2.5 pr-3 font-semibold text-[#8B1E0F]">{d.lord}</td>
                            <td className="py-2.5 pr-3 tabular-nums">{d.years}</td>
                            <td className="py-2.5 pr-3 tabular-nums">{fmt(d.start)}</td>
                            <td className="py-2.5 tabular-nums">{fmt(d.end)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function AshtakavargaTable({ ashtakavarga }) {
    if (!ashtakavarga) return null;
    const { bav, sav } = ashtakavarga;
    const planetOrder = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    const signShort = ["Ar","Ta","Ge","Cn","Le","Vi","Li","Sc","Sg","Cp","Aq","Pi"];
    return (
        <div data-testid="ashtakavarga-table" className="bg-[#FCFAF5] border border-[#E3D5C1] rounded-sm p-5 lg:p-6 overflow-x-auto">
            <h3 className="font-serif text-xl text-[#2C241B] mb-1">Aṣṭakavarga</h3>
            <p className="text-xs text-[#635647] mb-4">
                Bhinnāṣṭakavarga per planet and Sarvāṣṭakavarga totals across the 12 signs
            </p>
            <table className="w-full text-center border-collapse text-sm">
                <thead>
                    <tr className="text-[#635647] uppercase text-xs tracking-wider border-b-2 border-[#E3D5C1]">
                        <th className="py-2 px-2 text-left">Planet</th>
                        {signShort.map((s, i) => (
                            <th key={i} className="py-2 px-2">{s}</th>
                        ))}
                        <th className="py-2 px-2">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {planetOrder.map((p) => {
                        const row = bav[p];
                        const tot = row.reduce((a, b) => a + b, 0);
                        return (
                            <tr key={p} className="border-b border-[#E3D5C1]/60">
                                <td className="py-2 px-2 text-left font-semibold text-[#2C241B]">{p}</td>
                                {row.map((v, i) => (
                                    <td key={i} className="py-2 px-2 tabular-nums">{v}</td>
                                ))}
                                <td className="py-2 px-2 tabular-nums font-bold text-[#8B1E0F]">{tot}</td>
                            </tr>
                        );
                    })}
                    <tr className="border-t-2 border-[#8B1E0F]/60 bg-[#F4F1E8]">
                        <td className="py-2.5 px-2 text-left font-bold text-[#8B1E0F]">SAV</td>
                        {sav.map((v, i) => (
                            <td key={i} className="py-2.5 px-2 tabular-nums font-bold text-[#2C241B]">{v}</td>
                        ))}
                        <td className="py-2.5 px-2 tabular-nums font-bold text-[#8B1E0F]">
                            {sav.reduce((a, b) => a + b, 0)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

function ChartTabs({ data }) {
    const [tab, setTab] = useState("d1");
    const tabs = [
        { id: "d1", label: "D1 · Rāśi", subtitle: "Birth Chart" },
        { id: "d2", label: "D2 · Horā", subtitle: "Wealth" },
        { id: "d9", label: "D9 · Navāṁśa", subtitle: "Destiny / Marriage" },
    ];
    const chartMap = {
        d1: { map: data.d1_chart, asc: data.d1_asc_sign, title: "Rāśi Chart (D1)" },
        d2: { map: data.d2_chart, asc: data.d2_asc_sign, title: "Horā Chart (D2)" },
        d9: { map: data.d9_chart, asc: data.d9_asc_sign, title: "Navāṁśa Chart (D9)" },
    };
    const active = chartMap[tab];

    return (
        <div className="bg-[#FCFAF5] border border-[#E3D5C1] rounded-sm p-5 lg:p-8 card-lift">
            <div role="tablist" className="flex gap-6 border-b border-[#E3D5C1] mb-6 overflow-x-auto">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        data-testid={`tab-${t.id}`}
                        role="tab"
                        aria-selected={tab === t.id}
                        onClick={() => setTab(t.id)}
                        className={`py-3 px-1 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                            tab === t.id
                                ? "text-[#8B1E0F] border-[#8B1E0F]"
                                : "text-[#635647] border-transparent hover:text-[#8B1E0F]"
                        }`}
                    >
                        <div className="flex flex-col items-start">
                            <span className="tracking-wide">{t.label}</span>
                            <span className="text-[10px] uppercase tracking-[0.15em] text-[#C5A059] mt-0.5">
                                {t.subtitle}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
            <VedicChart
                houseMap={active.map}
                ascSign={active.asc}
                title={active.title}
                testId={`chart-${tab}`}
            />
            <p className="text-center text-xs text-[#635647] mt-4 italic">
                Lagna (Ascendant) occupies the top-center diamond · Houses proceed anti-clockwise
            </p>
        </div>
    );
}

function Header() {
    return (
        <header className="text-center py-12 lg:py-16 relative">
            <div className="divider-ornate mb-3 max-w-xs mx-auto">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059]">Sidereal · Lahiri</span>
            </div>
            <h1 className="font-serif text-5xl lg:text-6xl text-[#8B1E0F] tracking-tight font-semibold">
                Jyotiṣa Kuṇḍalī
            </h1>
            <p className="font-serif italic text-lg text-[#635647] mt-2">
                A Vedic birth chart — drawn in the North Indian tradition
            </p>
            <div className="divider-ornate mt-4 max-w-xs mx-auto">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059]">॥ ज्योतिष ॥</span>
            </div>
        </header>
    );
}

export default function App() {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const calculate = async (body) => {
        setLoading(true);
        setError(null);
        try {
            const resp = await axios.post(`${API}/calculate`, body);
            setData(resp.data);
        } catch (e) {
            setError(e?.response?.data?.detail || e.message || "Failed to compute chart");
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    // Auto-compute the default chart on initial load
    useEffect(() => {
        calculate({ ...DEFAULT_FORM });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = () => {
        calculate({
            birth_date: form.birth_date,
            birth_time: form.birth_time,
            latitude: form.latitude,
            longitude: form.longitude,
            timezone: form.timezone || null,
            place_name: form.place_name,
        });
    };

    return (
        <div className="parchment-bg min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Header />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-20">
                    <aside className="lg:col-span-4 xl:col-span-3">
                        <div className="bg-[#FCFAF5] border border-[#E3D5C1] rounded-sm p-5 lg:p-6 card-lift sticky top-6">
                            <h2 className="font-serif text-2xl text-[#2C241B] mb-1">Birth Details</h2>
                            <p className="text-xs text-[#635647] mb-5">
                                Enter the native's time & place of birth
                            </p>
                            <BirthForm
                                form={form}
                                setForm={setForm}
                                onSubmit={onSubmit}
                                loading={loading}
                            />
                            {error && (
                                <div
                                    data-testid="error-banner"
                                    className="mt-4 border border-[#8B1E0F]/40 bg-[#8B1E0F]/5 text-[#8B1E0F] text-xs p-3 rounded-sm"
                                >
                                    {error}
                                </div>
                            )}
                        </div>
                    </aside>
                    <main className="lg:col-span-8 xl:col-span-9 space-y-6 lg:space-y-8">
                        {loading && !data && (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <MandalaLoader size={64} />
                                <p className="font-serif text-[#635647] italic">Consulting the heavens...</p>
                            </div>
                        )}
                        {data && (
                            <>
                                <BirthHeader data={data} placeName={form.place_name} />
                                <ChartTabs data={data} />
                                <PlanetsTable
                                    planets={data.planets_data}
                                    ascendant={data.ascendant}
                                />
                                <DashaTable dasha={data.dasha} />
                                <AshtakavargaTable ashtakavarga={data.ashtakavarga} />
                            </>
                        )}
                    </main>
                </div>
                <footer className="text-center text-xs text-[#635647] pb-10">
                    <div className="divider-ornate max-w-md mx-auto mb-3">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059]">॥ शुभम् ॥</span>
                    </div>
                    Computed with Swiss Ephemeris · Lahiri Ayanāṁśa · Whole-Sign Houses
                </footer>
            </div>
        </div>
    );
}

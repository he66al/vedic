# Jyotiṣa Kuṇḍalī — Vedic Astrology & Drik Panchang

## Original Problem Statement
Build a Vedic astrology web app with Swiss Ephemeris. Calculate D1/D2/D9 charts with North-Indian diamond SVG plus Nakshatra, Vimshottari Dasha, Ashtakavarga. Extended with full Drik-style Panchang (5 limbs, Samvatsara, muhurtas, calendars, lagna transits, chandrabalam/tarabalam). Added multi-ayanamsa support, North/South chart toggle, English/Hindi UI, and advanced yogas.

## User Choices
- FastAPI backend · Pre-fill Delhi 1990-01-01 12:00
- Added: Nakshatra + Vimshottari Dasha + Ashtakavarga
- Traditional theme (Saffron/Crimson/Gold parchment)
- Full Swiss Ephemeris files
- 7 ayanamsa options (NC Lahiri, KP New/Old, Raman, KP Khullar, Sayana, Manoj)
- Chart styles: North Indian (diamond) + South Indian (4x4 grid)
- Bilingual UI: English / Hindi (EN/हिं toggle, no flags)

## Backend (`/app/backend`)
- `calculator.py` — D1/D2/D9, Vimshottari Dasha, Ashtakavarga (SAV=337). Accepts `ayanamsa` param.
- `ayanamsa.py` — 7 mappings (lahiri, kp_new, kp_old, raman, kp_khullar, sayan, manoj). Sayan = tropical (no sidereal shift).
- `panchang.py` / `advanced_panchang.py` — Drik panchang with Varjyam, Amrit Kalam, Sarvartha Siddhi, Amrita Siddhi yogas.
- `constants.py` / `panchang_constants.py` — Sanskrit tables.
- `server.py` — `POST /api/calculate`, `GET /api/get-panchang`, `GET /api/ayanamsa-options`.

## Frontend (`/app/frontend/src`)
- `i18n.js` — I18nProvider, EN/HI dictionary (~150 keys), LanguageSwitcher component.
- `App.js` — top-right language switcher, nav (Kundali/Panchanga), BirthForm with ayanamsa-select + chart-style toggle, BirthHeader with timezone-respecting dates.
- `components/VedicChart.jsx` — North-Indian diamond with prominent rashi numbers (1-12).
- `components/SouthIndianChart.jsx` — 4x4 grid, fixed rashis, ascendant marker (X + "Lg").
- `components/PanchangView.jsx` — 12 Drik sections; now includes Amrit Kalam / Varjyam / Sarvartha Siddhi / Amrita Siddhi yoga bands.

## Iterations
- **Iter 1** (D1/D2/D9 + Dasha + Ashtakavarga): 19/20 backend → fixed SAV=337.
- **Iter 2** (comprehensive Drik Panchang): 44/44 backend + 100% frontend.
- **Iter 3** (ayanamsa + N/S chart + i18n + advanced yogas): 57/57 backend + 92% frontend; fixed App.js onSubmit to include ayanamsa.
- Drik reference cross-checked for Kelowna 2026-04-20 (all values match within ~1 min).

## Tests
- `tests/test_vedic_api.py`, `tests/test_panchang_detailed.py`, `tests/test_iteration3.py`

## Backlog
- P1: Day Festivals & Events feed
- P1: Antardasha sub-periods within current Mahadasha
- P2: Shareable image/PDF export of chart & panchang
- P2: Additional Dasha systems (Ashtottari, Yogini)

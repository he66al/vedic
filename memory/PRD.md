# Jyotiṣa Kuṇḍalī — Vedic Astrology & Drik Panchang

## Original Problem Statement
Build a Vedic astrology web app with Swiss Ephemeris (Lahiri ayanamsa). Calculate D1 (Rashi), D2 (Hora), D9 (Navamsha) charts with North-Indian diamond SVG, plus Nakshatra, Vimshottari Dasha, Ashtakavarga. Extended with full Drik-style Panchang tab (Tithi/Nakshatra/Yoga/Karana/Vara transitions, Sunrise/Sunset/Moonrise/Moonset, Samvatsara/Samvat, Ritu/Ayana, 7 auspicious + 5 inauspicious muhurtas, Udaya Lagna transits, Chandrabalam/Tarabalam, Shool/Vasa, other calendars & epoch).

## User Choices
- FastAPI backend
- Pre-fill sample: New Delhi, 1990-01-01, 12:00
- Added features: Nakshatra + Vimshottari Dasha + Ashtakavarga
- Traditional theme (Saffron / Crimson / Gold — "Saffron Manuscript")
- Full Swiss Ephemeris files downloaded

## Architecture
- **Backend** (`/app/backend`):
  - `calculator.py` — D1/D2/D9, planetary positions, Vimshottari Dasha, Ashtakavarga (SAV=337 canonical)
  - `panchang.py` — lean panchang (legacy)
  - `advanced_panchang.py` — comprehensive Drik panchang
  - `constants.py`, `panchang_constants.py` — Sanskrit name tables, Samvatsaras, Ritus, Dur Muhurta table, Chandrabalam/Tarabalam offsets
  - `ephe/` — Swiss Ephemeris files (sepl_18.se1, semo_18.se1, seas_18.se1)
  - `server.py` — `POST /api/calculate`, `GET /api/get-panchang?detailed=true`
- **Frontend** (`/app/frontend/src`):
  - `App.js` — top nav (Kundali / Panchanga), birth form, auto-compute on load
  - `components/VedicChart.jsx` — North-Indian diamond SVG
  - `components/PanchangView.jsx` — 12 Drik sections

## Implemented
- [x] (2026-04-20) D1/D2/D9 charts with Lahiri, Rahu/Ketu exactly 180° apart
- [x] Whole-sign houses, Nakshatra & Pada, Vimshottari Dasha (9 periods, 120y total)
- [x] Ashtakavarga BAV per planet + SAV (canonical 337)
- [x] North-Indian diamond SVG with traditional crimson/gold styling
- [x] Nominatim city autocomplete, timezone auto-inference
- [x] Drik Panchang with 5-limb transitions (Tithi/Nak/Yoga/Karana sequences through sunrise→next sunrise)
- [x] Samvatsara (Vikram + Shaka), Chandramasa (Purnimanta/Amanta), Pravishte
- [x] Ritu (Drik tropical + Vedic sidereal), Ayana, Dinamana/Ratrimana/Madhyahna
- [x] 7 Auspicious muhurtas: Brahma, Pratah Sandhya, Abhijit, Vijay, Godhuli, Sayahna Sandhya, Nishita
- [x] Inauspicious: Rahu Kalam, Yamaganda, Gulika, Dur Muhurtam (weekday table), Bhadra (Vishti windows)
- [x] Udaya Lagna Muhurta (ascendant sign transits for full day)
- [x] Chandrabalam + Tarabalam lists
- [x] Disha Shool, Rahu Vasa, Chandra Vasa
- [x] Other calendars: Kaliyuga year, Kali Ahargana, Julian Day, MJD, Rata Die, Ayanamsha, National Civil & Nirayana dates
- [x] "Use My Location" button (geolocation + reverse geocode)
- [x] Verified against Drik Panchang for Kelowna 2026-04-20: all values match within ~1 minute

## Tests
- `tests/test_vedic_api.py` (20 cases) — chart/dasha/ashtakavarga accuracy
- `tests/test_panchang_detailed.py` (24 cases) — Kelowna Drik reference
- Backend: 44/44 passing · Frontend: 100%

## Backlog / Future Enhancements
- P1: Amrit Kalam, Varjyam, Sarvartha/Amrita Siddhi Yoga flags
- P1: Tithi/Nakshatra-based festival calendar
- P2: Multi-language Sanskrit/Devanagari labels
- P2: PDF export of chart & panchang
- P2: Antardasha (sub-periods) within current Mahadasha

# Jyotiṣa Kuṇḍalī — Vedic Astrology & Drik Panchang

## Original Problem Statement
Build a Vedic astrology web app with Swiss Ephemeris. Compute D1..D60 divisional charts, comprehensive Drik Panchang with all classical elements, multi-ayanamsa support, North/South chart styles, bilingual UI (English/Hindi), and chart export (PNG/PDF/Share).

## Implemented Features
- **Charts**: 16 divisional charts — D1 Rāśi, D2 Horā, D3 Drekkāṇa, D4 Chaturthāṁśa, D7 Saptāṁśa, D9 Navāṁśa, D10 Daśāṁśa, D12 Dvādaśāṁśa, D16 Ṣoḍaśāṁśa, D20 Viṁśāṁśa, D24 Chaturviṁśāṁśa, D27 Bhāṁśa, D30 Triṁśāṁśa (special uneven segments), D40 Khavedāṁśa, D45 Akṣavedāṁśa, D60 Ṣaṣṭyāṁśa.
- **Chart Styles**: North Indian diamond (rashi numbers prominent) + South Indian 4×4 grid (fixed rashis, ascendant marker).
- **Ayanamsa options**: NC Lahiri (default), KP New, KP Old, BV Raman, KP Khullar, Sāyana Tropical, Manoj.
- **Planet details**: positions, nakshatra + pada, retrograde, sign lord, house.
- **Vimshottari Dasha** (9 mahadashas, 120y), **Ashtakavarga** (BAV per planet + SAV=337 canonical).
- **Drik Panchang** (15+ sections): 5 limbs with intra-day transitions; Samvatsara (Vikram + Shaka); Chandramasa (Amanta/Purnimanta); Pravishte; Ritu (Drik+Vedic); Ayana; Dinamana/Ratrimana/Madhyahna; 7 auspicious muhurtas (Brahma, Pratah Sandhya, Abhijit, Vijay, Godhuli, Sayahna Sandhya, Nishita); Inauspicious (Rahu Kalam, Yamaganda, Gulika, Dur Muhurtam, Bhadra, Varjyam); Amrit Kalam; Sarvartha & Amrita Siddhi Yogas; Udaya Lagna transits (12–13 rashi transits); Chandrabalam + Tarabalam lists; Disha Shool, Rahu Vasa, Chandra Vasa; Calendars (Kaliyuga year, Kali Ahargana, Julian Day, MJD, Rata Die, Lahiri Ayanamsha, National Civil & Nirayana dates).
- **Export**: Download chart as PNG · Generate multi-page PDF of all 16 vargas · Share via Web Share API with PNG download fallback.
- **i18n**: English / Hindi toggle (EN / हिं, no flags) with localStorage persistence.
- **City search**: Nominatim autocomplete, "Use My Location" button with reverse-geocoding.

## Architecture
- Backend (FastAPI + pyswisseph): `calculator.py`, `vargas.py`, `ayanamsa.py`, `panchang.py`, `advanced_panchang.py`, `constants.py`, `panchang_constants.py`, `server.py`.
- Frontend (React + TailwindCSS): `App.js`, `components/VedicChart.jsx`, `components/SouthIndianChart.jsx`, `components/PanchangView.jsx`, `i18n.js`.
- Backend endpoints: `POST /api/calculate`, `GET /api/get-panchang`, `GET /api/ayanamsa-options`.
- Swiss Ephemeris files in `backend/ephe/` (sepl_18, semo_18, seas_18).

## Test Status (Iteration 4)
- Backend: **72/72 pytest passing** (vargas structure, D30 special rules, D9 navamsa, backward-compat, panchang Drik reference for Kelowna, ayanamsa variants, varjyam/amrit/siddhi yogas)
- Frontend: **100%** (all 16 tabs, chart styles, export buttons, i18n toggle, ayanamsa dropdown, panchang sections, no console errors)

## Test Files
- `tests/test_vedic_api.py`
- `tests/test_panchang_detailed.py`
- `tests/test_iteration3.py`
- `tests/test_iteration4_vargas.py`

## Future Backlog
- P1: Muhurta Finder (search auspicious windows by purpose & date range with Chandrabalam/Tarabalam filter)
- P1: Antardasha sub-periods inside current Mahadasha
- P1: Day Festivals & Events feed (Ekadashi/Purnima/Amavasya + regional)
- P2: Saved charts / profile feature
- P2: Progress indicator for PDF export (~11s for all 16 vargas)

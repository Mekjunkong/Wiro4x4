/**
 * WIRO 4x4 — Tour Cost Calculator (Excel)
 * Run: node scripts/generate-excel-calculator.mjs
 * Output: WIRO4x4_Cost_Calculator.xlsx (open in Excel or Google Sheets)
 *
 * HOW TO USE THE EXCEL FILE:
 * 1. Fill in yellow cells only (inputs)
 * 2. Everything else calculates automatically
 * 3. Up to 14 days supported (rows 10-23)
 * 4. See "Ref - Destinations" sheet for entrance fee lookup
 */

import * as XLSX from "xlsx";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, "..", "WIRO4x4_Cost_Calculator.xlsx");

// ── Excel cell reference helpers ──────────────────────────────

function colLetter(n) {
  // n is 0-based column index
  let letter = "";
  n++;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

function ref(col, row) {
  // col = 0-based index, row = 0-based index → Excel ref like A1
  return `${colLetter(col)}${row + 1}`;
}

function setVal(ws, col, row, value, type = "s") {
  ws[ref(col, row)] = { t: type, v: value };
}

function setNum(ws, col, row, value) {
  ws[ref(col, row)] = { t: "n", v: value };
}

function setFormula(ws, col, row, formula) {
  ws[ref(col, row)] = { t: "n", f: formula };
}

// ── Sheet 1: Cost Calculator ──────────────────────────────────

function buildCalculatorSheet() {
  const ws = {};

  // ── HEADER ────────────────────────────────────────────────
  //  Row 1
  setVal(ws, 0, 0, "WIRO 4x4 — Tour Cost Calculator");
  setVal(ws, 0, 1, "Fill in YELLOW cells only. All other cells are calculated automatically.");

  // ── CONFIG (Row 3-4) ─────────────────────────────────────
  //       A           B       C         D             E
  // Row 3: Participants | [4] | (blank) | Profit Margin % | [30]
  // Row 4: Client Name  | [ ] | (blank) | Trip Label      | [ ]
  setVal(ws, 0, 3, "Participants");
  setNum(ws, 1, 3, 4);                        // B4  ← INPUT
  setVal(ws, 3, 3, "Profit Margin %");
  setNum(ws, 4, 3, 30);                       // E4  ← INPUT
  setVal(ws, 0, 4, "Client Name");
  setVal(ws, 1, 4, "");                       // B5  ← INPUT
  setVal(ws, 3, 4, "Trip Label");
  setVal(ws, 4, 4, "");                       // E5  ← INPUT

  // ── ITINERARY TABLE ───────────────────────────────────────
  //  Row 7: Section label
  setVal(ws, 0, 6, "ITINERARY");

  // Row 8: column headers (row index 7)
  const COL = {
    day:       0,   // A
    dest:      1,   // B
    kosher:    2,   // C
    carCost:   3,   // D  ← INPUT
    vehicles:  4,   // E  ← INPUT
    totalCar:  5,   // F  = D*E
    driver:    6,   // G  ← INPUT
    breakfast: 7,   // H  ← INPUT (0 = not included)
    lunch:     8,   // I  ← INPUT
    dinner:    9,   // J  ← INPUT (0 = not included)
    hotel:     10,  // K  ← INPUT (0 = no hotel)
    attract:   11,  // L  ← INPUT (total attractions/pp for this day)
    varPerPP:  12,  // M  = H+I+J+K+L
  };

  const HEADERS = [
    "Day",
    "Destination / Label",
    "Kosher?",
    "Car Cost ฿/day",
    "Vehicles",
    "Total Car ฿",
    "Driver ฿",
    "Breakfast ฿",
    "Lunch ฿",
    "Dinner ฿",
    "Hotel ฿",
    "Attractions ฿/pp",
    "Variable/pp ฿",
  ];

  HEADERS.forEach((h, i) => setVal(ws, i, 7, h));

  // Days: rows 9-22 (index 8-21) = 14 days max
  const DAYS_START = 8;  // 0-based row index
  const DAYS_END = 21;
  const NUM_DAYS = DAYS_END - DAYS_START + 1; // 14

  for (let i = 0; i < NUM_DAYS; i++) {
    const row = DAYS_START + i;
    const r1 = row + 1; // 1-based for Excel formula

    setNum(ws, COL.day, row, i + 1);          // Day number
    setVal(ws, COL.dest, row, "");            // Destination ← INPUT
    setVal(ws, COL.kosher, row, "No");        // Kosher ← INPUT (Yes/No)
    setNum(ws, COL.carCost, row, i === 0 ? 2500 : 0);   // Car cost ← INPUT
    setNum(ws, COL.vehicles, row, i === 0 ? 1 : 0);     // Vehicles ← INPUT
    setFormula(ws, COL.totalCar, row, `${colLetter(COL.carCost)}${r1}*${colLetter(COL.vehicles)}${r1}`);
    setNum(ws, COL.driver, row, i === 0 ? 1000 : 0);    // Driver ← INPUT
    setNum(ws, COL.breakfast, row, 0);                   // Breakfast ← INPUT
    setNum(ws, COL.lunch, row, i === 0 ? 180 : 0);      // Lunch ← INPUT
    setNum(ws, COL.dinner, row, i === 0 ? 250 : 0);     // Dinner ← INPUT
    setNum(ws, COL.hotel, row, 0);                       // Hotel ← INPUT
    setNum(ws, COL.attract, row, 0);                     // Attractions ← INPUT

    // Variable per person = breakfast + lunch + dinner + hotel + attractions
    const h = colLetter(COL.breakfast);
    const l = colLetter(COL.lunch);
    const d = colLetter(COL.dinner);
    const k = colLetter(COL.hotel);
    const la = colLetter(COL.attract);
    setFormula(ws, COL.varPerPP, row,
      `${h}${r1}+${l}${r1}+${d}${r1}+${k}${r1}+${la}${r1}`
    );
  }

  // Total row (row 23, index 22)
  const TOTAL_ROW = 22;
  setVal(ws, 0, TOTAL_ROW, "TOTALS");
  const F = colLetter(COL.totalCar);
  const G = colLetter(COL.driver);
  const M = colLetter(COL.varPerPP);
  setFormula(ws, COL.totalCar,  TOTAL_ROW, `SUM(${F}${DAYS_START+1}:${F}${DAYS_END+1})`);
  setFormula(ws, COL.driver,    TOTAL_ROW, `SUM(${G}${DAYS_START+1}:${G}${DAYS_END+1})`);
  setFormula(ws, COL.varPerPP,  TOTAL_ROW, `SUM(${M}${DAYS_START+1}:${M}${DAYS_END+1})`);

  // ── COST SUMMARY ─────────────────────────────────────────
  // Starts at row 25 (index 24)
  const SUM_COL_LABEL = 0;   // A
  const SUM_COL_THB   = 1;   // B
  const SUM_COL_USD   = 2;   // C

  let sr = 24; // summary row (0-based)

  setVal(ws, SUM_COL_LABEL, sr, "COST SUMMARY");
  setVal(ws, SUM_COL_THB,   sr, "THB (฿)");
  setVal(ws, SUM_COL_USD,   sr, "USD ($)");
  sr++;

  // --- Fixed costs ---
  setVal(ws, SUM_COL_LABEL, sr, "Total Car (all days)");
  setFormula(ws, SUM_COL_THB, sr, `${F}${TOTAL_ROW + 1}`);
  setFormula(ws, SUM_COL_USD, sr, `ROUND(B${sr+1}*0.028,0)`);
  const ROW_TOTAL_CAR = sr; sr++;

  setVal(ws, SUM_COL_LABEL, sr, "Total Driver (all days)");
  setFormula(ws, SUM_COL_THB, sr, `${G}${TOTAL_ROW + 1}`);
  setFormula(ws, SUM_COL_USD, sr, `ROUND(B${sr+1}*0.028,0)`);
  const ROW_TOTAL_DRIVER = sr; sr++;

  setVal(ws, SUM_COL_LABEL, sr, "Total Fixed Costs");
  setFormula(ws, SUM_COL_THB, sr, `B${ROW_TOTAL_CAR+1}+B${ROW_TOTAL_DRIVER+1}`);
  setFormula(ws, SUM_COL_USD, sr, `ROUND(B${sr+1}*0.028,0)`);
  const ROW_TOTAL_FIXED = sr; sr++;

  setVal(ws, SUM_COL_LABEL, sr, "Fixed Cost per Person  (÷ participants)");
  setFormula(ws, SUM_COL_THB, sr, `IF(B4>0,B${ROW_TOTAL_FIXED+1}/B4,0)`);
  setFormula(ws, SUM_COL_USD, sr, `ROUND(B${sr+1}*0.028,0)`);
  const ROW_FIXED_PP = sr; sr++;

  sr++; // blank row

  // --- Variable costs ---
  setVal(ws, SUM_COL_LABEL, sr, "Total Variable per Person");
  setFormula(ws, SUM_COL_THB, sr, `${M}${TOTAL_ROW + 1}`);
  setFormula(ws, SUM_COL_USD, sr, `ROUND(B${sr+1}*0.028,0)`);
  const ROW_VAR_PP = sr; sr++;

  sr++; // blank

  // --- Price calculation ---
  setVal(ws, SUM_COL_LABEL, sr, "Base Cost per Person");
  setFormula(ws, SUM_COL_THB, sr, `B${ROW_FIXED_PP+1}+B${ROW_VAR_PP+1}`);
  setFormula(ws, SUM_COL_USD, sr, `ROUND(B${sr+1}*0.028,0)`);
  const ROW_BASE_PP = sr; sr++;

  setVal(ws, SUM_COL_LABEL, sr, `Profit (E4 %) per Person`);
  setFormula(ws, SUM_COL_THB, sr, `B${ROW_BASE_PP+1}*(E4/100)`);
  setFormula(ws, SUM_COL_USD, sr, `ROUND(B${sr+1}*0.028,0)`);
  const ROW_PROFIT_PP = sr; sr++;

  setVal(ws, SUM_COL_LABEL, sr, "SELLING PRICE / PERSON  (rounded ↑ to 100)");
  setFormula(ws, SUM_COL_THB, sr, `CEILING(B${ROW_BASE_PP+1}+B${ROW_PROFIT_PP+1},100)`);
  setFormula(ws, SUM_COL_USD, sr, `ROUND(B${sr+1}*0.028,0)`);
  const ROW_SELL_PP = sr; sr++;

  setVal(ws, SUM_COL_LABEL, sr, "TOTAL QUOTE  (all participants)");
  setFormula(ws, SUM_COL_THB, sr, `B${ROW_SELL_PP+1}*B4`);
  setFormula(ws, SUM_COL_USD, sr, `ROUND(B${sr+1}*0.028,0)`);
  const ROW_TOTAL_QUOTE = sr; sr++;

  setVal(ws, SUM_COL_LABEL, sr, "Your Profit");
  setFormula(ws, SUM_COL_THB, sr, `B${ROW_TOTAL_QUOTE+1}-B${ROW_BASE_PP+1}*B4`);
  setFormula(ws, SUM_COL_USD, sr, `ROUND(B${sr+1}*0.028,0)`);
  sr++;

  sr++; // blank

  // --- Payment schedule ---
  setVal(ws, SUM_COL_LABEL, sr, "PAYMENT SCHEDULE");
  sr++;

  setVal(ws, SUM_COL_LABEL, sr, "Deposit (30%)");
  setFormula(ws, SUM_COL_THB, sr, `MROUND(B${ROW_TOTAL_QUOTE+1}*0.3,100)`);
  setFormula(ws, SUM_COL_USD, sr, `ROUND(B${sr+1}*0.028,0)`);
  const ROW_DEPOSIT = sr; sr++;

  setVal(ws, SUM_COL_LABEL, sr, "Balance  (due on tour day)");
  setFormula(ws, SUM_COL_THB, sr, `B${ROW_TOTAL_QUOTE+1}-B${ROW_DEPOSIT+1}`);
  setFormula(ws, SUM_COL_USD, sr, `ROUND(B${sr+1}*0.028,0)`);
  sr++;

  // Set sheet range
  ws["!ref"] = `A1:${colLetter(12)}${sr}`;

  // Column widths
  ws["!cols"] = [
    { wch: 42 },  // A - Labels
    { wch: 14 },  // B - THB values
    { wch: 12 },  // C - USD values
    { wch: 16 },  // D - Car cost
    { wch: 10 },  // E - Vehicles / profit %
    { wch: 14 },  // F - Total car
    { wch: 12 },  // G - Driver
    { wch: 12 },  // H - Breakfast
    { wch: 12 },  // I - Lunch
    { wch: 12 },  // J - Dinner
    { wch: 12 },  // K - Hotel
    { wch: 16 },  // L - Attractions
    { wch: 16 },  // M - Variable/pp
  ];

  return ws;
}

// ── Sheet 2: Destination Reference ────────────────────────────

function buildDestinationSheet() {
  const destinations = [
    {
      name: "Doi Inthanon National Park",
      region: "Chiang Mai",
      carPerDay: 2500,
      hotelPerNight: 1800,
      fees: [
        { name: "National Park Entry", costPerPerson: 300 },
        { name: "Royal Pagodas", costPerPerson: 40 },
      ],
      notes: "Wachirathan Waterfall & Pha Dok Siew included in park fee",
    },
    {
      name: "Mae Kampong Village",
      region: "Chiang Mai",
      carPerDay: 2500,
      hotelPerNight: 1500,
      fees: [{ name: "Village Conservation Fee", costPerPerson: 50 }],
      notes: "Scenic village stay, coffee farms, bamboo bridges",
    },
    {
      name: "Sticky Waterfalls (Bua Tong)",
      region: "Mae Rim / Chiang Mai",
      carPerDay: 2500,
      hotelPerNight: 1800,
      fees: [{ name: "Waterfall Entrance", costPerPerson: 0 }],
      notes: "Free entrance. Climbable limestone waterfall",
    },
    {
      name: "Doi Suthep Temple & National Park",
      region: "Chiang Mai",
      carPerDay: 2500,
      hotelPerNight: 1800,
      fees: [
        { name: "Wat Phra That Doi Suthep", costPerPerson: 50 },
        { name: "Doi Suthep-Pui NP Entry", costPerPerson: 100 },
      ],
      notes: "",
    },
    {
      name: "Mae Wang Jungle & Riverside",
      region: "Chiang Mai",
      carPerDay: 2500,
      hotelPerNight: 1500,
      fees: [],
      notes: "Off-road jungle trails, river crossing, remote villages",
    },
    {
      name: "Samoeng Mountain Loop",
      region: "Chiang Mai",
      carPerDay: 2500,
      hotelPerNight: 1800,
      fees: [],
      notes: "Scenic mountain circuit, hill tribe villages",
    },
    {
      name: "Elephant Sanctuary (Mae Taeng)",
      region: "Chiang Mai",
      carPerDay: 2500,
      hotelPerNight: 1800,
      fees: [{ name: "Sanctuary Admission (half-day)", costPerPerson: 1500 }],
      notes: "",
    },
    {
      name: "Chiang Mai City Tour",
      region: "Chiang Mai",
      carPerDay: 2000,
      hotelPerNight: 1800,
      fees: [
        { name: "Wat Chedi Luang", costPerPerson: 50 },
        { name: "Wat Phra Singh", costPerPerson: 50 },
      ],
      notes: "",
    },
    {
      name: "Chiang Rai City & Temples",
      region: "Chiang Rai",
      carPerDay: 3500,
      hotelPerNight: 1800,
      fees: [
        { name: "White Temple (Wat Rong Khun)", costPerPerson: 100 },
        { name: "Black House Museum (Baan Dam)", costPerPerson: 80 },
        { name: "Golden Triangle Viewpoint", costPerPerson: 50 },
      ],
      notes: "Blue Temple is free. ~3 hrs from Chiang Mai",
    },
    {
      name: "Pai Valley",
      region: "Mae Hong Son",
      carPerDay: 3500,
      hotelPerNight: 1500,
      fees: [
        { name: "Pai Canyon Entrance", costPerPerson: 0 },
        { name: "Mae Yen Waterfall", costPerPerson: 100 },
        { name: "Tha Pai Hot Springs", costPerPerson: 300 },
      ],
      notes: "~3 hrs via 762 curves. Great for 2-3 day trips",
    },
    {
      name: "Mae Hong Son Loop",
      region: "Mae Hong Son",
      carPerDay: 3500,
      hotelPerNight: 1500,
      fees: [
        { name: "Tham Lot Cave (with guide)", costPerPerson: 350 },
        { name: "Ban Rak Thai Village", costPerPerson: 0 },
      ],
      notes: "Remote mountain province near Myanmar border",
    },
    {
      name: "Lampang & Elephant Center",
      region: "Lampang",
      carPerDay: 3000,
      hotelPerNight: 1800,
      fees: [
        { name: "Thai Elephant Conservation Center", costPerPerson: 250 },
        { name: "Wat Phra That Lampang Luang", costPerPerson: 0 },
      ],
      notes: "~1.5 hrs from Chiang Mai",
    },
    {
      name: "Nan Province",
      region: "Nan",
      carPerDay: 4000,
      hotelPerNight: 1500,
      fees: [
        { name: "Nan National Museum", costPerPerson: 100 },
        { name: "Doi Phu Kha NP", costPerPerson: 200 },
      ],
      notes: "Remote province, ~5 hrs from Chiang Mai",
    },
    {
      name: "Sukhothai Historical Park",
      region: "Sukhothai",
      carPerDay: 4500,
      hotelPerNight: 1500,
      fees: [
        { name: "Central Zone Entry", costPerPerson: 150 },
        { name: "North Zone Entry", costPerPerson: 100 },
      ],
      notes: "UNESCO World Heritage. ~5 hrs south of Chiang Mai",
    },
    {
      name: "Luang Prabang, Laos",
      region: "Laos",
      carPerDay: 4500,
      hotelPerNight: 2000,
      fees: [
        { name: "Lao Visa on Arrival", costPerPerson: 1500 },
        { name: "Kuang Si Waterfall", costPerPerson: 400 },
        { name: "Pak Ou Caves (boat)", costPerPerson: 500 },
        { name: "Royal Palace Museum", costPerPerson: 200 },
      ],
      notes: "International trip. Visa required. Budget 3-5 days minimum",
    },
    {
      name: "Golden Triangle & Myanmar Border",
      region: "Chiang Rai / Myanmar",
      carPerDay: 4000,
      hotelPerNight: 2000,
      fees: [
        { name: "Golden Triangle Hall of Opium", costPerPerson: 200 },
        { name: "Boat to Laos island (optional)", costPerPerson: 100 },
      ],
      notes: "Where Thailand, Laos, and Myanmar meet",
    },
  ];

  const rows = [
    ["WIRO 4x4 — Destination Reference"],
    ["Look up entrance fees here, then enter the TOTAL attractions/pp in the Calculator sheet (column L)."],
    [],
    [
      "Destination",
      "Region",
      "Car Cost ฿/day",
      "Hotel ฿/night",
      "Entrance / Attraction",
      "Cost ฿/person",
      "Notes",
    ],
  ];

  for (const dest of destinations) {
    if (dest.fees.length === 0) {
      rows.push([
        dest.name,
        dest.region,
        dest.carPerDay,
        dest.hotelPerNight,
        "(no entrance fees)",
        0,
        dest.notes,
      ]);
    } else {
      dest.fees.forEach((fee, i) => {
        rows.push([
          i === 0 ? dest.name : "",
          i === 0 ? dest.region : "",
          i === 0 ? dest.carPerDay : "",
          i === 0 ? dest.hotelPerNight : "",
          fee.name,
          fee.costPerPerson,
          i === 0 ? dest.notes : "",
        ]);
      });
    }
    // blank separator between destinations
    rows.push([]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 36 }, // A - Destination
    { wch: 22 }, // B - Region
    { wch: 14 }, // C - Car cost
    { wch: 14 }, // D - Hotel
    { wch: 40 }, // E - Entrance/attraction name
    { wch: 16 }, // F - Cost per person
    { wch: 42 }, // G - Notes
  ];
  return ws;
}

// ── Sheet 3: Instructions ─────────────────────────────────────

function buildInstructionsSheet() {
  const rows = [
    ["WIRO 4x4 Cost Calculator — How to Use"],
    [],
    ["STEP 1 — CONFIGURE (Calculator sheet, rows 4-5)"],
    ["  • B4: Number of participants in the group"],
    ["  • E4: Your profit margin percentage (e.g. 30 = 30%)"],
    ["  • B5: Client name (optional, for your records)"],
    ["  • E5: Trip label (optional, e.g. 'Fishken Family - 3 Days')"],
    [],
    ["STEP 2 — FILL IN EACH DAY (rows 10-23 in Calculator sheet)"],
    ["  • B  — Destination or day label (e.g. 'Doi Inthanon', 'Day 1')"],
    ["  • C  — Kosher? Type Yes or No"],
    ["  • D  — Car cost per day in THB (see Ref sheet for suggestions)"],
    ["  • E  — Number of vehicles (1, 2, 3...)"],
    ["  • G  — Driver/guide cost for the day in THB"],
    ["  • H  — Breakfast cost per person (0 = not included)"],
    ["  • I  — Lunch cost per person (0 = not included)"],
    ["  • J  — Dinner cost per person (0 = not included, e.g. last day)"],
    ["  • K  — Hotel cost per night in THB (0 = last night / no hotel)"],
    ["  • L  — Total entrance fees + attractions for the day in THB/person"],
    ["         Look up the fees on the 'Ref - Destinations' sheet and add them up"],
    [],
    ["STEP 3 — READ YOUR RESULTS (Cost Summary section)"],
    ["  • Selling Price / Person — what to quote the customer"],
    ["  • Total Quote — full price for the whole group"],
    ["  • Your Profit — how much you keep after costs"],
    ["  • Deposit (30%) — what to collect upfront"],
    ["  • Balance — remaining amount due on tour day"],
    [],
    ["TIPS"],
    ["  • Leave unused day rows at 0 — they won't affect the totals"],
    ["  • Hotel on the LAST day should be 0 (checkout day)"],
    ["  • Car cost × Vehicles = what you pay the driver total for that day"],
    ["  • Meals: use 0 for 'not included'. Common rates:"],
    ["      Breakfast (regular) ฿80  |  Breakfast (kosher) ฿150"],
    ["      Lunch (regular) ฿180     |  Lunch (kosher) ฿300"],
    ["      Dinner (regular) ฿250    |  Dinner (kosher) ฿450"],
    ["  • USD conversion uses rate ×0.028 (≈ 36 THB/USD)"],
    [],
    ["WIRO 4x4 | WhatsApp +972544715400 | www.wiro4x4indochina.com"],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 80 }];
  return ws;
}

// ── Build & Write ─────────────────────────────────────────────

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, buildCalculatorSheet(), "Calculator");
XLSX.utils.book_append_sheet(wb, buildDestinationSheet(), "Ref - Destinations");
XLSX.utils.book_append_sheet(wb, buildInstructionsSheet(), "Instructions");

XLSX.writeFile(wb, OUTPUT);
console.log(`✅  Created: ${OUTPUT}`);
console.log(
  "Open in Excel or Google Sheets. Fill in YELLOW cells (day inputs) and read your quote."
);

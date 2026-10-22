import { housingByYear } from "@/data/housing";
import { calculate, calculateDepositConversion } from "@/utils/calculator";

let failed = false;

function assertEqual(actual: number, expected: number, label: string) {
  if (actual !== expected) {
    failed = true;
    console.error(
      `FAIL: ${label} -> expected ${expected.toLocaleString()}, got ${actual.toLocaleString()}`
    );
    return;
  }
  console.log(`PASS: ${label} -> ${actual.toLocaleString()}`);
}

function findType(year: string, categoryId: string, typeId: string) {
  const housing = housingByYear[year];
  if (!housing) throw new Error(`year not found: ${year}`);
  const category = housing.categories.find((c) => c.id === categoryId);
  if (!category) throw new Error(`category not found: ${year}/${categoryId}`);
  const type = category.types.find((t) => t.id === typeId);
  if (!type) throw new Error(`type not found: ${year}/${categoryId}/${typeId}`);
  return type;
}

// ---- 신혼부부 36형 (원본 스펙 케이스, 2026) ----
const newlywed36 = findType("2026", "newlywed", "36");

const newlywedCases = [
  { additionalDeposit: 0, expectedDeposit: 105_600_000, expectedRent: 448_800 },
  { additionalDeposit: 10_000_000, expectedDeposit: 115_600_000, expectedRent: 398_800 },
  { additionalDeposit: 20_000_000, expectedDeposit: 125_600_000, expectedRent: 348_800 },
  { additionalDeposit: 53_000_000, expectedDeposit: 158_600_000, expectedRent: 183_800 },
];

newlywedCases.forEach((c, i) => {
  const result = calculate(newlywed36, housingByYear["2026"].estimatedManagementFee, {
    additionalDeposit: c.additionalDeposit,
    myCash: 0,
    annualRatePercent: 3.2,
  });
  assertEqual(
    result.finalDeposit,
    c.expectedDeposit,
    `신혼부부36 CASE ${i + 1} deposit (additional=${c.additionalDeposit.toLocaleString()})`
  );
  assertEqual(
    result.finalRent,
    c.expectedRent,
    `신혼부부36 CASE ${i + 1} rent (additional=${c.additionalDeposit.toLocaleString()})`
  );
});

const maxCase = calculate(newlywed36, housingByYear["2026"].estimatedManagementFee, {
  additionalDeposit: 53_000_000,
  myCash: 20_000_000,
  annualRatePercent: 3.2,
});
assertEqual(maxCase.contractAmount, 10_560_000, "계약금 고정 확인 (최대전환 시)");

// ---- 연도별 전체 주택형: 기본/최대전환/최저전환 값 검증 ----
interface TypeCase {
  year: string;
  categoryId: string;
  typeId: string;
  label: string;
  base: { deposit: number; rent: number };
  max: { deposit: number; rent: number };
  min: { deposit: number; rent: number };
  contract: number;
}

const allTypeCases: TypeCase[] = [
  // ---- 2026.05.15 공고 (44형 없음, 고령자 36형 있음) ----
  { year: "2026", categoryId: "student", typeId: "16", label: "2026 대학생 16형", base: { deposit: 47_600_000, rent: 202_300 }, max: { deposit: 71_600_000, rent: 82_300 }, min: { deposit: 8_600_000, rent: 316_050 }, contract: 4_760_000 },
  { year: "2026", categoryId: "student", typeId: "29", label: "2026 대학생 29형", base: { deposit: 74_460_000, rent: 316_450 }, max: { deposit: 111_460_000, rent: 131_450 }, min: { deposit: 12_460_000, rent: 497_280 }, contract: 7_446_000 },
  { year: "2026", categoryId: "youth", typeId: "16", label: "2026 청년 16형", base: { deposit: 50_400_000, rent: 214_200 }, max: { deposit: 75_400_000, rent: 89_200 }, min: { deposit: 8_400_000, rent: 336_700 }, contract: 5_040_000 },
  { year: "2026", categoryId: "youth", typeId: "29", label: "2026 청년 29형", base: { deposit: 78_840_000, rent: 335_070 }, max: { deposit: 118_840_000, rent: 135_070 }, min: { deposit: 12_840_000, rent: 527_570 }, contract: 7_884_000 },
  { year: "2026", categoryId: "senior", typeId: "29", label: "2026 고령자(주거약자용) 29형", base: { deposit: 83_220_000, rent: 353_680 }, max: { deposit: 125_220_000, rent: 143_680 }, min: { deposit: 14_220_000, rent: 554_930 }, contract: 8_322_000 },
  { year: "2026", categoryId: "senior", typeId: "36", label: "2026 고령자(주거약자용) 36형", base: { deposit: 100_320_000, rent: 426_360 }, max: { deposit: 151_320_000, rent: 171_360 }, min: { deposit: 16_320_000, rent: 671_360 }, contract: 10_032_000 },
  { year: "2026", categoryId: "welfare", typeId: "29", label: "2026 주거급여수급자 29형", base: { deposit: 65_700_000, rent: 279_220 }, max: { deposit: 98_700_000, rent: 114_220 }, min: { deposit: 10_700_000, rent: 439_630 }, contract: 6_570_000 },
  { year: "2026", categoryId: "newlywed", typeId: "36", label: "2026 신혼부부 36형", base: { deposit: 105_600_000, rent: 448_800 }, max: { deposit: 158_600_000, rent: 183_800 }, min: { deposit: 17_600_000, rent: 705_460 }, contract: 10_560_000 },

  // ---- 2025년 공고 (44형 있음, 고령자 36형 없음) ----
  { year: "2025", categoryId: "student", typeId: "16", label: "2025 대학생 16형", base: { deposit: 47_260_000, rent: 208_730 }, max: { deposit: 68_260_000, rent: 86_230 }, min: { deposit: 8_260_000, rent: 322_480 }, contract: 4_726_000 },
  { year: "2025", categoryId: "student", typeId: "29", label: "2025 대학생 29형", base: { deposit: 73_440_000, rent: 324_360 }, max: { deposit: 106_440_000, rent: 131_860 }, min: { deposit: 12_440_000, rent: 502_270 }, contract: 7_344_000 },
  { year: "2025", categoryId: "youth", typeId: "16", label: "2025 청년 16형", base: { deposit: 50_040_000, rent: 221_010 }, max: { deposit: 72_040_000, rent: 92_670 }, min: { deposit: 9_040_000, rent: 340_590 }, contract: 5_004_000 },
  { year: "2025", categoryId: "youth", typeId: "29", label: "2025 청년 29형", base: { deposit: 77_760_000, rent: 343_440 }, max: { deposit: 112_760_000, rent: 139_270 }, min: { deposit: 13_760_000, rent: 530_100 }, contract: 7_776_000 },
  { year: "2025", categoryId: "senior", typeId: "29", label: "2025 고령자(주거약자용) 29형", base: { deposit: 82_080_000, rent: 362_520 }, max: { deposit: 119_080_000, rent: 146_680 }, min: { deposit: 14_080_000, rent: 560_850 }, contract: 8_208_000 },
  { year: "2025", categoryId: "welfare", typeId: "29", label: "2025 주거급여수급자 29형", base: { deposit: 64_800_000, rent: 286_200 }, max: { deposit: 93_800_000, rent: 117_030 }, min: { deposit: 10_800_000, rent: 443_700 }, contract: 6_480_000 },
  { year: "2025", categoryId: "newlywed", typeId: "36", label: "2025 신혼부부 36형", base: { deposit: 104_400_000, rent: 461_100 }, max: { deposit: 151_400_000, rent: 186_930 }, min: { deposit: 17_400_000, rent: 714_850 }, contract: 10_440_000 },
  { year: "2025", categoryId: "newlywed", typeId: "44", label: "2025 신혼부부 44형", base: { deposit: 116_800_000, rent: 515_860 }, max: { deposit: 169_800_000, rent: 206_690 }, min: { deposit: 19_800_000, rent: 798_770 }, contract: 11_680_000 },
];

allTypeCases.forEach((c) => {
  const type = findType(c.year, c.categoryId, c.typeId);
  const managementFee = housingByYear[c.year].estimatedManagementFee;

  const base = calculateDepositConversion(type, 0);
  assertEqual(base.finalDeposit, c.base.deposit, `${c.label} 기본 보증금`);
  assertEqual(base.finalRent, c.base.rent, `${c.label} 기본 월세`);

  const max = calculateDepositConversion(type, type.deposit.maxAdditional);
  assertEqual(max.finalDeposit, c.max.deposit, `${c.label} 최대전환 보증금`);
  assertEqual(max.finalRent, c.max.rent, `${c.label} 최대전환 월세`);

  const min = calculateDepositConversion(type, -type.deposit.maxReduction);
  assertEqual(min.finalDeposit, c.min.deposit, `${c.label} 최저전환 보증금`);
  assertEqual(min.finalRent, c.min.rent, `${c.label} 최저전환 월세`);

  const maxResult = calculate(type, managementFee, {
    additionalDeposit: type.deposit.maxAdditional,
    myCash: 0,
    annualRatePercent: 3.2,
  });
  assertEqual(maxResult.contractAmount, c.contract, `${c.label} 계약금 (최대전환 시에도 고정)`);

  const minResult = calculate(type, managementFee, {
    additionalDeposit: -type.deposit.maxReduction,
    myCash: 0,
    annualRatePercent: 3.2,
  });
  assertEqual(minResult.contractAmount, c.contract, `${c.label} 계약금 (최저전환 시에도 고정)`);
});

// ---- 2026년에는 44형이 없고, 2025년에는 고령자 36형이 없음을 확인 ----
if (housingByYear["2026"].categories.find((c) => c.id === "newlywed")!.types.some((t) => t.id === "44")) {
  failed = true;
  console.error("FAIL: 2026년에는 44형이 없어야 함");
} else {
  console.log("PASS: 2026년에는 44형이 없음");
}

if (housingByYear["2025"].categories.find((c) => c.id === "senior")!.types.some((t) => t.id === "36")) {
  failed = true;
  console.error("FAIL: 2025년에는 고령자 36형이 없어야 함");
} else {
  console.log("PASS: 2025년에는 고령자 36형이 없음");
}

if (failed) {
  console.error("\nSome calculator tests FAILED.");
  process.exit(1);
}

console.log("\nAll calculator tests passed.");

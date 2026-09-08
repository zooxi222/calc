import { activeHousing } from "@/data/housing";
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

function findType(categoryId: string, typeId: string) {
  const category = activeHousing.categories.find((c) => c.id === categoryId);
  if (!category) throw new Error(`category not found: ${categoryId}`);
  const type = category.types.find((t) => t.id === typeId);
  if (!type) throw new Error(`type not found: ${categoryId}/${typeId}`);
  return type;
}

// ---- 신혼부부 36형 (원본 스펙 케이스) ----
const newlywed36 = findType("newlywed", "36");

const newlywedCases = [
  { additionalDeposit: 0, expectedDeposit: 105_600_000, expectedRent: 448_800 },
  { additionalDeposit: 10_000_000, expectedDeposit: 115_600_000, expectedRent: 398_800 },
  { additionalDeposit: 20_000_000, expectedDeposit: 125_600_000, expectedRent: 348_800 },
  { additionalDeposit: 53_000_000, expectedDeposit: 158_600_000, expectedRent: 183_800 },
];

newlywedCases.forEach((c, i) => {
  const result = calculate(newlywed36, activeHousing.estimatedManagementFee, {
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

const maxCase = calculate(newlywed36, activeHousing.estimatedManagementFee, {
  additionalDeposit: 53_000_000,
  myCash: 20_000_000,
  annualRatePercent: 3.2,
});
assertEqual(maxCase.contractAmount, 10_560_000, "계약금 고정 확인 (최대전환 시)");

// ---- 2026.05.15 공고 전체 9개 주택형: 기본/최대전환 값 검증 ----
const allTypeCases: Array<{
  categoryId: string;
  typeId: string;
  label: string;
  base: { deposit: number; rent: number };
  max: { deposit: number; rent: number };
  contract: number;
}> = [
  { categoryId: "student", typeId: "16", label: "대학생 16형", base: { deposit: 47_600_000, rent: 202_300 }, max: { deposit: 71_600_000, rent: 82_300 }, contract: 4_760_000 },
  { categoryId: "student", typeId: "29", label: "대학생 29형", base: { deposit: 74_460_000, rent: 316_450 }, max: { deposit: 111_460_000, rent: 131_450 }, contract: 7_446_000 },
  { categoryId: "youth", typeId: "16", label: "청년 16형", base: { deposit: 50_400_000, rent: 214_200 }, max: { deposit: 75_400_000, rent: 89_200 }, contract: 5_040_000 },
  { categoryId: "youth", typeId: "29", label: "청년 29형", base: { deposit: 78_840_000, rent: 335_070 }, max: { deposit: 118_840_000, rent: 135_070 }, contract: 7_884_000 },
  { categoryId: "senior", typeId: "29", label: "고령자(주거약자용) 29형", base: { deposit: 83_220_000, rent: 353_680 }, max: { deposit: 125_220_000, rent: 143_680 }, contract: 8_322_000 },
  { categoryId: "senior", typeId: "36", label: "고령자(주거약자용) 36형", base: { deposit: 100_320_000, rent: 426_360 }, max: { deposit: 151_320_000, rent: 171_360 }, contract: 10_032_000 },
  { categoryId: "welfare", typeId: "29", label: "주거급여수급자 29형", base: { deposit: 65_700_000, rent: 279_220 }, max: { deposit: 98_700_000, rent: 114_220 }, contract: 6_570_000 },
  { categoryId: "newlywed", typeId: "36", label: "신혼부부 36형", base: { deposit: 105_600_000, rent: 448_800 }, max: { deposit: 158_600_000, rent: 183_800 }, contract: 10_560_000 },
];

allTypeCases.forEach((c) => {
  const type = findType(c.categoryId, c.typeId);

  const base = calculateDepositConversion(type, 0);
  assertEqual(base.finalDeposit, c.base.deposit, `${c.label} 기본 보증금`);
  assertEqual(base.finalRent, c.base.rent, `${c.label} 기본 월세`);

  const max = calculateDepositConversion(type, type.deposit.maxAdditional);
  assertEqual(max.finalDeposit, c.max.deposit, `${c.label} 최대전환 보증금`);
  assertEqual(max.finalRent, c.max.rent, `${c.label} 최대전환 월세`);

  const result = calculate(type, activeHousing.estimatedManagementFee, {
    additionalDeposit: type.deposit.maxAdditional,
    myCash: 0,
    annualRatePercent: 3.2,
  });
  assertEqual(result.contractAmount, c.contract, `${c.label} 계약금 (최대전환 시에도 고정)`);
});

if (failed) {
  console.error("\nSome calculator tests FAILED.");
  process.exit(1);
}

console.log("\nAll calculator tests passed.");

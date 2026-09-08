"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { HousingData } from "@/data/housing";
import { resolveHousingSelection } from "@/data/housing";
import { calculate } from "@/utils/calculator";
import HousingTypeSelect from "@/components/HousingTypeSelect";
import DepositStep from "@/components/DepositStep";
import CashStep from "@/components/CashStep";
import RateStep from "@/components/RateStep";
import ResultSection from "@/components/ResultSection";

const DEFAULT_RATE = 3.2;

interface Props {
  housing: HousingData;
  initialCategoryId: string;
  initialTypeId: string;
}

export default function Calculator({
  housing,
  initialCategoryId,
  initialTypeId,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [typeId, setTypeId] = useState(initialTypeId);
  const [additionalDeposit, setAdditionalDeposit] = useState(0);
  const [myCashMillion, setMyCashMillion] = useState<number | "">("");
  const [annualRatePercent, setAnnualRatePercent] = useState<number | "">(
    DEFAULT_RATE
  );

  const { category, type } = resolveHousingSelection(
    housing,
    categoryId,
    typeId
  );

  // URL 쿼리와 현재 선택 상태를 동기화한다 (전체 페이지 리로드 없이).
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", category.id);
    params.set("type", type.id);
    router.replace(`?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id, type.id]);

  const handleCategoryChange = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);
    const nextCategory =
      housing.categories.find((c) => c.id === nextCategoryId) ??
      housing.categories[0];
    // 새 공급대상에 현재 주택형이 없으면 첫 번째 주택형으로 자동 선택
    const stillValid = nextCategory.types.some((t) => t.id === typeId);
    const nextTypeId = stillValid ? typeId : nextCategory.types[0].id;
    setTypeId(nextTypeId);
    setAdditionalDeposit(0);
  };

  const handleTypeChange = (nextTypeId: string) => {
    setTypeId(nextTypeId);
    setAdditionalDeposit(0);
  };

  const myCash =
    (typeof myCashMillion === "number" ? myCashMillion : 0) * 1_000_000;
  const rate = typeof annualRatePercent === "number" ? annualRatePercent : 0;

  const result = useMemo(
    () =>
      calculate(type, housing.estimatedManagementFee, {
        additionalDeposit,
        myCash,
        annualRatePercent: rate,
      }),
    [type, housing.estimatedManagementFee, additionalDeposit, myCash, rate]
  );

  return (
    <main className="container">
      <header className="header">
        <h1>{housing.title}</h1>
        <p className="subtitle">
          {housing.housingName} · {category.name} {type.name}
        </p>
      </header>

      <HousingTypeSelect
        categories={housing.categories}
        selectedCategoryId={category.id}
        selectedTypeId={type.id}
        onCategoryChange={handleCategoryChange}
        onTypeChange={handleTypeChange}
      />

      <DepositStep
        type={type}
        additionalDeposit={additionalDeposit}
        onChange={setAdditionalDeposit}
      />

      <CashStep myCashMillion={myCashMillion} onChange={setMyCashMillion} />

      <RateStep
        annualRatePercent={annualRatePercent}
        onChange={setAnnualRatePercent}
      />

      <ResultSection type={type} result={result} />

      <footer className="footer-note">
        <p>
          본 계산기는 예상 비용 확인을 위한 참고용입니다.
          <br />
          실제 임대조건, 보증금 전환 가능 금액, 대출 가능 여부 및 금리는
          LH와 금융기관을 통해 반드시 확인해주세요.
        </p>
      </footer>
    </main>
  );
}

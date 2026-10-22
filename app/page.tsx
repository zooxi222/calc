import { Suspense } from "react";
import Calculator from "@/components/Calculator";
import {
  housingByYear,
  resolveHousingSelection,
  resolveHousingYear,
} from "@/data/housing";

interface PageProps {
  searchParams: Promise<{ year?: string; category?: string; type?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const year = resolveHousingYear(params.year);
  const housing = housingByYear[year];
  const { category, type } = resolveHousingSelection(
    housing,
    params.category,
    params.type
  );

  return (
    <Suspense>
      <Calculator
        housing={housing}
        initialYear={year}
        initialCategoryId={category.id}
        initialTypeId={type.id}
      />
    </Suspense>
  );
}

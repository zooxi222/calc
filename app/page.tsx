import { Suspense } from "react";
import Calculator from "@/components/Calculator";
import { activeHousing, resolveHousingSelection } from "@/data/housing";

interface PageProps {
  searchParams: Promise<{ category?: string; type?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const { category, type } = resolveHousingSelection(
    activeHousing,
    params.category,
    params.type
  );

  return (
    <Suspense>
      <Calculator
        housing={activeHousing}
        initialCategoryId={category.id}
        initialTypeId={type.id}
      />
    </Suspense>
  );
}

"use client";

import type { HousingCategory } from "@/data/housing";

interface Props {
  categories: HousingCategory[];
  selectedCategoryId: string;
  selectedTypeId: string;
  onCategoryChange: (categoryId: string) => void;
  onTypeChange: (typeId: string) => void;
}

export default function HousingTypeSelect({
  categories,
  selectedCategoryId,
  selectedTypeId,
  onCategoryChange,
  onTypeChange,
}: Props) {
  const selectedCategory =
    categories.find((c) => c.id === selectedCategoryId) ?? categories[0];

  return (
    <section className="card select-card">
      <div className="select-group">
        <label className="select-label" htmlFor="category-select">
          공급대상
        </label>
        <select
          id="category-select"
          className="select-input"
          value={selectedCategory.id}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="select-group">
        <label className="select-label" htmlFor="type-select">
          주택형
        </label>
        <select
          id="type-select"
          className="select-input"
          value={selectedTypeId}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          {selectedCategory.types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

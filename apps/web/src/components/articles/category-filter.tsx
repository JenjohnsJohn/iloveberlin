'use client';

export interface CategoryItem {
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: CategoryItem[];
  activeSlug: string;
  onCategoryChange: (slug: string) => void;
}

export function CategoryFilter({
  categories,
  activeSlug,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const isActive = category.slug === activeSlug;
        return (
          <button
            key={category.slug}
            onClick={() => onCategoryChange(category.slug)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}

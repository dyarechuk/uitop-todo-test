import type { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Filter by category
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}

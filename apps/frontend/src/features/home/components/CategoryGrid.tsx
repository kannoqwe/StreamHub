import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '@types';

export const CategoryGrid: React.FC<{ categories: Category[] }> = ({
    categories,
}) => (
    <section>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
            Browse Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
                <Link
                    key={category.id}
                    to={`/browse/${encodeURIComponent(category.name)}`}
                    className="group block"
                >
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2 bg-zinc-800">
                        <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-all"
                        />
                    </div>
                    <h3 className="font-semibold text-sm dark:text-zinc-200 group-hover:text-accent-500">
                        {category.name}
                    </h3>
                </Link>
            ))}
        </div>
    </section>
);

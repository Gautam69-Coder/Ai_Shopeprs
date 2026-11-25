import React from 'react';
import { Users, Bot, Sparkles, Database } from 'lucide-react';
import type { SyntheticShopper } from '../../types/shopper';
import { ShopperCard } from './ShopperCard';
import { Badge } from '../common/Badge';

interface ShoppersGridProps {
  shoppers: SyntheticShopper[];
  loading: boolean;
  activeBatchAudience?: string;
  totalSavedCount?: number;
}

export const ShoppersGrid: React.FC<ShoppersGridProps> = ({
  shoppers,
  loading,
  activeBatchAudience,
  totalSavedCount,
}) => {
  if (loading && shoppers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Bot className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Synthesizing Shoppers...
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The Groq LLM is crafting authentic fictional personas, assigning demographic traits, and modeling consumer price elasticity.
        </p>
      </div>
    );
  }

  if (shoppers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <Users className="w-7 h-7" aria-hidden="true" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          No Shoppers Generated Yet
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          Use the form above to define your target audience and generate your first cohort of synthetic consumers.
        </p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Supports up to 20 unique personas per generation</span>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Synthetic Shoppers Cohort
            </h2>
            <Badge variant="blue">
              {shoppers.length} {shoppers.length === 1 ? 'Profile' : 'Profiles'}
            </Badge>
          </div>
          {activeBatchAudience && (
            <span className="text-xs text-slate-500 hidden md:inline truncate max-w-md">
              &bull; Audience: "{activeBatchAudience}"
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span>Persisted in MongoDB Atlas</span>
          </span>
          {totalSavedCount !== undefined && totalSavedCount > 0 && (
            <span className="font-mono text-slate-400">
              ({totalSavedCount} total in DB)
            </span>
          )}
        </div>
      </div>

      {/* Shopper Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shoppers.map((shopper) => (
          <ShopperCard key={shopper._id || shopper.name} shopper={shopper} />
        ))}
      </div>
    </div>
  );
};

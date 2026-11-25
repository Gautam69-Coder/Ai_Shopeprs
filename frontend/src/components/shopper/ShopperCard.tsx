import React from 'react';
import {
  Briefcase,
  MapPin,
  Calendar,
  Wallet,
  Tag,
  Heart,
  User,
  Quote,
  Database,
} from 'lucide-react';
import type { SyntheticShopper, PriceSensitivity } from '../../types/shopper';
import { Badge } from '../common/Badge';

interface ShopperCardProps {
  shopper: SyntheticShopper;
}

const priceSensitivityConfig: Record<
  PriceSensitivity,
  { label: string; variant: 'success' | 'warning' | 'warning' }
> = {
  low: { label: 'Low Price Sensitivity', variant: 'success' },
  medium: { label: 'Moderate Sensitivity', variant: 'warning' },
  high: { label: 'High Price Sensitivity', variant: 'warning' },
};

export const ShopperCard: React.FC<ShopperCardProps> = ({ shopper }) => {
  const sensitivity = priceSensitivityConfig[shopper.price_sensitivity] || {
    label: shopper.price_sensitivity,
    variant: 'neutral',
  };

  // Format currency with standard locale formatter
  const formattedIncome = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(shopper.monthly_income);

  // Derive initial for avatar
  const initials = shopper.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top Banner Header */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {initials || <User className="w-5 h-5" aria-hidden="true" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">
              {shopper.name}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>{shopper.occupation}</span>
            </p>
          </div>
        </div>

        <Badge variant={sensitivity.variant} dot>
          {sensitivity.label}
        </Badge>
      </div>

      {/* Profile Body */}
      <div className="p-5 space-y-4 flex-1">
        {/* Demographic Metadata Chips */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span>{shopper.age} yrs</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{shopper.city}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 font-mono">
            <Wallet className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="truncate">₹{formattedIncome}/mo</span>
          </div>
        </div>

        {/* Bio */}
        <div className="relative pl-3 border-l-2 border-blue-200">
          <Quote className="w-3.5 h-3.5 text-blue-300 absolute -top-1 -left-2 bg-white" aria-hidden="true" />
          <p className="text-xs text-slate-600 italic leading-relaxed">
            "{shopper.bio}"
          </p>
        </div>

        {/* Interests */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-400" aria-hidden="true" />
            Interests
          </span>
          <div className="flex flex-wrap gap-1.5">
            {shopper.interests.map((interest, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Shopping Preferences */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <Tag className="w-3 h-3 text-blue-400" aria-hidden="true" />
            Shopping Preferences
          </span>
          <div className="flex flex-wrap gap-1.5">
            {shopper.shopping_preferences.map((pref, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] bg-blue-50 text-blue-700 border border-blue-100 font-medium"
              >
                {pref}
              </span>
            ))}
          </div>
        </div>

        {/* Personality Traits */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Personality Traits
          </span>
          <div className="flex flex-wrap gap-1.5">
            {shopper.personality_traits.map((trait, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] bg-slate-50 text-slate-600 border border-slate-200 font-medium"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info with MongoDB Persistence Badge */}
      <div className="px-5 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <Database className="w-3 h-3 text-emerald-600" aria-hidden="true" />
          <span className="font-sans font-medium text-[10px]">Saved in DB</span>
        </span>
        <span className="text-slate-400">
          ID: {shopper._id ? shopper._id.substring(shopper._id.length - 8) : 'syncing'}
        </span>
      </div>
    </div>
  );
};

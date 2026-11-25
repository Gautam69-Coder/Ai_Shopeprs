import React from 'react';
import {
  User,
  Quote,
  CheckCircle,
  AlertTriangle,
  Wallet,
  Calendar,
  MapPin,
  Briefcase,
  ThumbsUp,
} from 'lucide-react';
import type { ShopperResponse } from '../../types/simulation';
import { Badge } from '../common/Badge';

interface ShopperReactionCardProps {
  response: ShopperResponse;
}

export const ShopperReactionCard: React.FC<ShopperReactionCardProps> = ({ response }) => {
  const initials = response.shopperName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const formattedIncome = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(response.shopperIncome);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Shopper Header */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
            {initials || <User className="w-5 h-5" aria-hidden="true" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">
              {response.shopperName}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span>{response.shopperOccupation}</span>
            </p>
          </div>
        </div>

        <Badge
          variant={
            response.priceSensitivity === 'low'
              ? 'success'
              : response.priceSensitivity === 'medium'
              ? 'warning'
              : 'blue'
          }
          dot
        >
          {response.priceSensitivity.toUpperCase()} Sensitivity
        </Badge>
      </div>

      {/* Shopper Metadata Pill */}
      <div className="grid grid-cols-3 gap-2 py-2 px-5 bg-slate-50/70 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span>{response.shopperAge} yrs</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 truncate">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span className="truncate">{response.shopperCity}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 font-mono">
          <Wallet className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span className="truncate">₹{formattedIncome}/mo</span>
        </div>
      </div>

      {/* Evaluation Body */}
      <div className="p-5 space-y-4 flex-1">
        {/* Classification Verdict Banner (Phase 4) */}
        {response.classification && (
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/90 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant={
                  response.classification.decision === 'Definitely Yes'
                    ? 'success'
                    : response.classification.decision === 'Maybe'
                    ? 'warning'
                    : 'danger'
                }
                dot
                className="font-bold tracking-wider text-xs uppercase"
              >
                {response.classification.decision}
              </Badge>
              <span className="text-xs font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                {response.classification.confidenceScore}% Conviction
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100/80">
                <span className="font-bold text-emerald-800 block text-[10px] uppercase tracking-wider mb-0.5">
                  Driver: {response.classification.primaryPurchaseDriver}
                </span>
                <span className="text-emerald-900 leading-snug text-[11px] line-clamp-2">
                  {response.classification.keyPositiveReason}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-100/80">
                <span className="font-bold text-rose-800 block text-[10px] uppercase tracking-wider mb-0.5">
                  Objection: {response.classification.primaryObjectionCategory}
                </span>
                <span className="text-rose-900 leading-snug text-[11px] line-clamp-2">
                  {response.classification.keyConcernReason}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Consideration Assessment Banner */}
        <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
            Consumer Stance & Consideration
          </span>
          <p className="text-xs font-medium text-slate-800 leading-relaxed">
            {response.consideration}
          </p>
        </div>

        {/* Verbatim Reaction Quote */}
        <div className="relative pl-3 border-l-2 border-blue-300 bg-slate-50/50 p-2.5 rounded-r-xl">
          <Quote className="w-3.5 h-3.5 text-blue-400 absolute -top-1 -left-2 bg-white" aria-hidden="true" />
          <p className="text-xs text-slate-700 italic leading-relaxed">
            "{response.reactionQuote}"
          </p>
        </div>

        {/* What Attracts Them */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1 mb-2">
            <ThumbsUp className="w-3 h-3 text-emerald-600" aria-hidden="true" />
            What Attracts Them
          </span>
          <ul className="space-y-1.5">
            {response.attractions.map((attraction, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-700 leading-normal"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{attraction}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Concerns & Objections */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1 mb-2">
            <AlertTriangle className="w-3 h-3 text-amber-600" aria-hidden="true" />
            Concerns & Reservations
          </span>
          <ul className="space-y-1.5">
            {response.concerns.map((concern, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-700 leading-normal"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Perception Feedback */}
        {response.willingnessToPayFeedback && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
            <Wallet className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="text-[11px] font-medium text-slate-500">
              Price Reaction: <span className="text-slate-700">{response.willingnessToPayFeedback}</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Synthetic Feedback</span>
        <span>Evaluated via LLM</span>
      </div>
    </div>
  );
};

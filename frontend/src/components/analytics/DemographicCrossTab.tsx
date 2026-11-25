import React, { useState } from 'react';
import {
  Wallet,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import type { CrossTabSegment } from '../../types/analytics';
import { Badge } from '../common/Badge';

interface DemographicCrossTabProps {
  crossTabs: {
    priceSensitivity: CrossTabSegment[];
    ageBrackets: CrossTabSegment[];
    incomeTiers: CrossTabSegment[];
  };
  productName: string;
}

type TabType = 'priceSensitivity' | 'ageBrackets' | 'incomeTiers';

export const DemographicCrossTab: React.FC<DemographicCrossTabProps> = ({
  crossTabs,
  productName,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('priceSensitivity');

  const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: 'priceSensitivity', label: 'Price Sensitivity', icon: DollarSign },
    { key: 'ageBrackets', label: 'Age Cohorts', icon: Calendar },
    { key: 'incomeTiers', label: 'Income Tiers', icon: Wallet },
  ];

  const currentSegments = crossTabs[activeTab] || [];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
      {/* Header and Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <h3 className="text-base font-bold text-slate-900">
              Demographic Cross-Tabulation
            </h3>
            <Badge variant="blue">Cohort Deep Dive</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Compare purchase intention across customer segments for <strong className="text-slate-700">"{productName}"</strong>.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs shrink-0 self-start md:self-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Segment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentSegments.map((seg, idx) => {
          const { stats } = seg;
          const hasShoppers = stats.total > 0;

          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                hasShoppers
                  ? 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/60'
                  : 'bg-slate-50/30 border-dashed border-slate-200 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {seg.segment}
                    </h4>
                    {seg.label && (
                      <span className="text-[11px] font-semibold text-blue-600 block mt-0.5">
                        {seg.label}
                      </span>
                    )}
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {seg.description}
                    </p>
                  </div>

                  {hasShoppers && (
                    <Badge
                      variant={
                        stats.intentScore >= 65
                          ? 'success'
                          : stats.intentScore >= 40
                          ? 'warning'
                          : 'danger'
                      }
                      dot
                      className="font-mono font-bold text-xs shrink-0"
                    >
                      {stats.intentScore}/100
                    </Badge>
                  )}
                </div>

                {hasShoppers ? (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>{stats.total} shopper(s)</span>
                      <span>{stats.shareOfCohort}% of cohort</span>
                    </div>

                    {/* Stacked intent bar */}
                    <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden flex shadow-inner">
                      {stats.yesPercent > 0 && (
                        <div
                          style={{ width: `${stats.yesPercent}%` }}
                          className="bg-emerald-500 h-full"
                          title={`Definitely Yes: ${stats.yesPercent}%`}
                        />
                      )}
                      {stats.maybePercent > 0 && (
                        <div
                          style={{ width: `${stats.maybePercent}%` }}
                          className="bg-amber-400 h-full"
                          title={`Maybe: ${stats.maybePercent}%`}
                        />
                      )}
                      {stats.noPercent > 0 && (
                        <div
                          style={{ width: `${stats.noPercent}%` }}
                          className="bg-rose-500 h-full"
                          title={`No: ${stats.noPercent}%`}
                        />
                      )}
                    </div>

                    {/* Breakdown counts */}
                    <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] font-mono text-center">
                      <div className="p-1 rounded bg-emerald-50/70 text-emerald-800">
                        <span className="block font-bold">{stats.definitelyYes}</span>
                        <span className="text-[10px] text-emerald-600">Yes</span>
                      </div>
                      <div className="p-1 rounded bg-amber-50/70 text-amber-800">
                        <span className="block font-bold">{stats.maybe}</span>
                        <span className="text-[10px] text-amber-600">Maybe</span>
                      </div>
                      <div className="p-1 rounded bg-rose-50/70 text-rose-800">
                        <span className="block font-bold">{stats.no}</span>
                        <span className="text-[10px] text-rose-600">No</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 pb-2 text-center text-xs text-slate-400 italic">
                    No personas in this demographic segment
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

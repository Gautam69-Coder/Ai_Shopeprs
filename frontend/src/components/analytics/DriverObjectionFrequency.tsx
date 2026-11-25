import React from 'react';
import {
  ThumbsUp,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import type { FrequencyItem } from '../../types/analytics';

interface DriverObjectionFrequencyProps {
  drivers: FrequencyItem[];
  objections: FrequencyItem[];
}

export const DriverObjectionFrequency: React.FC<DriverObjectionFrequencyProps> = ({
  drivers,
  objections,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Top Purchase Drivers */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Top Purchase Drivers
              </h4>
              <p className="text-xs text-slate-500">
                Primary reasons motivating purchase conviction
              </p>
            </div>
          </div>
          <Flame className="w-4 h-4 text-emerald-500" aria-hidden="true" />
        </div>

        {drivers.length > 0 ? (
          <div className="space-y-4">
            {drivers.map((driver, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 line-clamp-1">
                    {driver.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-slate-500">
                    <span className="font-bold text-emerald-700">{driver.count} cited</span>
                    {driver.percentage > 0 && (
                      <span className="text-[11px] text-slate-400">({driver.percentage}%)</span>
                    )}
                  </div>
                </div>

                {/* Progress fill bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${Math.max(10, driver.percentage || Math.round((driver.count / 3) * 100))}%`,
                    }}
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No driver data collected yet
          </div>
        )}
      </div>

      {/* Common Objections & Barriers */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Critical Friction & Objections
              </h4>
              <p className="text-xs text-slate-500">
                Primary consumer barriers preventing purchase
              </p>
            </div>
          </div>
          <AlertTriangle className="w-4 h-4 text-rose-500" aria-hidden="true" />
        </div>

        {objections.length > 0 ? (
          <div className="space-y-4">
            {objections.map((objection, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 line-clamp-1">
                    {objection.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-slate-500">
                    <span className="font-bold text-rose-700">{objection.count} cited</span>
                    {objection.percentage > 0 && (
                      <span className="text-[11px] text-slate-400">({objection.percentage}%)</span>
                    )}
                  </div>
                </div>

                {/* Progress fill bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${Math.max(10, objection.percentage || Math.round((objection.count / 3) * 100))}%`,
                    }}
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No objection data collected yet
          </div>
        )}
      </div>
    </div>
  );
};

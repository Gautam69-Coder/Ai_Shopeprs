import React from 'react';
import { Bot, Sparkles, Layers, Sliders, ShieldCheck } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const SimulationPlaceholder: React.FC = () => {
  const plannedCapabilities = [
    {
      title: 'Synthetic Consumer Archetypes',
      description: 'Parametric personas with diverse price elasticity, brand loyalty, and lifestyle priorities.',
      icon: Bot,
    },
    {
      title: 'Product Pitch Testing',
      description: 'Simulated reactions to pricing, features, packaging, and marketing claims.',
      icon: Sparkles,
    },
    {
      title: 'Batch Parallel Runs',
      description: 'Run automated panels across dozens of synthetic shoppers simultaneously.',
      icon: Layers,
    },
    {
      title: 'Quantitative Tradeoff Metrics',
      description: 'Structured willingness-to-pay ratings, purchase intent, and objection tracking.',
      icon: Sliders,
    },
  ];

  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Simulation Workspace
            </h2>
            <Badge variant="neutral">Upcoming in Phase 2</Badge>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            STATUS: STANDBY
          </span>
        </div>
      }
      className="overflow-hidden"
    >
      <div className="py-12 px-4 sm:px-6 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 mb-5">
          <Bot className="w-8 h-8" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
          Ready for Simulation Engine
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-8">
          The foundation layer is active. In Phase 2, this workspace will enable you to configure product concepts, launch synthetic consumer panels, and observe automated customer reactions.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 mb-10">
          <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>Foundation Verified: Frontend shell, backend API, and database connectors configured.</span>
        </div>

        {/* Capabilities preview */}
        <div className="text-left">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 text-center">
            Planned Architecture Capabilities
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plannedCapabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Icon className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    <span className="text-sm font-semibold text-slate-800">
                      {cap.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    {cap.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

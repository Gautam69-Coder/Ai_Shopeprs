import React, { useState } from 'react';
import { Sparkles, Users, Globe, Sliders, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '../common/Card';
import type { GenerateShoppersRequest } from '../../types/shopper';

interface TargetAudienceFormProps {
  onGenerate: (data: GenerateShoppersRequest) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const PRESET_EXAMPLES = [
  {
    label: 'Fitness & Nutrition',
    audience: 'Young working professionals who regularly go to the gym and are interested in fitness nutrition.',
    country: 'India',
    characteristics: 'Include a mix of budget-conscious gym-goers and premium supplement consumers.',
    count: 6,
  },
  {
    label: 'Remote Software Engineers',
    audience: 'Mid-to-senior software developers and IT professionals working from home, seeking ergonomic desk setups, split keyboards, and high-productivity gear.',
    country: 'India',
    characteristics: 'High disposable income (₹80k–₹2.5L/mo), suffering from wrist fatigue or RSI, value premium build quality and comfort over cheap price.',
    count: 5,
  },
  {
    label: 'Eco-conscious Urbanites',
    audience: 'Environmentally mindful apartment dwellers looking for zero-waste home and personal care products.',
    country: 'United States',
    characteristics: 'Varying income tiers; some prioritize convenience while others seek certified organic credentials.',
    count: 5,
  },
  {
    label: 'Tech College Students',
    audience: 'Engineering and college students seeking durable, affordable wireless audio and study productivity gadgets.',
    country: 'India',
    characteristics: 'Price-sensitive, heavily reliant on peer reviews, specs, and battery longevity.',
    count: 5,
  },
  {
    label: 'Busy Working Parents',
    audience: 'Dual-income urban parents with young children managing demanding careers, looking for time-saving family solutions, wholesome food, and kid-safe essentials.',
    country: 'India',
    characteristics: 'High convenience focus, safety-conscious, willing to pay for time-savers, frequent online shoppers.',
    count: 6,
  },
  {
    label: 'Skincare & Clean Beauty',
    audience: 'Urban men and women aged 22–38 passionate about dermatologically backed skincare, active ingredients (niacinamide, SPF), and anti-pollution personal care.',
    country: 'India',
    characteristics: 'Scrutinize ingredient lists, influenced by dermatologists and YouTube/Insta reviews, brand-conscious.',
    count: 5,
  },
  {
    label: 'Value-Focused Homemakers',
    audience: 'Tier-2 and suburban household budget managers responsible for family groceries, kitchen appliances, cleaning supplies, and monthly FMCG essentials.',
    country: 'India',
    characteristics: 'High price-sensitivity, look for multi-packs, warranty assurances, discounts, and durability.',
    count: 6,
  },
  {
    label: 'Artisanal Coffee Lovers',
    audience: 'Metro coffee enthusiasts and home baristas who appreciate specialty single-origin beans, pour-over equipment, nitro brews, and craft beverages.',
    country: 'India',
    characteristics: 'Medium to high income, quality-obsessed, enjoy café culture, willing to pay a premium for taste authenticity.',
    count: 5,
  },
];

export const TargetAudienceForm: React.FC<TargetAudienceFormProps> = ({
  onGenerate,
  loading,
  error,
}) => {
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [count, setCount] = useState<number>(5);
  const [country, setCountry] = useState<string>('India');
  const [additionalCharacteristics, setAdditionalCharacteristics] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [formValidation, setFormValidation] = useState<string | null>(null);

  const applyPreset = (preset: typeof PRESET_EXAMPLES[0]) => {
    setSelectedPreset(preset.label);
    setTargetAudience(preset.audience);
    setCountry(preset.country);
    setAdditionalCharacteristics(preset.characteristics);
    setCount(preset.count);
    setFormValidation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidation(null);

    const trimmedAudience = targetAudience.trim();
    if (!trimmedAudience) {
      setFormValidation('Please provide a target audience description.');
      return;
    }

    if (count < 1 || count > 20) {
      setFormValidation('Number of shoppers must be between 1 and 20.');
      return;
    }

    await onGenerate({
      targetAudience: trimmedAudience,
      count,
      country: country.trim() || undefined,
      additionalCharacteristics: additionalCharacteristics.trim() || undefined,
    });
  };

  const countPresets = [3, 5, 8, 10, 15];

  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Define Target Audience
              </h2>
              <p className="text-xs text-slate-500">
                Generate a synthetic cohort of fictional consumer profiles with Groq LLM
              </p>
            </div>
          </div>
          
        </div>
      }
    >
      {/* Preset Quick-Fill Pills */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quick-Fill Example Audiences
          </span>
          <span className="text-[11px] text-slate-400">
            Click to auto-populate audience parameters
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_EXAMPLES.map((preset) => {
            const isSelected = selectedPreset === preset.label;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                disabled={loading}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-blue-50/70 hover:text-blue-700 hover:border-blue-200 border-slate-200'
                }`}
              >
                <Sparkles
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-blue-600' : 'text-blue-500'
                  }`}
                  aria-hidden="true"
                />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Target Audience Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="target-audience"
              className="block text-sm font-semibold text-slate-900"
            >
              Target Audience Description <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {targetAudience.length}/1000
            </span>
          </div>
          <textarea
            id="target-audience"
            rows={3}
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            disabled={loading}
            maxLength={1000}
            required
            placeholder="e.g. Young working professionals who regularly go to the gym and are interested in fitness nutrition."
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Number of Shoppers */}
          <div>
            <label
              htmlFor="shopper-count"
              className="block text-sm font-semibold text-slate-900 mb-1.5"
            >
              Number of Shoppers (1 – 20)
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  id="shopper-count"
                  type="number"
                  min={1}
                  max={20}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  disabled={loading}
                  className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono text-center focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
                />
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  disabled={loading}
                  aria-label="Shopper count slider"
                  className="flex-1 accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Presets:</span>
                {countPresets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCount(val)}
                    disabled={loading}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-medium border transition-colors ${
                      count === val
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Country or Region */}
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-semibold text-slate-900 mb-1.5"
            >
              Country or Region <span className="text-xs font-normal text-slate-400">(Optional)</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" aria-hidden="true" />
              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={loading}
                placeholder="e.g. India, United States, Germany..."
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Additional Characteristics */}
        <div>
          <label
            htmlFor="additional-characteristics"
            className="block text-sm font-semibold text-slate-900 mb-1.5"
          >
            Additional Characteristics <span className="text-xs font-normal text-slate-400">(Optional)</span>
          </label>
          <div className="relative">
            <Sliders className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" aria-hidden="true" />
            <input
              id="additional-characteristics"
              type="text"
              value={additionalCharacteristics}
              onChange={(e) => setAdditionalCharacteristics(e.target.value)}
              disabled={loading}
              placeholder="e.g. Include a mix of budget-conscious and premium consumers."
              className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Local Validation Error Banner */}
        {formValidation && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
            <span>{formValidation}</span>
          </div>
        )}

        {/* Server Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-semibold block">Generation Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-sm shadow-blue-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none min-h-[44px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Synthesizing Shoppers via Groq AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Generate {count} Synthetic Shopper{count > 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Card>
  );
};

import React, { useState } from 'react';
import {
  Package,
  Layers,
  Sparkles,
  AlertCircle,
  Loader2,
  Tag,
  Megaphone,
} from 'lucide-react';
import { Card } from '../common/Card';
import type { ShopperBatch } from '../../types/shopper';
import type { ProductInput } from '../../types/simulation';

interface ProductFormProps {
  batches: ShopperBatch[];
  selectedBatchId: string | null;
  onSelectBatchId: (id: string) => void;
  onRunSimulation: (batchId: string, product: ProductInput) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const CATEGORIES = [
  'Personal Care & Hygiene',
  'Consumer Tech & Gadgets',
  'Food & Fitness Nutrition',
  'Apparel & Lifestyle',
  'Home & Sustainable Goods',
  'Beverages & Specialty Coffee',
];

const PRESET_PRODUCTS: Array<{ label: string; product: ProductInput }> = [
  {
    label: 'Smart Protein Shaker (₹1,299)',
    product: {
      name: 'VortexMix Pro - Smart Self-Cleaning Shaker',
      category: 'Food & Fitness Nutrition',
      price: 1299,
      currency: 'INR',
      description:
        'A rechargeable, whisper-quiet vortex protein shaker bottle that dissolves clumps in 15 seconds and features a 1-touch self-cleaning cycle with IPX7 waterproofing.',
      adCopy:
        'Say goodbye to chalky protein clumps and foul-smelling bottles. VortexMix Pro blends smooth shakes anywhere with USB-C convenience.',
    },
  },
  {
    label: 'Specialty Cold Brew Cans (₹180)',
    product: {
      name: 'AromaDark - Single-Origin Nitro Cold Brew Can (250ml)',
      category: 'Beverages & Specialty Coffee',
      price: 180,
      currency: 'INR',
      description:
        'Direct-trade Arabica beans steep-brewed for 18 hours and nitrogen-infused for an ultra-velvety microfoam texture with zero added sugar, 150mg natural caffeine, and notes of dark cocoa.',
      adCopy:
        'Café-grade craft cold brew in a sleek pocket can. Clean energy, zero preservatives, creamy without a drop of milk.',
    },
  },
  {
    label: 'Ergonomic Split Keyboard (₹4,499)',
    product: {
      name: 'FlowType Wireless Ergonomic Split Keyboard',
      category: 'Consumer Tech & Gadgets',
      price: 4499,
      currency: 'INR',
      description:
        'A split columnar keyboard with silent tactile switches, cushioned memory foam palm rest, Bluetooth 5.2 multi-device pairing, and rechargeable 3-month battery life designed to eradicate wrist strain.',
      adCopy:
        'Type pain-free for 10+ hours a day. FlowType aligns your shoulders and wrists naturally while you code, write, or design.',
    },
  },
];

export const ProductForm: React.FC<ProductFormProps> = ({
  batches,
  selectedBatchId,
  onSelectBatchId,
  onRunSimulation,
  loading,
  error,
}) => {
  const [productName, setProductName] = useState<string>('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [price, setPrice] = useState<number>(999);
  const [description, setDescription] = useState<string>('');
  const [adCopy, setAdCopy] = useState<string>('');
  const [formValidation, setFormValidation] = useState<string | null>(null);

  const applyPreset = (preset: typeof PRESET_PRODUCTS[0]) => {
    setProductName(preset.product.name);
    setCategory(preset.product.category);
    setPrice(preset.product.price);
    setDescription(preset.product.description);
    setAdCopy(preset.product.adCopy || '');
    setFormValidation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidation(null);

    if (!selectedBatchId) {
      setFormValidation('Please select a synthetic shopper cohort to evaluate this product.');
      return;
    }

    if (!productName.trim()) {
      setFormValidation('Please enter a product name.');
      return;
    }

    if (description.trim().length < 10) {
      setFormValidation('Product description must be at least 10 characters.');
      return;
    }

    if (price < 0) {
      setFormValidation('Price must be a non-negative number.');
      return;
    }

    await onRunSimulation(selectedBatchId, {
      name: productName.trim(),
      category,
      price,
      currency: 'INR',
      description: description.trim(),
      adCopy: adCopy.trim() || undefined,
    });
  };

  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Package className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Product Simulation Setup
              </h2>
              <p className="text-xs text-slate-500">
                Pitch a product to your synthetic consumer cohort and gather persona-based reactions
              </p>
            </div>
          </div>
          
        </div>
      }
    >
      {/* Preset Product Buttons */}
      <div className="mb-6">
        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Test With Example Product Pitches
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_PRODUCTS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Cohort Selector */}
        <div>
          <label
            htmlFor="cohort-select"
            className="block text-sm font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>Select Target Shopper Cohort <span className="text-rose-500">*</span></span>
          </label>
          {batches.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              No shopper cohorts found. Generate a synthetic shopper cohort first using the form above.
            </div>
          ) : (
            <select
              id="cohort-select"
              value={selectedBatchId || ''}
              onChange={(e) => onSelectBatchId(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
            >
              <option value="" disabled>-- Choose a Shopper Cohort --</option>
              {batches.map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  {b.targetAudience} ({b.count} Shoppers {b.country ? `• ${b.country}` : ''})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Product Name & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="product-name"
              className="block text-sm font-semibold text-slate-900 mb-1.5"
            >
              Product Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Package className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" aria-hidden="true" />
              <input
                id="product-name"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={loading}
                required
                placeholder="e.g. VortexMix Pro - Smart Protein Shaker"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="product-category"
              className="block text-sm font-semibold text-slate-900 mb-1.5"
            >
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" aria-hidden="true" />
              <select
                id="product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Price & Currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="product-price"
              className="block text-sm font-semibold text-slate-900 mb-1.5"
            >
              Product Retail Price <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="text-slate-400 font-semibold absolute left-3.5 top-2 pointer-events-none text-sm">
                ₹
              </span>
              <input
                id="product-price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={loading}
                required
                placeholder="999"
                className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-2 text-sm text-slate-900 font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Shoppers will evaluate whether this price is fair or expensive relative to their monthly income.
            </p>
          </div>

          <div>
            <label
              htmlFor="ad-copy"
              className="block text-sm font-semibold text-slate-900 mb-1.5"
            >
              Ad Slogan / Marketing Hook <span className="text-xs font-normal text-slate-400">(Optional)</span>
            </label>
            <div className="relative">
              <Megaphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" aria-hidden="true" />
              <input
                id="ad-copy"
                type="text"
                value={adCopy}
                onChange={(e) => setAdCopy(e.target.value)}
                disabled={loading}
                placeholder="e.g. Say goodbye to foul-smelling protein shakers forever."
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div>
          <label
            htmlFor="product-description"
            className="block text-sm font-semibold text-slate-900 mb-1.5"
          >
            Product Features & Value Proposition <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="product-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            required
            maxLength={3000}
            placeholder="Describe key features, materials, specifications, and what problem it solves for the customer..."
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
          />
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
              <span className="font-semibold block">Simulation Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={loading || batches.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-sm shadow-blue-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none min-h-[44px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Simulating Persona Evaluations...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Launch Product Simulation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Card>
  );
};

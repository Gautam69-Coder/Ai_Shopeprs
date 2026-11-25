import Simulation from '../models/Simulation.js';

/**
 * Helper to compute conversion counts & net intent score for a subset of responses
 */
const computeSegmentStats = (responses, totalCohortCount = 0) => {
  const total = responses.length;
  if (total === 0) {
    return {
      total: 0,
      shareOfCohort: 0,
      definitelyYes: 0,
      maybe: 0,
      no: 0,
      yesPercent: 0,
      maybePercent: 0,
      noPercent: 0,
      intentScore: 0,
    };
  }

  const definitelyYes = responses.filter(
    (r) => r.classification?.decision === 'Definitely Yes'
  ).length;
  const maybe = responses.filter(
    (r) => r.classification?.decision === 'Maybe'
  ).length;
  const no = responses.filter(
    (r) => r.classification?.decision === 'No'
  ).length;

  // Net Intent Index (0-100 scale)
  const intentScore = Math.round(((definitelyYes * 100) + (maybe * 50)) / total);

  return {
    total,
    shareOfCohort: totalCohortCount > 0 ? Math.round((total / totalCohortCount) * 100) : 0,
    definitelyYes,
    maybe,
    no,
    yesPercent: Math.round((definitelyYes / total) * 100),
    maybePercent: Math.round((maybe / total) * 100),
    noPercent: Math.round((no / total) * 100),
    intentScore,
  };
};

/**
 * Helper to calculate frequency ranking of string attributes
 */
const getFrequencyRanking = (items, totalCohortCount = 0, limit = 5) => {
  const freqMap = {};
  items.forEach((item) => {
    if (!item || typeof item !== 'string') return;
    const cleaned = item.trim();
    if (!cleaned) return;
    freqMap[cleaned] = (freqMap[cleaned] || 0) + 1;
  });

  return Object.entries(freqMap)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalCohortCount > 0 ? Math.round((count / totalCohortCount) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

/**
 * Computes platform-wide aggregated KPI metrics across all simulations
 */
export const getPlatformOverview = async () => {
  const simulations = await Simulation.find().sort({ createdAt: -1 });

  const totalSimulations = simulations.length;
  let totalEvaluations = 0;
  let totalDefinitelyYes = 0;
  let totalMaybe = 0;
  let totalNo = 0;

  const allDrivers = [];
  const allObjections = [];
  const categoryStats = {};
  let totalIntentScoreSum = 0;
  let evaluatedSimulationsCount = 0;

  simulations.forEach((sim) => {
    const responses = sim.responses || [];
    totalEvaluations += responses.length;

    if (sim.evaluationSummary?.intentBreakdown) {
      const { definitelyYes, maybe, no, intentScore } = sim.evaluationSummary.intentBreakdown;
      totalDefinitelyYes += definitelyYes || 0;
      totalMaybe += maybe || 0;
      totalNo += no || 0;
      totalIntentScoreSum += intentScore || 0;
      evaluatedSimulationsCount += 1;
    } else {
      // Aggregate from individual classifications if summary is missing
      responses.forEach((r) => {
        if (r.classification?.decision === 'Definitely Yes') totalDefinitelyYes += 1;
        else if (r.classification?.decision === 'Maybe') totalMaybe += 1;
        else if (r.classification?.decision === 'No') totalNo += 1;
      });
    }

    // Collect drivers & objections for frequency clustering
    responses.forEach((r) => {
      if (r.classification?.primaryPurchaseDriver) {
        allDrivers.push(r.classification.primaryPurchaseDriver);
      } else if (Array.isArray(r.attractions)) {
        allDrivers.push(...r.attractions);
      }

      if (r.classification?.primaryObjectionCategory) {
        allObjections.push(r.classification.primaryObjectionCategory);
      } else if (Array.isArray(r.concerns)) {
        allObjections.push(...r.concerns);
      }
    });

    // Category Benchmarks
    const cat = sim.product?.category || 'General';
    if (!categoryStats[cat]) {
      categoryStats[cat] = {
        category: cat,
        simulationCount: 0,
        totalShoppers: 0,
        totalPrice: 0,
        totalIntentScore: 0,
      };
    }
    categoryStats[cat].simulationCount += 1;
    categoryStats[cat].totalShoppers += sim.shopperCount || responses.length;
    categoryStats[cat].totalPrice += sim.product?.price || 0;
    categoryStats[cat].totalIntentScore += sim.evaluationSummary?.intentBreakdown?.intentScore || 50;
  });

  const averageIntentScore = evaluatedSimulationsCount > 0
    ? Math.round(totalIntentScoreSum / evaluatedSimulationsCount)
    : 0;

  const totalClassified = totalDefinitelyYes + totalMaybe + totalNo;

  const categoryBenchmarks = Object.values(categoryStats).map((c) => ({
    category: c.category,
    simulationCount: c.simulationCount,
    totalShoppers: c.totalShoppers,
    averagePrice: Math.round(c.totalPrice / c.simulationCount),
    averageIntentScore: Math.round(c.totalIntentScore / c.simulationCount),
  }));

  return {
    totalSimulations,
    totalEvaluations,
    averageIntentScore,
    globalDecisionBreakdown: {
      definitelyYes: totalDefinitelyYes,
      maybe: totalMaybe,
      no: totalNo,
      total: totalClassified,
      yesPercent: totalClassified > 0 ? Math.round((totalDefinitelyYes / totalClassified) * 100) : 0,
      maybePercent: totalClassified > 0 ? Math.round((totalMaybe / totalClassified) * 100) : 0,
      noPercent: totalClassified > 0 ? Math.round((totalNo / totalClassified) * 100) : 0,
    },
    topPlatformDrivers: getFrequencyRanking(allDrivers, totalEvaluations, 6),
    topPlatformObjections: getFrequencyRanking(allObjections, totalEvaluations, 6),
    categoryBenchmarks,
  };
};

/**
 * Computes deep demographic cross-tabulations and driver frequency for a single simulation
 */
export const getSimulationAnalytics = async (simulationId) => {
  const simulation = await Simulation.findById(simulationId);
  if (!simulation) {
    throw new Error(`Simulation with ID ${simulationId} not found.`);
  }

  const responses = simulation.responses || [];
  const total = responses.length;

  // 1. Price Sensitivity Cross-Tabulation
  const lowSensitivity = responses.filter((r) => r.priceSensitivity === 'low');
  const medSensitivity = responses.filter((r) => r.priceSensitivity === 'medium');
  const highSensitivity = responses.filter((r) => r.priceSensitivity === 'high');

  const priceSensitivityCrossTab = [
    {
      segment: 'Low Sensitivity',
      description: 'Prioritizes quality & brand over cost',
      stats: computeSegmentStats(lowSensitivity, total),
    },
    {
      segment: 'Medium Sensitivity',
      description: 'Balances value and feature tradeoffs',
      stats: computeSegmentStats(medSensitivity, total),
    },
    {
      segment: 'High Sensitivity',
      description: 'Highly budget-constrained & frugal',
      stats: computeSegmentStats(highSensitivity, total),
    },
  ];

  // 2. Age Bracket Cross-Tabulation
  const genZ = responses.filter((r) => r.shopperAge >= 18 && r.shopperAge <= 25);
  const millennials = responses.filter((r) => r.shopperAge >= 26 && r.shopperAge <= 35);
  const genX = responses.filter((r) => r.shopperAge >= 36 && r.shopperAge <= 50);
  const older = responses.filter((r) => r.shopperAge > 50);

  const ageBracketCrossTab = [
    {
      segment: '18–25 (Gen Z)',
      description: 'Students & entry-level digital natives',
      stats: computeSegmentStats(genZ, total),
    },
    {
      segment: '26–35 (Millennials)',
      description: 'Early to mid-career professionals',
      stats: computeSegmentStats(millennials, total),
    },
    {
      segment: '36–50 (Gen X)',
      description: 'Established earners & family managers',
      stats: computeSegmentStats(genX, total),
    },
    {
      segment: '50+ (Mature / Boomers)',
      description: 'Senior experienced shoppers',
      stats: computeSegmentStats(older, total),
    },
  ];

  // 3. Monthly Income Tiers Cross-Tabulation
  const tier1 = responses.filter((r) => r.shopperIncome < 50000);
  const tier2 = responses.filter((r) => r.shopperIncome >= 50000 && r.shopperIncome <= 120000);
  const tier3 = responses.filter((r) => r.shopperIncome > 120000);

  const incomeTierCrossTab = [
    {
      segment: '< ₹50,000 / mo',
      label: 'Budget Conscious',
      description: 'Entry-level income, value-driven decisions',
      stats: computeSegmentStats(tier1, total),
    },
    {
      segment: '₹50,000 – ₹1,20,000 / mo',
      label: 'Mid-Market',
      description: 'Middle income with disposable spending',
      stats: computeSegmentStats(tier2, total),
    },
    {
      segment: '> ₹1,20,000 / mo',
      label: 'Affluent / Premium',
      description: 'High income, less constrained by retail pricing',
      stats: computeSegmentStats(tier3, total),
    },
  ];

  // 4. Driver & Objection Frequency
  const driversList = responses.map(
    (r) => r.classification?.primaryPurchaseDriver || (r.attractions && r.attractions[0])
  ).filter(Boolean);

  const objectionsList = responses.map(
    (r) => r.classification?.primaryObjectionCategory || (r.concerns && r.concerns[0])
  ).filter(Boolean);

  return {
    simulationId: simulation._id,
    product: simulation.product,
    shopperCount: total,
    evaluationSummary: simulation.evaluationSummary,
    crossTabs: {
      priceSensitivity: priceSensitivityCrossTab,
      ageBrackets: ageBracketCrossTab,
      incomeTiers: incomeTierCrossTab,
    },
    rankedDrivers: getFrequencyRanking(driversList, total, 6),
    rankedObjections: getFrequencyRanking(objectionsList, total, 6),
  };
};

/**
 * Compares two or more simulations side-by-side (A/B testing matrix)
 */
export const compareSimulations = async (simulationIds) => {
  if (!Array.isArray(simulationIds) || simulationIds.length === 0) {
    throw new Error('Please provide at least one valid simulation ID to compare.');
  }

  const simulations = await Simulation.find({ _id: { $in: simulationIds } });
  if (simulations.length === 0) {
    throw new Error('No matching simulations found for the provided IDs.');
  }

  const comparisonList = simulations.map((sim) => {
    const responses = sim.responses || [];
    const total = responses.length;
    const definitelyYes = responses.filter(
      (r) => r.classification?.decision === 'Definitely Yes'
    ).length;
    const maybe = responses.filter(
      (r) => r.classification?.decision === 'Maybe'
    ).length;
    const no = responses.filter(
      (r) => r.classification?.decision === 'No'
    ).length;

    const intentScore = sim.evaluationSummary?.intentBreakdown?.intentScore !== undefined
      ? sim.evaluationSummary.intentBreakdown.intentScore
      : (total > 0 ? Math.round(((definitelyYes * 100) + (maybe * 50)) / total) : 0);

    return {
      _id: sim._id,
      product: sim.product,
      batchId: sim.batchId,
      shopperCount: total,
      createdAt: sim.createdAt,
      intentScore,
      intentBreakdown: {
        definitelyYes,
        maybe,
        no,
        yesPercent: total > 0 ? Math.round((definitelyYes / total) * 100) : 0,
        maybePercent: total > 0 ? Math.round((maybe / total) * 100) : 0,
        noPercent: total > 0 ? Math.round((no / total) * 100) : 0,
      },
      topDrivers: sim.evaluationSummary?.topDrivers || [],
      commonObjections: sim.evaluationSummary?.commonObjections || [],
      recommendations: sim.evaluationSummary?.recommendations || [],
      executiveSummary: sim.evaluationSummary?.executiveSummary || '',
    };
  });

  // Sort by intent score descending to determine rank
  comparisonList.sort((a, b) => b.intentScore - a.intentScore);

  const winner = comparisonList[0];
  let verdictSummary = `Concept "${winner.product.name}" leads with a Net Intent Index of ${winner.intentScore}/100.`;

  if (comparisonList.length >= 2) {
    const runnerUp = comparisonList[1];
    const scoreDiff = winner.intentScore - runnerUp.intentScore;
    const priceDiff = winner.product.price - runnerUp.product.price;

    if (scoreDiff > 0) {
      verdictSummary += ` It outperforms "${runnerUp.product.name}" by ${scoreDiff} intent points (₹${winner.product.price} vs. ₹${runnerUp.product.price}).`;
    } else {
      verdictSummary += ` It is tied with "${runnerUp.product.name}" at ${winner.intentScore}/100.`;
    }
  }

  return {
    count: comparisonList.length,
    winnerId: winner._id,
    verdictSummary,
    simulations: comparisonList,
  };
};

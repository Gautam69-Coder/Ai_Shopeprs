import * as analyticsService from '../services/analyticsService.js';

/**
 * GET /api/analytics/overview
 * Returns platform-wide KPI metrics across all simulated cohorts
 */
export const getOverviewHandler = async (req, res, next) => {
  try {
    const overview = await analyticsService.getPlatformOverview();
    res.status(200).json({
      success: true,
      overview,
    });
  } catch (error) {
    console.error('[AnalyticsController Overview Error]', error);
    next(error);
  }
};

/**
 * GET /api/analytics/simulations/:id
 * Returns deep demographic cross-tabulations and driver frequency for a single simulation
 */
export const getSimulationAnalyticsHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const analytics = await analyticsService.getSimulationAnalytics(id);
    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('[AnalyticsController Simulation DeepDive Error]', error);
    next(error);
  }
};

/**
 * GET /api/analytics/compare?ids=id1,id2
 * Compares two or more product simulations side-by-side
 */
export const compareSimulationsHandler = async (req, res, next) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "ids" is required (e.g. ?ids=id1,id2)',
      });
    }

    const idList = ids
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (idList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one valid simulation ID.',
      });
    }

    const comparison = await analyticsService.compareSimulations(idList);
    res.status(200).json({
      success: true,
      comparison,
    });
  } catch (error) {
    console.error('[AnalyticsController Compare Error]', error);
    next(error);
  }
};

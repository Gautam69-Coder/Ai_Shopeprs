import * as evaluationService from '../services/evaluationService.js';
import * as simulationService from '../services/simulationService.js';

/**
 * POST /api/simulations/:id/evaluate
 * Triggers AI evaluation & classification for an existing simulation
 */
export const evaluateSimulationHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evaluatedSimulation = await evaluationService.evaluateSimulation(id);

    res.status(200).json({
      success: true,
      message: 'Simulation responses successfully classified and synthesized',
      simulation: evaluatedSimulation,
    });
  } catch (error) {
    console.error('[EvaluationController Error]', error);
    next(error);
  }
};

/**
 * GET /api/simulations/:id/evaluation
 * Retrieves the classification breakdown and executive synthesis for a simulation
 */
export const getEvaluationHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const simulation = await simulationService.getSimulationById(id);

    res.status(200).json({
      success: true,
      simulationId: simulation._id,
      product: simulation.product,
      evaluationSummary: simulation.evaluationSummary,
      responses: simulation.responses.map((r) => ({
        shopperId: r.shopperId,
        shopperName: r.shopperName,
        classification: r.classification,
      })),
    });
  } catch (error) {
    console.error('[EvaluationController Error]', error);
    next(error);
  }
};

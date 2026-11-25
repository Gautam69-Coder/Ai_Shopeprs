import * as simulationService from '../services/simulationService.js';
import { runSimulationRequestSchema } from '../validators/simulationValidator.js';

/**
 * POST /api/simulations/run
 * Runs a product simulation across a cohort of synthetic shoppers
 */
export const runSimulationHandler = async (req, res, next) => {
  try {
    const parsedBody = runSimulationRequestSchema.safeParse(req.body);
    if (!parsedBody.success) {
      const issues = parsedBody.error.issues || parsedBody.error.errors || [];
      const errorMessages = issues.map((e) => `${e.path.join('.') || 'field'}: ${e.message}`);
      return res.status(400).json({
        error: {
          message: 'Invalid simulation request',
          details: errorMessages,
          statusCode: 400,
        },
      });
    }

    const { batchId, product } = parsedBody.data;

    const simulation = await simulationService.runSimulation({
      batchId,
      product,
    });

    res.status(201).json({
      success: true,
      message: `Simulation completed across ${simulation.shopperCount} shopper(s)`,
      simulation,
    });
  } catch (error) {
    console.error('[SimulationController Error]', error);
    next(error);
  }
};

/**
 * GET /api/simulations
 * Retrieves recent simulation runs
 */
export const getSimulationsHandler = async (req, res, next) => {
  try {
    const simulations = await simulationService.getSimulations();
    res.status(200).json({
      success: true,
      count: simulations.length,
      simulations,
    });
  } catch (error) {
    console.error('[SimulationController Error]', error);
    next(error);
  }
};

/**
 * GET /api/simulations/:id
 * Retrieves a single simulation with full shopper responses
 */
export const getSimulationByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const simulation = await simulationService.getSimulationById(id);
    res.status(200).json({
      success: true,
      simulation,
    });
  } catch (error) {
    console.error('[SimulationController Error]', error);
    next(error);
  }
};

/**
 * DELETE /api/simulations
 * Clears all simulation reports/runs
 */
export const deleteAllSimulationsHandler = async (req, res, next) => {
  try {
    const result = await simulationService.deleteAllSimulations();
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} simulation run(s)`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('[SimulationController Error]', error);
    next(error);
  }
};

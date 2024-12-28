import Plan from "../models/plans.js";
import {
  create,
  getAll,
  getOne,
  updateOne,
  deleteOne,
} from "./factoryHandler.js";

export const createPlan = create(Plan);
export const getAllPlans = getAll(Plan);
export const getPlan = getOne(Plan, ["User"]);
export const updatePlan = updateOne(Plan);
export const deletePlan = deleteOne(Plan);

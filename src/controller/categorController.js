import Category from "../models/categorySchema.js";
import { create, getAll, getOne,deleteOne,updateOne } from "./factoryHandler.js";
export const createCategory=create(Category);
export const GetAlCategories=getAll(Category);
export const getCategory=getOne(Category);
export  const deleteCategory=deleteOne(Category);
export const updateCategory=updateOne(Category);

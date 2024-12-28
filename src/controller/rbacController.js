import Permission from "../models/permission.js";
import Role from "../models/role.js";
import asyncHandler from "../utils/asycnHandler.js";
import { create, getAll } from "./factoryHandler.js";

const getAllRoles = getAll(Role);
const createRole = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const isRoleExist = await Role.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });
  if (isRoleExist) {
    return next(new Error("Role already exists"));
  }
  const role = await Role.create({ name });
  res.status(201).json({
    status: "success",
    message: "Role created successfully",
    data: role,
  });
});
const addPermission = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const isPermissionExist = await Permission.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });
  if (isPermissionExist) {
    return next(new Error("Permission already exists"));
  }
  const permission = await Permission.create({ name });
  res.status(201).json({
    status: "success",
    message: "Permission created successfully",
    data: permission,
  });
});
const getAllPermissions = getAll(Permission);
const addPermissionToRole = asyncHandler(async (req, res, next) => {
  const { roleId } = req.params;
  const { permissionIds } = req.body;
  // check if the permssiion exist
  const permissions = await Permission.find({ _id: { $in: permissionIds } });
  if (permissions.length !== permissionIds.length) {
    return next(new Error("Some permissions do not exist"));
  }
  //   find role and udate the role.
  const role = await Role.findById(roleId);
  if (!role) {
    return next(new Error("Role not found"));
  }
  role.permissions.push(...permissionIds);
  await role.save();
  res.status(200).json({
    status: "success",
    message: "Permission added to role successfully",
    role,
  });
});

export {
  getAllRoles,
  createRole,
  addPermission,
  getAllPermissions,
  addPermissionToRole,
};

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./src/models/users.js";
import Role from "./src/models/role.js";
import asyncHandler from "./src/utils/asycnHandler.js";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import "dotenv/config";

// CLI options
const argv = yargs(hideBin(process.argv))
  .option("email", {
    alias: "e",
    description: "Super admin email",
    type: "string",
    demandOption: true,
  })
  .option("password", {
    alias: "p",
    description: "Super admin password",
    type: "string",
    demandOption: true,
  })
  .help()
  .alias("help", "h").argv;

const createSuperAdmin = asyncHandler(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  // Fetch the super admin role first
  const superAdminRole = await Role.findOne({ name: "superAdmin" });

  // Check if the role was found
  if (!superAdminRole) {
    console.log("Super Admin role not found. Please create the role first.");
    mongoose.disconnect();
    return;
  }

  // Check if a super admin with this role already exists
  const existingSuperAdmin = await User.findOne({ role: superAdminRole._id });
  if (existingSuperAdmin) {
    console.log("Super Admin already exists. Script will not run again.");
    mongoose.disconnect();
    return;
  }

  // Create super admin
  const { email, password } = argv;

  const superAdmin = new User({
    email,
    password,
    role: superAdminRole._id,
    firstName: null,
    lastName: null,
  });

  await superAdmin.save();
  console.log("Super Admin created successfully");
  mongoose.disconnect();
});

createSuperAdmin();

// Run the script with the following command:
//  node createSuperAdmin.js --email="admin@example.com" --password="strongPassword"

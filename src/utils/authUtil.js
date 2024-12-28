import bcrpyt from "bcrypt";
import * as crypto from "node:crypto";

export const hashPassword = async (password) => {
  return await bcrpyt.hash(password, 12);
};
export const comparePassword = async (candidatePassword, userPassword) => {
  return await bcrpyt.compare(candidatePassword, userPassword);
};

export const generatePasswordResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const expires = Date.now() + 10 * 60 * 1000;
  return { resetToken, hashedToken, expires };
};

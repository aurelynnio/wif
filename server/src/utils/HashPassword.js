import bcrypt from "bcrypt";

import logger from "../configs/logger.js";

export const hashPassword = async (password) => {
  try {
    const salt = 10;
    return await bcrypt.hash(password, salt);
  } catch (e) {
    logger.error(`Error hashing password: ${e}`);
    throw e;
  }
};

export const comparePassword = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

import jwt from "jsonwebtoken";

export const generateNewToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true, //Prevents XSS attacks
    secure: process.env.NODE_ENV === "production", //for https protection
    sameSite: "strict", //Prevents CSRF
    maxAge: 7 * 60 * 60 * 24 * 1000,
  });

  return token;
};

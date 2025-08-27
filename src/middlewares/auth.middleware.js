import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async function (request, response, next) {
  try {
    const token = request.cookies.jwt;

    if (!token) {
      return response
        .status(401)
        .json({ message: "Unauthorized - No token is provided" });
    }

    const decoded = jwt.decode(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return response
        .status(401)
        .json({ message: "Unauthorized - Token is invalid" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return response
        .status(401)
        .json({ message: "Unauthorized - User isn't founded" });
    }

    request.user = user;
    next();
  } catch (error) {
    console.log(`Error in login protect route middleware ${error}`);
    response.status(500).json({ message: "Internal Server Error" });
  }
};

export { protectRoute };

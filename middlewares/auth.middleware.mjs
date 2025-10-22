import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.mjs";

export const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "You are not authenticated" });
  }
  const token = authorization.split(" ")[1];

  let user = null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const id = payload.id;
    user = await UserModel.findById(id);

    if (!user) {
      return res.status(403).send({ message: "Session user not found!" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .send({ message: "Unsuccess", body: JSON.stringify(error, null, 2) });
  }
  req.user = user;
  next( );
};

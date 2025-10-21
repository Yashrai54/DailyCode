import { signin,signup } from "../controllers/user.controller.js";

import express from "express";
const userRouter=express.Router();

userRouter.post('/signup',signup)
userRouter.post('/signin',signin)

export default userRouter;
import express from 'express';
import { getContest } from '../controllers/contest.controller.js';
import isAuth from '../middlewares/isAuth.js';
import Contest from '../models/contest.model.js';

const contestRouter=express.Router();

contestRouter.get("/daily",isAuth,getContest);
contestRouter.get("/",isAuth,async(req,res)=>{
    const result=await Contest.find().sort({createdAt:-1}).limit(1);
    if(!result){
        return res.render("Home",{error:"No contest found"});
    }
    res.render("Home",{contest:result[0]});
});

export default contestRouter;
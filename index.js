import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRouter from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
import nodeCron from 'node-cron';
import { createDailyContest } from './controllers/contest.controller.js';
import contestRouter from './routes/contest.routes.js';
import submissionRouter from './routes/submission.routes.js';
import { error } from 'console';
import isAuth from './middlewares/isAuth.js';
dotenv.config();

connectDB();
nodeCron.schedule('0 0 * * *', () => {
    console.log('Running daily contest creation task at midnight');
    createDailyContest();
});

const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static('public'));
app.set("view engine","ejs");
app.use('/api/users',userRouter);
app.use("/api/contest",contestRouter)
app.use("/api/submission",submissionRouter)

app.get("/signup",(req,res)=>{
    res.render("SignUp",{error:null});
})
app.get('/', (req, res) => {
  res.render('SignIn', { title: 'Sign In',error:null });
});
app.get('/signin', (req, res) => {
  res.render('SignUp', { title: 'Sign In',error:null });
});

app.listen(process.env.PORT,()=>{
    console.log('Server is running on port',process.env.PORT);
});

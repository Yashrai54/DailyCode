import User from "../models/user.model.js";
import bcrypt, { genSalt, genSaltSync } from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup=async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        const existingUser=await User.findOne({email})
        if(existingUser){
            return res.render("signup",{error:"User already exists"});
        }
        const hashedPassword= await bcrypt.hash(password,10)
        const newUser=new User({name,email,password:hashedPassword});
        await newUser.save();
        console.log("New user created:", newUser);
        return res.redirect('/signin');
    }
    catch(error){   
        console.error(error);
        return res.render("signup",{error:"Server error"});
    }
}
export const signin=async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.render("signin",{error:"Invalid credentials"});
        }
        const isMatch=await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.render("signin",{error:"Invalid credentials"});
        }
        const session=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:'12h'});

        res.cookie("token",session,{
            httpOnly:true,
            sameSite:'Strict',
            maxAge:12*60*60*1000
        })
        return res.redirect('/api/contest/')
    }
    catch(error){
        return res.render("signin",{error:"Server error"});
    }
}
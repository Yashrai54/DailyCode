import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    inputFormat:{
        type:[String],
        required:true  
    },
    outputFormat:{
        type:[String],
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now   
    },
    deadline:{
        type:Date,
        required:true
    }
})
const Contest=mongoose.model("Contest",contestSchema);
export default Contest;
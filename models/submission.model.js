import mongoose from "mongoose";
import { type } from "os";

const submissionSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    contest:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Contest',
        required:true
    },
    submittedAt:{
        type:Date,
        default:Date.now
    },
    language:{
        type:String,
        required:true
    },
    code:{
        type:String,  
    },
    filePath:{
        type:String,
    }
})
const Submission=mongoose.model("Submission",submissionSchema);
export default Submission;
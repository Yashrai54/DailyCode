import Contest from "../models/contest.model.js";
import { generateContestProblem } from "../utils/ai.js";

export const createDailyContest = async () => {
    try {
            const topic = `Generate a fresh competitive programming contest problem focused on DSA.
         The problem should be challenging but doable for intermediate coders.`
            const prompt = await generateContestProblem(topic);
            await Contest.deleteMany({});
            let properDescription=prompt.description.replace(/\n/g,"<br/>");
            
            prompt.description=properDescription;
            await Contest.create({
                title: prompt.title,
                description: prompt.description,
                inputFormat: prompt.inputFormat,
                outputFormat: prompt.outputFormat,
                deadline: new Date(Date.now()+24*60*60*1000)
            });
            console.log("Daily contest created successfully");
    }
    catch (error) {
        console.error("Error creating daily contest:", error);
    }
}
export const getContest=async(req,res)=>{
    try{
        const dailyContest=await Contest.find().sort({createdAt:-1}).limit(1);
        if(!dailyContest){
            return res.status(404).json({message:"No contest found"});
        }
        return res.status(200).json(dailyContest[0]);
    }
    catch(error){
        console.error("Error fetching contest:",error);
        return res.status(500).json({message:"Server error",error:error.message});
    }
}
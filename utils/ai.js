import  OpenAI  from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateContestProblem =async(prompt)=>{
    try {
        const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "user",
      content: `
Generate a competitive programming problem in JSON format with the following structure:

{
  "title": "string",
  "description": "string",
  "inputFormat": ["string", "string", ...],
  "outputFormat": ["string", "string", ...]
}

Rules:
1. "title" should be concise.
2. "description" should clearly explain the problem.
3. "inputFormat" must be an array of at least **5 strings**, each representing a full test case input. Do NOT include variable types or explanations inside the strings.
4. "outputFormat" must be an array of strings corresponding to each input in "inputFormat", representing the expected output. No explanations inside. 
5. JSON must be valid and contain no extra text outside the fields.
6. All explanation should go only in "description".
      `,
    },
  ],
});


        let message=response.choices[0].message.content.trim();
        message=message.replace(/```json|```/g,"");
        const problemJSON=JSON.parse(message);
        return problemJSON;
    } catch (error) {
        console.error("Error generating contest problem:", error);
        throw error;
    }
}
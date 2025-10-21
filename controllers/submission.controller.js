import { upload } from "../config/multer.js";
import Submission from "../models/submission.model.js";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import Contest from "../models/contest.model.js";

const execPromise = (command, options) =>
  new Promise((resolve, reject) => {
    const defaultOptions = { timeout: 10 * 1000, maxBuffer: 1024 * 1024, ...options };
    exec(command, defaultOptions, (error, stdout, stderr) => {
      if (error) return reject({ error, stderr });
      resolve({ stdout, stderr });
    });
  });

const handleSubmission = async (req, res) => {
  let filePath = "";
  let executablePath = "";
  let inputPath = "";

  try {
    const contestId = req.params.id;
    const userId = req.user.userId;
    const submissionsDir = path.join("uploads", "submissions");

    if (!fs.existsSync(submissionsDir)) fs.mkdirSync(submissionsDir, { recursive: true });

    let codeBody = req.body.code || "";

    if (req.file) filePath = req.file.path;

    if (codeBody) {
      codeBody = codeBody.trim();
      const language = req.body.language;
      const ext =
        language === "python"
          ? ".py"
          : language === "javascript"
          ? ".js"
          : language === "cpp"
          ? ".cpp"
          : language === "java"
          ? ".java"
          : language === "c"
          ? ".c"
          : language === "ruby"
          ? ".rb"
          : language === "go"
          ? ".go"
          : language === "php"
          ? ".php"
          : language === "csharp"
          ? ".cs"
          : language === "Kotlin"
          ? ".kt"
          : language === "rust"
          ? ".rs"
          : ".txt";

      const baseName = `${userId}-${Date.now()}`;
      const tempFilePath = path.join(submissionsDir, baseName + ext);
      fs.writeFileSync(tempFilePath, codeBody);
      filePath = tempFilePath;
    }

    if (!codeBody && !filePath)
      return res.render("submission", { error: "No code submitted", contestId, submissionID: null, message: null });

    const newSubmission = new Submission({
      user: userId,
      contest: contestId,
      language: req.body.language,
      code: codeBody,
      filePath: filePath,
    });
    await newSubmission.save();

    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const dirName = path.dirname(filePath);
    const contest = await Contest.findById(contestId);

    // multiple test cases
    const inputs = contest.inputFormat; // Array of strings
    const outputs = contest.outputFormat.map((o) => o.trim()); // Array of strings

    let allPassed = true;
    let combinedOutput = "";

    // prepare execution command (without input redirection)
    let command;
    switch (req.body.language) {
      case "cpp":
        executablePath = path.join(dirName, baseName + ".exe");
        command = `g++ "${filePath}" -o "${executablePath}" && "${executablePath}"`;
        break;
      case "c":
        executablePath = path.join(dirName, baseName + ".exe");
        command = `gcc "${filePath}" -o "${executablePath}" && "${executablePath}"`;
        break;
      case "python":
        command = `python "${filePath}"`;
        break;
      case "Node":
      case "javascript":
        command = `node "${filePath}"`;
        break;
      case "java":
        executablePath = path.join(dirName, baseName + ".class");
        command = `javac "${filePath}" && java -cp "${dirName}" ${baseName}`;
        break;
      case "ruby":
        command = `ruby "${filePath}"`;
        break;
      case "go":
        command = `go run "${filePath}"`;
        break;
      case "php":
        command = `php "${filePath}"`;
        break;
      case "csharp":
        executablePath = path.join(dirName, baseName + ".exe");
        command = `mcs "${filePath}" -out:"${executablePath}" && "${executablePath}"`;
        break;
      case "Kotlin":
        executablePath = path.join(dirName, baseName + ".jar");
        command = `kotlinc "${filePath}" -include-runtime -d "${executablePath}" && java -jar "${executablePath}"`;
        break;
      case "rust":
        executablePath = path.join(dirName, baseName + ".exe");
        command = `rustc "${filePath}" -o "${executablePath}" && "${executablePath}"`;
        break;
      default:
        return res.render("submission", { error: "Language not supported", message: null, contestId, submissionID: newSubmission._id });
    }

    // loop over all test cases
   for (let i = 0; i < inputs.length; i++) {
  inputPath = path.join(dirName, `${baseName}_${i}.in`);
  fs.writeFileSync(inputPath, inputs[i]);
  const redirection = `< "${inputPath}"`;

  let stdout;
  try {
    ({ stdout } = await execPromise(`${command} ${redirection}`));
  } catch (e) {
    return res.render("submission", {
      error: e.stderr || e.error.message || "Runtime/Compile Error",
      message: null,
      contestId,
      submissionID: newSubmission._id,
    });
  }

  const userOutput = stdout.trim();
  console.log(userOutput)

  // Compare individually before building display string
  if (userOutput !== outputs[i]) {
    return res.render("submission", {
      error: `Wrong Answer on test case ${i + 1}. Expected: "${outputs[i]}", Received: "${userOutput}"`,
      message: null,
      contestId,
      submissionID: newSubmission._id,
    });
  }

  // Only safe to add after checking correctness
  combinedOutput += `Test case ${i + 1}: ${userOutput}\n`;

  fs.unlinkSync(inputPath);
}


    return res.render("submission", {
      message: `Submission Accepted!\n${combinedOutput}`,
      error: null,
      contestId,
      submissionID: newSubmission._id,
    });
  } catch (err) {
    console.error("Error handling submission:", err);
    return res.render("submission", { error: "Internal Server Error during submission.", message: null, contestId, submissionID: null });
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (executablePath && fs.existsSync(executablePath)) fs.unlinkSync(executablePath);
  }
};

export default handleSubmission;

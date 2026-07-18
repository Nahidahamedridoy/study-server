const { db } = require("../config/db");
const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const collectionName = "chats";

const chatWithAI = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required and must be a string" });
    }

    // Generate content using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const aiResponse = response.text;

    // Create chat record
    const chatLog = {
      prompt,
      response: aiResponse,
      createdAt: new Date(),
    };

    // Store the conversation in MongoDB
    await db.collection(collectionName).insertOne(chatLog);

    // Return the response
    res.status(200).json({
      message: "Chat generated successfully",
      chat: chatLog,
    });
  } catch (error) {
    next(error);
  }
};

const generateStudyPlan = async (req, res, next) => {
  try {
    const { subject, examDate, dailyStudyHours } = req.body;

    if (!subject || !examDate || !dailyStudyHours) {
      return res.status(400).json({ error: "Missing required fields: subject, examDate, dailyStudyHours" });
    }

    const prompt = `Create a day-by-day study plan for ${subject}. The exam is on ${examDate}, and I can study for ${dailyStudyHours} hours per day. Return the plan as a JSON object with a single "plan" array property, where each item has "day" (number), "date" (string), "topics" (array of strings), and "duration" (string).`;

    // Generate structured JSON content using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let planData;
    try {
      planData = JSON.parse(response.text);
    } catch (parseError) {
      return res.status(500).json({ error: "AI returned invalid JSON format" });
    }

    // Create study plan record
    const studyPlanRecord = {
      subject,
      examDate,
      dailyStudyHours,
      plan: planData.plan || planData,
      createdAt: new Date(),
    };

    // Store in MongoDB
    const result = await db.collection("study_plans").insertOne(studyPlanRecord);

    res.status(200).json({
      message: "Study plan generated successfully",
      studyPlan: { ...studyPlanRecord, _id: result.insertedId },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAI,
  generateStudyPlan,
};

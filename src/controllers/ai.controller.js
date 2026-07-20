const { db } = require("../config/db");
const { GoogleGenAI } = require("@google/genai");
const { ObjectId } = require("mongodb");

// Initialize Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);

const collectionName = "chats";

const generateWithFallback = async (params) => {
  const configuredModel = process.env.GEMINI_MODEL;
  // Supported fallback models
  const fallbackModels = ["gemini-2.0-flash", "gemini-flash-latest"];
  
  const modelsToTry = [...new Set([configuredModel, ...fallbackModels].filter(Boolean))];
  
  let lastError;

  for (const model of modelsToTry) {
    try {
      return await ai.models.generateContent({
        ...params,
        model: model,
      });
    } catch (error) {
      console.error(`[Gemini API Error] Model: ${model} - ${error.message || error}`);
      lastError = error;
    }
  }

  throw lastError;
};

const chatWithAI = async (req, res, next) => {
  try {
    const { prompt, conversationId, messages } = req.body;

    let contents = [];
    if (messages && Array.isArray(messages)) {
      contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
    } else if (prompt && typeof prompt === "string") {
      contents = [{ role: 'user', parts: [{ text: prompt }] }];
    } else {
      return res.status(400).json({ error: "Prompt or messages array is required" });
    }

    // Generate content using Gemini with fallback
    const response = await generateWithFallback({
      contents: contents,
    });

    const aiResponse = response.text;

    // Create chat record
    const chatLog = {
      conversationId: conversationId || new Date().getTime().toString(),
      prompt: prompt || (messages ? messages[messages.length - 1].content : ""),
      response: aiResponse,
      createdAt: new Date(),
    };

    // Store the conversation in MongoDB
    const result = await db.collection(collectionName).insertOne(chatLog);
    chatLog._id = result.insertedId;

    // Return the response
    res.status(200).json({
      message: "Chat generated successfully",
      chat: chatLog,
    });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI response" });
  }
};

const generateStudyPlan = async (req, res, next) => {
  try {
    const { subject, examDate, dailyStudyHours } = req.body;

    if (!subject || !examDate || !dailyStudyHours) {
      return res.status(400).json({ error: "Missing required fields: subject, examDate, dailyStudyHours" });
    }

    const prompt = `Create a day-by-day study plan for ${subject}. The exam is on ${examDate}, and I can study for ${dailyStudyHours} hours per day. Return the plan as a JSON object with a single "plan" array property, where each item has "day" (number), "date" (string), "topics" (array of strings), and "duration" (string).`;

    // Generate structured JSON content using Gemini with fallback
    const response = await generateWithFallback({
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
    console.error("Gemini Study Plan Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate study plan" });
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 200 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 200);
    const skip = (pageNum - 1) * limitNum;

    const history = await db
      .collection(collectionName)
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    res.status(200).json(history);
  } catch (error) {
    console.error("Fetch Chat History Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch chat history" });
  }
};

const updateReaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    if (reaction && !['like', 'dislike'].includes(reaction)) {
      return res.status(400).json({ error: "Invalid reaction type" });
    }

    let updateDoc = {};
    if (reaction) {
      updateDoc = { $set: { reaction } };
    } else {
      updateDoc = { $unset: { reaction: "" } };
    }

    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json({ message: "Reaction updated successfully" });
  } catch (error) {
    console.error("Update Reaction Error:", error);
    res.status(500).json({ error: "Failed to update reaction" });
  }
};

const deleteChatHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Delete Chat Error:", error);
    res.status(500).json({ error: "Failed to delete chat" });
  }
};

module.exports = {
  chatWithAI,
  generateStudyPlan,
  getChatHistory,
  updateReaction,
  deleteChatHistory,
};

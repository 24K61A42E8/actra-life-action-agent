const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdf = require("pdf-parse");
const crypto = require("crypto");

admin.initializeApp();

const db = admin.firestore();

setGlobalOptions({
  maxInstances: 10,
});

const app = express();

app.use(cors({origin: true}));
app.use(express.json({limit: "2mb"}));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});


function dateFromText(text) {
  const iso = text.match(
      /\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/,
  );

  if (iso) {
    return `${iso[1]}-${String(iso[2]).padStart(2, "0")}-${String(iso[3]).padStart(2, "0")}`;
  }

  const dmy = text.match(
      /\b(\d{1,2})[/. -](\d{1,2})[/. -](20\d{2})\b/,
  );

  if (dmy) {
    return `${dmy[3]}-${String(dmy[2]).padStart(2, "0")}-${String(dmy[1]).padStart(2, "0")}`;
  }

  const months = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  };

  const monthMatch = text.match(
      /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i,
  );

  if (monthMatch) {
    return `${monthMatch[3]}-${String(months[monthMatch[2].toLowerCase()]).padStart(2, "0")}-${String(monthMatch[1]).padStart(2, "0")}`;
  }

  return null;
}


function peopleFromText(text) {
  const names = new Set();

  const regex =
    /\b(?:send|share|give|contact|tell|meet|with)\s+(?:it\s+to\s+)?([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)/g;

  let match;

  while ((match = regex.exec(text)) !== null) {
    names.add(match[1]);
  }

  return [...names];
}


function extract(text, title = "Source") {
  const lines = text
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);

  const deadline = dateFromText(text);
  const people = peopleFromText(text);

  const taskLines = lines.filter((line) =>
    /^(submit|send|complete|finish|pay|register|apply|upload|attend|bring|call|contact|prepare|book|renew|reply|schedule|download|fill|return|visit|meet)\b/i.test(line) ||
    /\b(deadline|due|must|required|need to|needs to|should)\b/i.test(line),
  );

  const unique = [...new Set(taskLines)];

  const actions = unique.slice(0, 8).map((line) => ({
    title: line.replace(/^[-•*]\s*/, "").slice(0, 180),
    deadline,
    person: people[0] || null,
    priority: /urgent|asap|immediately|today/i.test(line) ?
      "Urgent" :
      "Normal",
    reason: `Actra found this action in ${title}.`,
  }));

  if (!actions.length && text.trim()) {
    actions.push({
      title: "Review the information from this input",
      deadline,
      person: people[0] || null,
      priority: "Normal",
      reason:
        `Actra could not identify a specific command, so it created a review action from ${title}.`,
    });
  }

  return {
    actions,
    people,
    summary: text.replace(/\s+/g, " ").slice(0, 500),
  };
}


async function addAction(action) {
  const item = {
    id: crypto.randomUUID(),
    status: "Pending",
    priority: action.priority || "Normal",
    createdAt: new Date().toISOString(),
    ...action,
  };

  await db.collection("actions").doc(item.id).set(item);

  return item;
}


async function addPerson(name) {
  if (!name) return;

  const snapshot = await db.collection("people")
      .where("nameLower", "==", name.toLowerCase())
      .limit(1)
      .get();

  if (snapshot.empty) {
    const id = crypto.randomUUID();

    await db.collection("people").doc(id).set({
      id,
      name,
      nameLower: name.toLowerCase(),
      createdAt: new Date().toISOString(),
    });
  }
}


async function addDocument(document) {
  const id = crypto.randomUUID();

  await db.collection("documents").doc(id).set({
    id,
    createdAt: new Date().toISOString(),
    ...document,
  });
}


async function getActions() {
  const snapshot = await db.collection("actions")
      .orderBy("createdAt", "desc")
      .get();

  return snapshot.docs.map((doc) => doc.data());
}


async function dashboard() {
  const actions = await getActions();

  const today = new Date().toISOString().slice(0, 10);

  const peopleSnapshot = await db.collection("people").get();
  const documentsSnapshot = await db.collection("documents").get();

  return {
    today: actions.filter(
        (action) =>
          action.status !== "Done" &&
          (!action.deadline || action.deadline.startsWith(today)),
    ).length,

    urgent: actions.filter(
        (action) =>
          action.status !== "Done" &&
          action.priority === "Urgent",
    ).length,

    completed: actions.filter(
        (action) => action.status === "Done",
    ).length,

    people: peopleSnapshot.size,

    commitments: 0,

    documents: documentsSnapshot.size,
  };
}


async function generateReply(message) {
  const provider =
    (process.env.AI_PROVIDER || "demo").toLowerCase();


  // OPENAI
  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    const body = {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",

      messages: [
        {
          role: "system",
          content:
            "You are Actra, an AI life action agent. Help users turn information into clear, safe next actions. Do not claim to have performed external actions. Ask clarification when needed.",
        },
        {
          role: "user",
          content: message,
        },
      ],

      temperature: 0.2,
    };

    const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Authorization":
              `Bearer ${process.env.OPENAI_API_KEY}`,
          },

          body: JSON.stringify(body),
        },
    );

    if (!response.ok) {
      throw new Error("OpenAI request failed");
    }

    const data = await response.json();

    if (
      data &&
      data.choices &&
      data.choices.length > 0 &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      return data.choices[0].message.content;
    }

    return "I could not generate a response.";
  }


  // GEMINI
  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    const model =
      process.env.GEMINI_MODEL || "gemini-2.0-flash";

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text:
                      `You are Actra, an AI life action agent. Help users turn information into clear, safe next actions. Do not claim to have performed external actions. Ask clarification when needed.\n\n${message}`,
                  },
                ],
              },
            ],
          }),
        },
    );

    if (!response.ok) {
      throw new Error("Gemini request failed");
    }

    const data = await response.json();

    if (
      data &&
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts.length > 0 &&
      data.candidates[0].content.parts[0].text
    ) {
      return data.candidates[0].content.parts[0].text;
    }

    return "I could not generate a response.";
  }


  // DEMO MODE
  return `I understand. In demo mode, I would turn this into structured actions, deadlines and follow-ups.

You said: "${message.slice(0, 500)}"

Add an AI provider key to enable live reasoning.`;
}


// HOME
app.get("/", (req, res) => {
  res.json({
    name: "Actra",
    description: "AI Life Action Agent",
    status: "running",
  });
});


// HEALTH
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "actra-firebase",
    aiProvider: process.env.AI_PROVIDER || "demo",
  });
});


// GET ACTIONS
app.get("/api/actions", async (req, res) => {
  try {
    res.json(await getActions());
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to load actions",
    });
  }
});


// DASHBOARD
app.get("/api/dashboard", async (req, res) => {
  try {
    res.json(await dashboard());
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to load dashboard",
    });
  }
});


// UPDATE ACTION
app.patch("/api/actions/:id", async (req, res) => {
  try {
    const reference =
      db.collection("actions").doc(req.params.id);

    const existing = await reference.get();

    if (!existing.exists) {
      return res.status(404).json({
        error: "Action not found",
      });
    }

    const patch = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await reference.update(patch);

    res.json({
      ...existing.data(),
      ...patch,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update action",
    });
  }
});


// TEXT INGEST
app.post("/api/ingest/text", async (req, res) => {
  try {
    const {
      text,
      title = "Text input",
    } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "Text is required",
      });
    }

    const result = extract(text, title);

    const actions = [];

    for (const action of result.actions) {
      actions.push(await addAction(action));
    }

    for (const person of result.people) {
      await addPerson(person);
    }

    await addDocument({
      title,
      type: "text",
      summary: result.summary,
    });

    res.json({
      success: true,
      created: actions.length,
      actions,
      summary: result.summary,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});


// FILE INGEST
app.post(
    "/api/ingest/file",
    upload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            error: "File is required",
          });
        }

        let text = "";

        const original =
          req.file.originalname;

        const extension =
          original.split(".").pop().toLowerCase();


        // PDF
        if (extension === "pdf") {
          const data =
            await pdf(req.file.buffer);

          text = data.text || "";
        }


        // TXT
        else if (extension === "txt") {
          text =
            req.file.buffer.toString("utf8");
        }


        // IMAGE
        else if (
          ["png", "jpg", "jpeg"].includes(extension)
        ) {
          text =
            "Image uploaded. OCR integration can be connected to the AI provider layer.";
        }


        // AUDIO
        else if (
          ["mp3", "wav", "m4a", "webm", "ogg"].includes(extension)
        ) {
          text =
            "Voice note uploaded. Connect a transcription provider to enable automatic speech-to-text.";
        }


        // OTHER FILE
        else {
          text =
            req.file.buffer.toString("utf8");
        }

        const result =
          extract(text, original);

        const actions = [];

        for (const action of result.actions) {
          actions.push(await addAction(action));
        }

        for (const person of result.people) {
          await addPerson(person);
        }

        await addDocument({
          title: original,
          type: extension || "file",
          summary: result.summary,
        });

        res.json({
          success: true,
          created: actions.length,
          actions,
          summary: result.summary,
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          error: error.message,
        });
      }
    },
);


// CHAT
app.post("/api/chat", async (req, res) => {
  try {
    const message =
      req.body && req.body.message;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const reply =
      await generateReply(message);

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});


exports.api = onRequest(app);

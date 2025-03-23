require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Enable CORS for all origins and parse JSON bodies
app.use(cors());
app.use(express.json());

const HF_MODEL = "nishant-prateek/yogananda-finetuned";
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

// Home endpoint
app.get("/", (req, res) => {
  res.send("This is Home Page");
});

// Predict endpoint
app.post("/predict", async (req, res) => {
  const prompt = req.body.prompt;
  
  // Construct the payload for the Hugging Face Inference API
  const payload = {
    inputs: prompt,
    parameters: {
      max_length: 200,
      do_sample: true,
      top_k: 50,
      top_p: 0.95,
      temperature: 0.9
    }
  };

  try {
    const response = await axios.post(HF_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        // Optionally include your Hugging Face API token if needed:
        "Authorization": `Bearer ${process.env.HF_API_TOKEN}`
      }
    });
    
    // The API may return an array with one or more results.
    const result = response.data;
    let generatedText = "";
    if (Array.isArray(result) && result.length > 0) {
      generatedText = result[0].generated_text || "";
    } else if (result.generated_text) {
      generatedText = result.generated_text;
    }
    
    res.json({ generated_text: generatedText });
  } catch (error) {
    console.error("Error during inference:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "An error occurred during text generation." });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

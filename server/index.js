import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { AzureOpenAI } from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Azure OpenAI Configuration from environment variables
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION;


let openaiClient;

try {
  if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_API_KEY || !AZURE_OPENAI_DEPLOYMENT_NAME || !AZURE_OPENAI_API_VERSION) {
    throw new Error("Missing one or more Azure OpenAI environment variables. Please check your .env file.");
  }

  openaiClient = new AzureOpenAI({
    endpoint: AZURE_OPENAI_ENDPOINT,
    apiKey: AZURE_OPENAI_API_KEY,
    apiVersion: AZURE_OPENAI_API_VERSION,
    deployment: AZURE_OPENAI_DEPLOYMENT_NAME,
  });
  console.log("Azure OpenAI client initialized successfully.");
} catch (error) {
  console.error("Failed to initialize Azure OpenAI client:", error.message);
  console.error("Server cannot start without proper OpenAI configuration.");
  process.exit(1); // Exit if essential configuration is missing
}

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the Azure OpenAI Express App! Visit /guide to get AI insights.");
});

// Endpoint to get AI-generated Hyderabad guide
app.get("/guide", async (req, res) => {
  try {
    const response = await openaiClient.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant. Provide concise and interesting recommendations for tourists." },
        { role: "user", content: "I am going to Hyderabad, what should I see?" }
      ],
      max_tokens: 500,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      model: AZURE_OPENAI_DEPLOYMENT_NAME
    });

    if (response?.error !== undefined) {
        console.error("OpenAI API returned an error structure:", response.error);
        throw new Error(response.error.message || "Unknown error from OpenAI API");
    }

    const aiContent = response.choices[0]?.message?.content;

    if (aiContent) {
      // Set Content-Type to HTML to render markdown as HTML
      res.setHeader('Content-Type', 'text/html');
      // Basic HTML wrapper to display the response
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Travel Guide</title>
            <style>
                body { font-family: sans-serif; margin: 20px; line-height: 1.6; background-color: #f4f4f4; color: #333; }
                .container { max-width: 800px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                h1 { color: #0056b3; }
                pre { background-color: #eee; padding: 15px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Your travel Guide</h1>
                <p><strong>Query:</strong> I am going to Hyderabad, what should I see?</p>
                <h2>Recommendations:</h2>
                <pre>${aiContent}</pre>
                <p><em>Powered by Travel info bot.</em></p>
            </div>
        </body>
        </html>
      `);
      console.log("Successfully sent AI response to browser.");
    } else {
      res.status(500).send("No content received from Azure OpenAI.");
      console.error("AI response content was empty.");
    }

  } catch (error) {
    console.error("Error fetching AI response:", error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
          <style>
              body { font-family: sans-serif; margin: 20px; color: #cc0000; }
              .container { max-width: 800px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Error Generating Guide</h1>
              <p>An error occurred while trying to get a response from Azure OpenAI:</p>
              <pre>${error.message}</pre>
              <p>Please check your server logs for more details.</p>
          </div>
      </body>
      </html>
    `);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT}/guide in your browser to see the AI guide.`);
});

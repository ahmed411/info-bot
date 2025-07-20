import dotenv from "dotenv";
import { AzureOpenAI } from "openai";


dotenv.config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const modelName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

export async function main() {

  const options = { endpoint, apiKey, deployment, apiVersion }

  const client = new AzureOpenAI(options);

  const response = await client.chat.completions.create({
    messages: [
      { role:"system", content: "You are a helpful assistant." },
      { role:"user", content: "I am going to Hyderabad, what should I see?" }
    ],
    max_completion_tokens: 800,
      temperature: 1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      model: modelName
  });

  if (response?.error !== undefined && response.status !== "200") {
    throw response.error;
  }
  console.log(response.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
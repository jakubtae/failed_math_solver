import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();

import fs from "fs";

// function to encode file data to base64 encoded string
var imageAsBase64 = fs.readFileSync("./maturas/1/gptReady/13.png", "base64");

const openai = new OpenAI({
  organization: "org-7DYHAEW8WHov1bylcJvTrOw3",
  apiKey: process.env.GPT_KEY,
});

async function main() {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Solve this problem and describe the solution process.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${imageAsBase64}`,
            },
          },
        ],
      },
    ],
    max_tokens: 3000,
  });
  fs.writeFileSync("./ex13.json", JSON.stringify(response.choices));
}
main();

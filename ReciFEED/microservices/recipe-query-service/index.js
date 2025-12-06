/**
 * Service to query an LLM about a recipe
 * 
 * Uses wrapper package provided by Mistral to query their API 
 * via their HTTP endpoints
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Mistral } = require('@mistralai/mistralai');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const apiKey = process.env.MISTRAL_API_KEY;

// Get Mistral client associated with key
const mistralClient = new Mistral({apiKey: apiKey});

// Instructional prompt to give to the AI about answering recipe queries
const SYSTEM_PROMPT = `
  You are a friendly Recipe Question-Answering Assistant. Your task is to answer user queries about the content of the <RECIPE> section, and when needed, apply general cooking and food knowledge and common-sense reasoning.

  # Rules
  1. Use information from the recipe first.
  2. You may use general cooking knowledge (e.g., common allergens, typical kid-friendliness, flavor profiles).
  3. Do NOT invent fictional ingredients, steps, times, or quantities.
  4. If the user asks a question that requires personal preference or medical or safety advice, give a safe and general answer.
  5. If the user asks for something impossible to determine (e.g., "Who wrote this recipe?"), say you don't have enough information.
  6. Keep answers concise and helpful (1 - 4 sentences).

  # Examples

  ## Example 1
  <RECIPE>
  Title: Sweet Scones

  Ingredients:
  - 2 cups flour
  - 1 cup sugar

  Steps:
  1. Bake for 25 minutes at 350F.
  2. Cool tray for 10 minutes.
  </RECIPE>

  <UserQuery>
  How long does this recipe take overall?
  </UserQuery>

  <Assistant>
  The recipe says to bake for 25 minutes and cool for 10 minutes. So, the recipe takes 35 minutes total.
  </Assistant>

  ## Example 2
  <RECIPE>
  Title: Roast Chicken
  
  Ingredients:
  - 1 lb chicken
  - salt, pepper
  </RECIPE>

  <UserQuery>
  I am allergic to pepper. Should I make this?
  </UserQuery>

  <Assistant>
  This recipe contains pepper, so it would not be safe for someone with a pepper allergy.
  </Assistant>
`

const queryLLM = async (queryBody) => {
  const chatResponse = await mistralClient.chat.complete({
    model: 'mistral-small-latest',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: queryBody }
    ],
  });

  return chatResponse;
}

app.post('/query', async (req, res) => {
  // Ensure that Content-Type is application/json
  if (!req.is('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json.' });
  }

  // Retrieve recipe and query string (error if not provided)
  const { recipe, query } = req.body
  if (!recipe || !query || typeof recipe !== 'string' || typeof query !== 'string') {
    return res.status(400).json({ error: 'Must provide recipe string and query string.' });
  }

  // Create expected query structure
  const queryBody = `
    <RECIPE>
    ${recipe}
    </RECIPE>

    <UserQuery>
    ${query}
    </UserQuery>
  `;

  try {
    const response = await queryLLM(queryBody);

    // Extract text response
    const messageContent = response?.choices?.[0]?.message?.content ?? null;
    if (!messageContent) {
      return res.status(500).json({ error: 'Internal error receiving empty response content.' })
    }

    return res.status(200).json({ response: messageContent })
  } catch (error) {
    return res.status(500).json({ error: 'Internal error retrieving chat response.' });
  }
})

// Start server
const PORT = process.env.PORT || 3082;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
});

module.exports = app;

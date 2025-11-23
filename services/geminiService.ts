import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem, Recipe, Category } from "../types";

// Initialize the Gemini API client
// Using the API key from the environment variable as mandated
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRecipesFromIngredients = async (
  inventory: FoodItem[],
  dietaryPreference: string
): Promise<Recipe[]> => {
  if (inventory.length === 0) {
    return [];
  }

  const today = new Date();
  const expiringItems = inventory.filter((item) => {
    const expiry = new Date(item.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= -1; // Expiring in 3 days or just expired
  });

  const ingredientsList = inventory.map((item) => `${item.name} (${item.quantity})`).join(", ");
  const expiringList = expiringItems.map((item) => item.name).join(", ");

  let dietaryInstruction = '';
  if (dietaryPreference && dietaryPreference !== 'none') {
    dietaryInstruction = `Important: All recipes must be strictly ${dietaryPreference}.`;
  }

  const prompt = `
    I have the following ingredients in my pantry: ${ingredientsList}.
    
    ${expiringList.length > 0
      ? `Please prioritize using these ingredients as they are expiring soon: ${expiringList}.`
      : 'Suggest healthy and delicious recipes.'}
    
    ${dietaryInstruction}
    
    Generate 6 distinct healthy recipes based on these ingredients. 
    Ensure variety in cuisine and main ingredients.
    You can assume basic staples like salt, pepper, oil, and water are available.
    
    Return a JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              prepTime: { type: Type.STRING, description: "e.g., '30 mins'" },
              calories: { type: Type.INTEGER, description: "Approximate calories per serving" },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.STRING },
                  },
                },
              },
              instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              usedIngredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING, description: "Names of the pantry ingredients used in this recipe" },
              },
            },
            required: ["title", "description", "ingredients", "instructions", "prepTime", "calories"],
          },
        },
      },
    });

    if (response.text) {
      const rawRecipes = JSON.parse(response.text);
      // Add client-side IDs
      return rawRecipes.map((r: any, index: number) => ({
        ...r,
        id: `recipe-${Date.now()}-${index}`,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error generating recipes:", error);
    throw error;
  }
};

export const getStorageTip = async (itemName: string): Promise<string | null> => {
  if (!itemName) {
    return null;
  }

  const prompt = `Provide a very brief, actionable storage tip for "${itemName}". Examples: "Keep refrigerated.", "Store in a cool, dry pantry away from sunlight.", "Refrigerate after opening.". If you don't have a specific tip, return an empty string.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    if (response.text) {
      return response.text.trim();
    }
    return null;
  } catch (error) {
    console.error("Error generating storage tip:", error);
    return null; // Fail gracefully without throwing
  }
};

export const identifyFoodFromImage = async (imageBase64: string): Promise<{
  name: string;
  quantity: string;
  category: string;
  expiryDate: string;
} | null> => {
  const prompt = `
    Identify the food item in this image.
    Estimate the quantity visible (e.g., '2 apples', '1 bag', '500g').
    Categorize it into one of: Produce, Dairy, Meat, Pantry, Beverage, Other.
    Suggest a realistic expiry date (YYYY-MM-DD) assuming it was acquired today.
  `;

  try {
      // strip header if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Data
                }
            },
            { text: prompt }
          ],
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      name: { type: Type.STRING },
                      quantity: { type: Type.STRING },
                      category: { type: Type.STRING, enum: ["Produce", "Dairy", "Meat", "Pantry", "Beverage", "Other"] },
                      expiryDate: { type: Type.STRING },
                  },
                  required: ["name", "category", "expiryDate", "quantity"]
              }
          }
      });
      
      if (response.text) {
          return JSON.parse(response.text);
      }
      return null;

  } catch (error) {
      console.error("Error identifying food:", error);
      return null;
  }
};

export const getChefChatResponse = async (
  inventory: FoodItem[],
  userMessage: string,
  history: { role: 'user' | 'model', text: string }[]
): Promise<string> => {
    const ingredientsList = inventory.map((item) => `${item.name} (${item.quantity}, expires ${item.expiryDate})`).join(", ");
    
    const systemInstruction = `You are "Chef Bot", a helpful and witty kitchen assistant for the FreshKeep app.
    
    You have access to the user's pantry inventory:
    ${ingredientsList}
    
    Your goal is to help the user reduce food waste and cook delicious meals.
    - If they ask what to cook, suggest ideas based on their inventory (prioritizing expiring items).
    - If they ask about storage, give tips.
    - If they ask for a joke, make it food-related.
    - Keep answers concise (under 3 sentences usually) unless asked for a full recipe.
    - Be encouraging and friendly.
    `;

    try {
        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: systemInstruction,
            }
        });

        // Replay history to set context (simplified for this demo, ideally we'd use proper history object)
        // Note: For a real long chat, we would pass history properly to the chat.create or use chat.sendMessage with history.
        // Since we are re-creating the chat object here for statelessness in this service function style:
        
        let promptWithContext = userMessage;
        
        const result = await chat.sendMessage({
            message: promptWithContext
        });

        return result.text || "I'm having trouble thinking of an answer right now.";

    } catch (error) {
        console.error("Chat error:", error);
        return "Sorry, my kitchen brain is a bit scrambled right now. Try again?";
    }
};
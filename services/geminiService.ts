import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem, Recipe } from "../types";

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
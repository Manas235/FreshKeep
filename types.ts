export enum Category {
  PRODUCE = 'Produce',
  DAIRY = 'Dairy',
  MEAT = 'Meat',
  PANTRY = 'Pantry',
  BEVERAGE = 'Beverage',
  OTHER = 'Other',
}

export interface FoodItem {
  id: string;
  name: string;
  category: Category;
  quantity: string;
  expiryDate: string; // ISO string YYYY-MM-DD
  addedDate: string;
  storageTip?: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prepTime: string;
  calories: number;
  usedIngredients: string[]; // IDs of inventory items used
}

export type AlertType = 'danger' | 'warning' | 'success' | 'info';

export interface Alert {
  id: string;
  message: string;
  type: AlertType;
  date: string;
}
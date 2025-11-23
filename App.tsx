import React, { useState, useEffect, useMemo } from 'react';
import { FoodItem, Recipe, Alert, Category, AlertType } from './types';
import { generateRecipesFromIngredients } from './services/geminiService';
import FoodCard from './components/FoodCard';
import AddFoodModal from './components/AddFoodModal';
import AlertBanner from './components/AlertBanner';
import NotificationPanel from './components/NotificationPanel';
import ConfirmationModal from './components/ConfirmationModal';
import ChefChat from './components/ChefChat';
import { 
  PlusIcon, 
  ChefHatIcon, 
  LeafIcon, 
  LoaderIcon,
  BellIcon,
  SearchIcon,
  BookmarkIcon,
  TrashIcon,
  FilterIcon,
  ShuffleIcon,
} from './components/Icons';

const loadInitialData = (): FoodItem[] => {
  const saved = localStorage.getItem('freshKeepInventory');
  if (saved) return JSON.parse(saved);
  
  return [
    { id: '1', name: 'Greek Yogurt', category: Category.DAIRY, quantity: '500g', expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Keep refrigerated and consume within a week of opening.' },
    { id: '2', name: 'Spinach', category: Category.PRODUCE, quantity: '1 bag', expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Store in the crisper drawer of your refrigerator.' },
    { id: '3', name: 'Chicken Breast', category: Category.MEAT, quantity: '2 fillets', expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Refrigerate immediately and cook or freeze within 2 days.' },
    { id: '4', name: 'Brown Rice', category: Category.PANTRY, quantity: '1kg', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Store in an airtight container in a cool, dry pantry.' },
    { id: '5', name: 'Avocados', category: Category.PRODUCE, quantity: '3', expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Store at room temperature until ripe, then refrigerate.' },
    { id: '6', name: 'Milk', category: Category.DAIRY, quantity: '1L', expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Keep refrigerated.' },
    { id: '7', name: 'Eggs', category: Category.DAIRY, quantity: '12', expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Store in the main body of the refrigerator, not the door.' },
    { id: '8', name: 'Whole Wheat Bread', category: Category.PANTRY, quantity: '1 loaf', expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Store in a cool, dry place. Can be frozen for longer storage.' },
    { id: '9', name: 'Carrots', category: Category.PRODUCE, quantity: '1kg', expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Remove green tops and store in the refrigerator.' },
    { id: '11', name: 'Pasta', category: Category.PANTRY, quantity: '500g', expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Store in an airtight container in a cool, dry pantry.' },
    { id: '12', name: 'Apples', category: Category.PRODUCE, quantity: '6', expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Refrigerate to keep them crisp.' },
    { id: '13', name: 'Strawberries', category: Category.PRODUCE, quantity: '1 box', expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Refrigerate and wash only before eating.' },
    { id: '14', name: 'Salmon Fillet', category: Category.MEAT, quantity: '300g', expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Keep refrigerated and consume within 2 days.' },
    { id: '15', name: 'Orange Juice', category: Category.BEVERAGE, quantity: '1L', expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Refrigerate after opening.' },
    { id: '16', name: 'Cheddar Cheese', category: Category.DAIRY, quantity: '200g', expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Wrap tightly and store in the refrigerator.' },
    { id: '17', name: 'Black Beans', category: Category.PANTRY, quantity: '2 cans', expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Store in a cool, dry pantry.' },
    { id: '18', name: 'Onions', category: Category.PRODUCE, quantity: '1kg', expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Store in a cool, dark, and well-ventilated place.' },
    { id: '19', name: 'Tomatoes', category: Category.PRODUCE, quantity: '6', expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Store at room temperature away from direct sunlight.' },
    { id: '20', name: 'Quinoa', category: Category.PANTRY, quantity: '500g', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Store in an airtight container in a cool, dry place.' },
    { id: '21', name: 'Soy Sauce', category: Category.PANTRY, quantity: '1 bottle', expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Store in a cool, dark place. Refrigerate after opening for best quality.' },
    { id: '22', name: 'Bell Peppers', category: Category.PRODUCE, quantity: '3', expiryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedDate: new Date().toISOString(), storageTip: 'Store in the refrigerator crisper drawer.' },
  ];
};

const loadSavedRecipes = (): Recipe[] => {
  const saved = localStorage.getItem('freshKeepSavedRecipes');
  if (saved) return JSON.parse(saved);
  return [];
};


export default function App() {
  const [inventory, setInventory] = useState<FoodItem[]>(loadInitialData);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(loadSavedRecipes);
  const [notifications, setNotifications] = useState<Alert[]>([]);
  // New state for tracking read alerts
  const [readAlertIds, setReadAlertIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('freshKeepReadAlerts');
    return saved ? JSON.parse(saved) : [];
  });
  // State for item deletion confirmation
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const [toasts, setToasts] = useState<Alert[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'recipes' | 'saved'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dietaryPreference, setDietaryPreference] = useState('none');

  // Persist inventory to local storage and update notifications
  useEffect(() => {
    localStorage.setItem('freshKeepInventory', JSON.stringify(inventory));
    
    // Generate notifications logic
    const newNotifications: Alert[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    inventory.forEach(item => {
      const expiry = new Date(item.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let alertId = '';
      let alertMessage = '';
      let alertType: AlertType = 'info';

      if (diffDays < 0) {
        alertId = `alert-${item.id}-expired`;
        alertMessage = `${item.name} has expired! Please dispose of it.`;
        alertType = 'danger';
      } else if (diffDays <= 2) {
        alertId = `alert-${item.id}-soon`;
        alertMessage = `${item.name} expires ${diffDays === 0 ? 'today' : 'in ' + diffDays + ' days'}.`;
        alertType = 'warning';
      }

      if (alertId) {
        newNotifications.push({
          id: alertId,
          message: alertMessage,
          type: alertType,
          date: new Date().toISOString()
        });
      }
    });

    // Filter out read alerts
    const unreadNotifications = newNotifications.filter(alert => !readAlertIds.includes(alert.id));
    setNotifications(unreadNotifications);

  }, [inventory, readAlertIds]);

  // Persist saved recipes to local storage
  useEffect(() => {
    localStorage.setItem('freshKeepSavedRecipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);
  
  // Persist read alerts to local storage
  useEffect(() => {
    localStorage.setItem('freshKeepReadAlerts', JSON.stringify(readAlertIds));
  }, [readAlertIds]);

  const addToast = (message: string, type: AlertType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type, date: new Date().toISOString() }]);
    
    // Auto dismiss
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleAddItem = (newItem: Omit<FoodItem, 'id' | 'addedDate'>) => {
    const item: FoodItem = {
      ...newItem,
      id: Date.now().toString(),
      addedDate: new Date().toISOString(),
    };
    setInventory(prev => [...prev, item]);
    addToast(`Added ${item.name} to pantry`, 'success');
  };

  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setInventory(prev => prev.filter(item => item.id !== itemToDelete));
      addToast('Item removed from pantry', 'info');
      setItemToDelete(null);
    }
  };

  const handleGenerateRecipes = async () => {
    setActiveTab('recipes');
    setLoadingRecipes(true);
    setRecipes([]); // Clear old ones
    try {
      const generated = await generateRecipesFromIngredients(inventory, dietaryPreference);
      setRecipes(generated);
      addToast(`Generated ${generated.length} new recipes!`, 'success');
    } catch (e) {
      console.error(e);
      addToast('Failed to generate recipes. Try again.', 'danger');
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handleShuffleRecipes = () => {
    if (recipes.length === 0) return;
    setRecipes(prev => {
      const shuffled = [...prev];
      // Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    addToast('Recipes shuffled', 'info');
  };

  const handleToggleSaveRecipe = (recipeToToggle: Recipe) => {
    const isSaved = savedRecipes.some(r => r.id === recipeToToggle.id);
    if (isSaved) {
      setSavedRecipes(prev => prev.filter(r => r.id !== recipeToToggle.id));
      addToast('Recipe removed from saved', 'info');
    } else {
      setSavedRecipes(prev => [...prev, recipeToToggle]);
      addToast('Recipe saved!', 'success');
    }
  };
  
  const handleUnsaveRecipe = (recipeId: string) => {
    setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
    addToast('Recipe removed from saved', 'info');
  };

  const handleMarkAsRead = (id: string) => {
    setReadAlertIds(prev => [...prev, id]);
    // Notification state update will be handled by the useEffect
  };

  const handleMarkAllAsRead = () => {
    const ids = notifications.map(n => n.id);
    setReadAlertIds(prev => [...prev, ...ids]);
  };

  const filteredAndSortedInventory = useMemo(() => {
    return inventory
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [inventory, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 relative" onClick={() => isNotificationOpen && setIsNotificationOpen(false)}>
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
             <AlertBanner 
               alert={toast} 
               onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
             />
          </div>
        ))}
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 sm:px-6 py-4" onClick={e => e.stopPropagation()}>
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
              <LeafIcon className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
              FreshKeep
            </span>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex bg-stone-100/80 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('inventory')}
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-all ${activeTab === 'inventory' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Pantry
              </button>
               <button 
                onClick={() => setActiveTab('recipes')}
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-all ${activeTab === 'recipes' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Recipes
              </button>
              <button 
                onClick={() => setActiveTab('saved')}
                className={`relative text-sm font-medium px-3 py-1.5 rounded-md transition-all ${activeTab === 'saved' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Saved
                {savedRecipes.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-white text-[10px] font-bold">
                    {savedRecipes.length}
                  </span>
                )}
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`p-2 rounded-full transition-colors relative ${isNotificationOpen ? 'bg-teal-100 text-teal-700' : 'hover:bg-stone-100 text-stone-500'}`}
              >
                <BellIcon className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </button>
              <NotificationPanel 
                isOpen={isNotificationOpen} 
                notifications={notifications} 
                onClose={() => setIsNotificationOpen(false)}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="animate-fade-in">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
               <div>
                 <h1 className="text-3xl font-bold text-stone-900">My Pantry</h1>
                 <p className="text-stone-500 mt-1">Track ingredients and reduce waste</p>
               </div>
               <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleGenerateRecipes}
                    disabled={inventory.length === 0}
                    className="flex-1 sm:flex-none items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium shadow-lg shadow-amber-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center active:scale-95"
                  >
                    <ChefHatIcon className="w-4 h-4" />
                    Get Recipes
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 sm:flex-none items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium shadow-lg shadow-teal-200 transition-all flex justify-center active:scale-95"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Item
                  </button>
               </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search pantry items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all shadow-sm"
                    aria-label="Search pantry items"
                  />
                </div>
                
                <div className="relative min-w-[200px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FilterIcon className="w-4 h-4 text-stone-400" />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all shadow-sm appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="All">All Categories</option>
                    {Object.values(Category).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
             </div>

             {inventory.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
                 <div className="bg-stone-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <LeafIcon className="w-8 h-8 text-stone-400" />
                 </div>
                 <h3 className="text-lg font-medium text-stone-900">Your pantry is empty</h3>
                 <p className="text-stone-500 max-w-xs mx-auto mt-2">Add items to start tracking expiry dates and get personalized recipe suggestions.</p>
                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-6 text-teal-600 font-medium hover:underline"
                  >
                    Add your first item
                 </button>
               </div>
             ) : filteredAndSortedInventory.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
                  <div className="bg-stone-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SearchIcon className="w-8 h-8 text-stone-400" />
                  </div>
                  <h3 className="text-lg font-medium text-stone-900">No items found</h3>
                  <p className="text-stone-500 max-w-xs mx-auto mt-2">
                    {searchQuery 
                      ? `Your search for "${searchQuery}" did not match any items.` 
                      : `No items found in the "${selectedCategory}" category.`}
                  </p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                    className="mt-6 text-teal-600 font-medium hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredAndSortedInventory.map(item => (
                   <FoodCard key={item.id} item={item} onDelete={handleDeleteItem} />
                 ))}
               </div>
             )}
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="animate-fade-in">
             <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
               <div>
                 <h1 className="text-3xl font-bold text-stone-900">Smart Recipes</h1>
                 <p className="text-stone-500 mt-1">Curated based on your expiring ingredients</p>
               </div>
                <div className="flex items-center gap-3">
                  <select 
                    id="dietary-pref"
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value)}
                    className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                    aria-label="Dietary Preference"
                  >
                    <option value="none">No Preference</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten-Free</option>
                  </select>
                  
                  {recipes.length > 1 && (
                     <button
                      onClick={handleShuffleRecipes}
                      className="p-2 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Shuffle Recipes"
                    >
                      <ShuffleIcon className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    onClick={handleGenerateRecipes}
                    className="text-amber-600 font-medium hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    Regenerate
                  </button>
                </div>
             </div>

             {loadingRecipes ? (
               <div className="flex flex-col items-center justify-center py-20">
                 <LoaderIcon className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                 <h3 className="text-lg font-medium text-stone-900">Thinking...</h3>
                 <p className="text-stone-500">Analyzing your pantry for the best meals.</p>
               </div>
             ) : recipes.length > 0 ? (
               <div className="space-y-8">
                 {recipes.map((recipe) => {
                   const isSaved = savedRecipes.some(r => r.id === recipe.id);
                   return (
                     <div key={recipe.id} className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-100">
                        <button
                          onClick={() => handleToggleSaveRecipe(recipe)}
                          className={`absolute top-4 right-4 p-2 rounded-full bg-stone-50 hover:bg-stone-100 transition-all ${isSaved ? 'text-amber-500' : 'text-stone-500 hover:text-amber-500'}`}
                          aria-label={isSaved ? 'Unsave Recipe' : 'Save Recipe'}
                        >
                          <BookmarkIcon className="w-5 h-5" filled={isSaved} />
                        </button>
                        <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between mb-6">
                          <div>
                            <h2 className="text-2xl font-bold text-stone-800 mb-2">{recipe.title}</h2>
                            <p className="text-stone-600 leading-relaxed">{recipe.description}</p>
                            <div className="flex gap-4 mt-4 text-sm text-stone-500 font-medium">
                               <span className="bg-stone-100 px-3 py-1 rounded-full flex items-center gap-1">
                                 <span className="text-stone-400">🕒</span> {recipe.prepTime}
                               </span>
                               <span className="bg-stone-100 px-3 py-1 rounded-full flex items-center gap-1">
                                 <span className="text-stone-400">🔥</span> {recipe.calories} kcal
                               </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                          <div className="md:col-span-1 bg-stone-50 p-5 rounded-xl h-fit border border-stone-100">
                            <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                              Ingredients
                            </h3>
                            <ul className="space-y-2 text-sm">
                              {recipe.ingredients.map((ing, i) => (
                                <li key={i} className="flex justify-between border-b border-stone-200 pb-1 last:border-0">
                                  <span className="text-stone-700">{ing.name}</span>
                                  <span className="text-stone-400">{ing.amount}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="md:col-span-2">
                             <h3 className="font-semibold text-stone-900 mb-3">Instructions</h3>
                             <ol className="space-y-4">
                               {recipe.instructions.map((step, i) => (
                                 <li key={i} className="flex gap-4">
                                   <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold mt-0.5">
                                     {i + 1}
                                   </span>
                                   <p className="text-stone-600 leading-relaxed">{step}</p>
                                 </li>
                               ))}
                             </ol>
                          </div>
                        </div>
                     </div>
                   );
                 })}
               </div>
             ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
                  <div className="bg-stone-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChefHatIcon className="w-8 h-8 text-stone-400" />
                  </div>
                  <h3 className="text-lg font-medium text-stone-900">No recipes yet</h3>
                  <p className="text-stone-500 max-w-xs mx-auto mt-2">
                    Go to your pantry and click "Get Recipes" to generate ideas based on your ingredients.
                  </p>
                  <button 
                    onClick={() => setActiveTab('inventory')}
                    className="mt-6 text-amber-600 font-medium hover:underline"
                  >
                    Go to Pantry
                  </button>
                </div>
             )}
          </div>
        )}

        {/* Saved Recipes Tab */}
        {activeTab === 'saved' && (
          <div className="animate-fade-in">
              <div className="mb-6">
                  <h1 className="text-3xl font-bold text-stone-900">My Saved Recipes</h1>
                  <p className="text-stone-500 mt-1">Your personal collection of favorite meal ideas</p>
              </div>

              {savedRecipes.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
                      <div className="bg-stone-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookmarkIcon className="w-8 h-8 text-stone-400" />
                      </div>
                      <h3 className="text-lg font-medium text-stone-900">No saved recipes</h3>
                      <p className="text-stone-500 max-w-xs mx-auto mt-2">
                          Discover recipes in the 'Recipes' tab and save your favorites here.
                      </p>
                      <button 
                          onClick={() => setActiveTab('recipes')}
                          className="mt-6 text-amber-600 font-medium hover:underline"
                      >
                          Find Recipes
                      </button>
                  </div>
              ) : (
                  <div className="space-y-8">
                      {savedRecipes.map((recipe) => (
                         <div key={recipe.id} className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-100">
                            <button
                              onClick={() => handleUnsaveRecipe(recipe.id)}
                              className="absolute top-4 right-4 p-2 rounded-full bg-stone-50 hover:bg-red-50 text-stone-500 hover:text-red-600 transition-all"
                              aria-label="Remove saved recipe"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                           
                            <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between mb-6">
                              <div>
                                <h2 className="text-2xl font-bold text-stone-800 mb-2">{recipe.title}</h2>
                                <p className="text-stone-600 leading-relaxed">{recipe.description}</p>
                                <div className="flex gap-4 mt-4 text-sm text-stone-500 font-medium">
                                   <span className="bg-stone-100 px-3 py-1 rounded-full flex items-center gap-1">
                                     <span className="text-stone-400">🕒</span> {recipe.prepTime}
                                   </span>
                                   <span className="bg-stone-100 px-3 py-1 rounded-full flex items-center gap-1">
                                     <span className="text-stone-400">🔥</span> {recipe.calories} kcal
                                   </span>
                                </div>
                              </div>
                            </div>
      
                            <div className="grid md:grid-cols-3 gap-8">
                              <div className="md:col-span-1 bg-stone-50 p-5 rounded-xl h-fit border border-stone-100">
                                <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                                  Ingredients
                                </h3>
                                <ul className="space-y-2 text-sm">
                                  {recipe.ingredients.map((ing, i) => (
                                    <li key={i} className="flex justify-between border-b border-stone-200 pb-1 last:border-0">
                                      <span className="text-stone-700">{ing.name}</span>
                                      <span className="text-stone-400">{ing.amount}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
      
                              <div className="md:col-span-2">
                                 <h3 className="font-semibold text-stone-900 mb-3">Instructions</h3>
                                 <ol className="space-y-4">
                                   {recipe.instructions.map((step, i) => (
                                     <li key={i} className="flex gap-4">
                                       <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold mt-0.5">
                                         {i + 1}
                                       </span>
                                       <p className="text-stone-600 leading-relaxed">{step}</p>
                                     </li>
                                   ))}
                                 </ol>
                              </div>
                            </div>
                         </div>
                      ))}
                  </div>
              )}
          </div>
        )}
      </main>

      <AddFoodModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddItem} 
      />

      <ConfirmationModal 
        isOpen={!!itemToDelete}
        title="Remove Item"
        message={`Are you sure you want to remove "${inventory.find(i => i.id === itemToDelete)?.name || 'this item'}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />

      <ChefChat inventory={inventory} />
    </div>
  );
}
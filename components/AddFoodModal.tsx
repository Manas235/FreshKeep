import React, { useState, useEffect } from 'react';
import { Category, FoodItem } from '../types';
import { PlusIcon, XIcon, CalendarIcon } from './Icons';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<FoodItem, 'id' | 'addedDate'>) => void;
}

const AddFoodModal: React.FC<AddFoodModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<Category>(Category.PRODUCE);
  const [expiryDate, setExpiryDate] = useState('');

  const setDateFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setExpiryDate(date.toISOString().split('T')[0]);
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setQuantity('');
      setExpiryDate('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, quantity, category, expiryDate });
    setName('');
    setQuantity('');
    setExpiryDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="bg-teal-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Add to Pantry</h2>
            <p className="text-teal-100 text-sm mt-1">Track ingredients to reduce waste.</p>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Item Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Fresh Spinach"
                className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Quantity</label>
                <input
                  type="text"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g., 200g"
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                >
                  {Object.values(Category).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-stone-700 mb-1">Expiry Date</label>
              <div className="relative">
                <input
                  id="expiryDate"
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <CalendarIcon className="w-5 h-5 text-stone-400" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button type="button" onClick={() => setDateFromNow(3)} className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-full transition-colors">3 Days</button>
                <button type="button" onClick={() => setDateFromNow(7)} className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-full transition-colors">1 Week</button>
                <button type="button" onClick={() => setDateFromNow(14)} className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-full transition-colors">2 Weeks</button>
                <button type="button" onClick={() => setDateFromNow(30)} className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-full transition-colors">1 Month</button>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-4 h-4" /> Add Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFoodModal;
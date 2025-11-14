import React from 'react';
import { FoodItem, Category } from '../types';
import { TrashIcon, AlertTriangleIcon } from './Icons';

interface FoodCardProps {
  item: FoodItem;
  onDelete: (id: string) => void;
}

const getCategoryStyles = (category: Category) => {
  switch (category) {
    case Category.PRODUCE:
      return 'bg-green-100 text-green-800';
    case Category.DAIRY:
      return 'bg-blue-100 text-blue-800';
    case Category.MEAT:
      return 'bg-red-100 text-red-800';
    case Category.PANTRY:
      return 'bg-amber-100 text-amber-800';
    case Category.BEVERAGE:
      return 'bg-cyan-100 text-cyan-800';
    case Category.OTHER:
    default:
      return 'bg-stone-100 text-stone-800';
  }
};

const FoodCard: React.FC<FoodCardProps> = ({ item, onDelete }) => {
  const getExpiryStatus = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(dateStr);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: 'bg-red-100 text-red-700 border-red-200', label: 'Expired', urgent: true };
    if (diffDays === 0) return { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Expires Today', urgent: true };
    if (diffDays <= 3) return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: `Expires in ${diffDays} days`, urgent: true };
    return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: `Expires in ${diffDays} days`, urgent: false };
  };

  const status = getExpiryStatus(item.expiryDate);
  const categoryStyles = getCategoryStyles(item.category);

  return (
    <div className={`relative group bg-white rounded-xl p-4 shadow-sm border transition-all hover:shadow-md ${status.urgent ? 'border-red-100 ring-1 ring-red-50' : 'border-stone-100'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className={`text-xs font-bold tracking-wider uppercase mb-2 block px-2 py-1 rounded-full w-fit ${categoryStyles}`}>{item.category}</span>
          <h3 className="font-bold text-stone-800 text-lg leading-tight">{item.name}</h3>
          <p className="text-sm text-stone-500 mt-1">{item.quantity}</p>
        </div>
        <button 
          onClick={() => onDelete(item.id)}
          className="text-stone-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
          aria-label="Delete item"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mt-3 text-xs font-medium w-fit ${status.color}`}>
        {status.urgent && <AlertTriangleIcon className="w-3 h-3" />}
        {status.label}
      </div>
    </div>
  );
};

export default FoodCard;
import React, { useState, useEffect, useRef } from 'react';
import { Category, FoodItem } from '../types';
import { PlusIcon, XIcon, CalendarIcon, InfoIcon, LoaderIcon, ScanLineIcon, CameraIcon } from './Icons';
import { getStorageTip, identifyFoodFromImage } from '../services/geminiService';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<FoodItem, 'id' | 'addedDate'>) => void;
}

type ModalMode = 'form' | 'scan' | 'camera';

const AddFoodModal: React.FC<AddFoodModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<Category>(Category.PRODUCE);
  const [expiryDate, setExpiryDate] = useState('');
  const [storageTip, setStorageTip] = useState<string | null>(null);
  const [isFetchingTip, setIsFetchingTip] = useState(false);
  const [mode, setMode] = useState<ModalMode>('form');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const debounceTimeout = useRef<number | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const setDateFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setExpiryDate(date.toISOString().split('T')[0]);
  };

  // Debounced effect for fetching storage tip
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    setStorageTip(null);

    if (name.trim().length > 2) {
      setIsFetchingTip(true);
      debounceTimeout.current = window.setTimeout(async () => {
        const tip = await getStorageTip(name);
        if (tip) {
          setStorageTip(tip);
        }
        setIsFetchingTip(false);
      }, 700); // 700ms debounce
    } else {
      setIsFetchingTip(false);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [name]);
  
  // Effect to manage QR code scanner
  useEffect(() => {
    if (mode === 'scan' && isOpen) {
        const scanner = new Html5QrcodeScanner(
            'qr-reader', 
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );
        scannerRef.current = scanner;

        const onScanSuccess = (decodedText: string) => {
            setName(decodedText);
            setMode('form');
        };

        const onScanFailure = () => { /* Ignore failure */ };

        scanner.render(onScanSuccess, onScanFailure);
    } else {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(error => {
                console.error("Failed to clear html5-qrcode scanner.", error);
            });
            scannerRef.current = null;
        }
    }
  }, [mode, isOpen]);

  // Effect to manage Camera
  useEffect(() => {
      const startCamera = async () => {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ 
                  video: { facingMode: 'environment' } 
              });
              streamRef.current = stream;
              if (videoRef.current) {
                  videoRef.current.srcObject = stream;
              }
          } catch (err) {
              console.error("Error accessing camera:", err);
              alert("Could not access camera. Please ensure you have granted permissions.");
              setMode('form');
          }
      };

      if (mode === 'camera' && isOpen) {
          startCamera();
      } else {
          // Cleanup stream
          if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
          }
      }

      return () => {
          if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
          }
      };
  }, [mode, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setQuantity('');
      setExpiryDate('');
      setStorageTip(null);
      setIsFetchingTip(false);
      setMode('form');
      setIsAnalyzing(false);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, quantity, category, expiryDate, storageTip: storageTip ?? undefined });
    onClose();
  };
  
  const captureImage = async () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          
          if (context) {
              // Set canvas dimensions to match video
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              
              // Draw the video frame to canvas
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // Convert to base64
              const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
              
              // Switch UI to analyzing state
              setIsAnalyzing(true);
              
              // Stop camera stream immediately to freeze frame effect
              if (streamRef.current) {
                  streamRef.current.getTracks().forEach(track => track.stop());
                  streamRef.current = null;
              }

              try {
                  const result = await identifyFoodFromImage(imageBase64);
                  if (result) {
                      setName(result.name);
                      setQuantity(result.quantity);
                      setCategory(result.category as Category);
                      setExpiryDate(result.expiryDate);
                      setMode('form');
                  } else {
                      alert("Could not identify the food item. Please try again.");
                      setMode('form');
                  }
              } catch (error) {
                  console.error("Identification failed", error);
                  alert("Failed to identify item.");
                  setMode('form');
              } finally {
                  setIsAnalyzing(false);
              }
          }
      }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="bg-teal-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white">
                {mode === 'scan' ? 'Scan Barcode' : mode === 'camera' ? 'Capture Food' : 'Add to Pantry'}
            </h2>
            <p className="text-white text-sm mt-1">
                {mode === 'scan' ? 'Point camera at a barcode.' : 
                 mode === 'camera' ? 'Take a photo to identify the item.' : 
                 'Track ingredients to reduce waste.'}
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:text-teal-100">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        {mode === 'scan' ? (
            <div className="p-6">
                <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>
                <button
                    type="button"
                    onClick={() => setMode('form')}
                    className="w-full mt-4 flex-1 px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100 font-medium transition-colors"
                >
                    Cancel Scan
                </button>
            </div>
        ) : mode === 'camera' ? (
            <div className="p-0 relative bg-black flex flex-col items-center justify-center h-96">
                 {isAnalyzing && (
                     <div className="absolute inset-0 z-20 bg-black/70 flex flex-col items-center justify-center text-white">
                         <LoaderIcon className="w-10 h-10 animate-spin mb-3 text-teal-400" />
                         <p className="font-medium">Identifying food...</p>
                     </div>
                 )}
                 <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                 />
                 <canvas ref={canvasRef} className="hidden" />
                 
                 <div className="absolute bottom-6 w-full flex justify-around items-center px-6 z-10">
                     <button
                        type="button"
                        onClick={() => setMode('form')}
                        className="text-white hover:text-white/90 font-medium"
                     >
                        Cancel
                     </button>
                     <button
                        type="button"
                        onClick={captureImage}
                        disabled={isAnalyzing}
                        className="w-16 h-16 rounded-full border-4 border-white bg-teal-500 hover:bg-teal-400 transition-colors shadow-lg"
                        aria-label="Capture Photo"
                     ></button>
                     <div className="w-10"></div> {/* Spacer for centering */}
                 </div>
            </div>
        ) : (
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Item Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Fresh Spinach"
                    className="w-full pl-4 pr-24 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 pr-1 flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={() => setMode('scan')}
                        className="p-2 text-stone-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                        title="Scan Barcode"
                      >
                        <ScanLineIcon className="w-5 h-5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setMode('camera')}
                        className="p-2 text-stone-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                        title="Identify with Camera"
                      >
                        <CameraIcon className="w-5 h-5" />
                      </button>
                  </div>
                </div>
                {isFetchingTip && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-stone-500">
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                    <span>Getting storage tip...</span>
                  </div>
                )}
                {storageTip && !isFetchingTip && (
                  <div className="mt-2 p-3 bg-teal-50 border border-teal-100 rounded-lg flex items-start gap-2.5 animate-fade-in">
                    <InfoIcon className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-teal-800">{storageTip}</p>
                  </div>
                )}
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
        )}
      </div>
    </div>
  );
};

export default AddFoodModal;
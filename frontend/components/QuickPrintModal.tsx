import React, { useState } from 'react';
import { X, Copy, Printer } from 'lucide-react';

interface QuickPrintModalProps {
  open: boolean;
  onClose: () => void;
  type: 'photocopy' | 'printing';
  pricePerPage: number;
  currency: string;
  onConfirm: (quantity: number, pages: number, total: number, type: 'photocopy' | 'printing') => void;
}

const QuickPrintModal: React.FC<QuickPrintModalProps> = ({
  open,
  onClose,
  type,
  pricePerPage,
  currency,
  onConfirm
}) => {
  const [quantity, setQuantity] = useState(1);
  const [pagesPerCopy, setPagesPerCopy] = useState(1);

  const total = quantity * pagesPerCopy * pricePerPage;

  const handleConfirm = () => {
    onConfirm(quantity, pagesPerCopy, total, type);
    setQuantity(1);
    setPagesPerCopy(1);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${type === 'photocopy' ? 'bg-slate-100' : 'bg-blue-100'}`}>
              {type === 'photocopy' ? (
                <Copy className="w-5 h-5 text-slate-600" />
              ) : (
                <Printer className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {type === 'photocopy' ? 'Quick Photocopy' : 'Type & Printing'}
              </h2>
              <p className="text-xs text-slate-500">
                {currency}{pricePerPage} per page
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Number of Copies
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Pages per Copy
            </label>
            <input
              type="number"
              min={1}
              value={pagesPerCopy}
              onChange={(e) => setPagesPerCopy(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Pages:</span>
              <span className="font-bold text-slate-800">{quantity * pagesPerCopy}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-700">Total:</span>
              <span className="font-bold text-emerald-600 text-xl">
                {currency}{total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-emerald-500 text-white font-semibold text-sm rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickPrintModal;
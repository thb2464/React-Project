// apps/web/src/components/shared/CustomizeModal.tsx
import React, { useState } from 'react';
import '../../styles/CustomizeModal.css';
import { MenuItemType } from '../../types';

interface CustomizeModalProps {
  item: MenuItemType;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItemType & { quantity: number }) => void;
}

export default function CustomizeModal({ item, isOpen, onClose, onAddToCart }: CustomizeModalProps) {
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [spiceLevel, setSpiceLevel] = useState<'mild' | 'medium' | 'hot' | 'extra-hot'>('medium');
  const [instructions, setInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  // Mock options
const basePrice = item.originalPrice ?? item.discountedPrice;

const sizeOptions = [
  { label: 'Small', price: basePrice * 0.8, value: 'small' },
  { label: 'Medium', price: basePrice, value: 'medium' },
  { label: 'Large', price: basePrice * 1.2, value: 'large' },
];

const addonOptions = [
  { label: 'Extra Cheese', price: 5000, value: 'extra-cheese' },
  { label: 'Avocado', price: 5000, value: 'avocado' },
  { label: 'Bacon', price: 10000, value: 'bacon' },
];

  const sizePrice = sizeOptions.find(s => s.value === selectedSize)?.price || item.originalPrice;
  const addonsPrice = selectedAddons.reduce((sum, a) => sum + (addonOptions.find(o => o.value === a)?.price || 0), 0);
  const totalPrice = (sizePrice + addonsPrice) * quantity;

  const handleAddToCart = () => {
    const customizedItem = {
      ...item,
      discountedPrice: totalPrice / quantity,
      name: `${item.name} (${selectedSize}, +${selectedAddons.length} add-ons)`,
    };
    onAddToCart({ ...customizedItem, quantity });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close">×</button>

        <img src={item.image} alt={item.name} className="modal-image" />
        <h2>{item.name}</h2>
        <p className="modal-price">
          Giá gốc: {basePrice.toLocaleString('vi-VN')}₫
        </p>
        <p className="modal-desc">{item.description}</p>

        {/* Size */}
        <h3>Size</h3>
        <div className="options">
          {sizeOptions.map(opt => (
            <label key={opt.value}>
              <input
                type="radio"
                name="size"
                value={opt.value}
                checked={selectedSize === opt.value}
                onChange={(e) => setSelectedSize(e.target.value as 'small' | 'medium' | 'large')}
              />
              {opt.label} ({opt.price.toLocaleString('vi-VN')}₫)
            </label>
          ))}
        </div>

        {/* Add-ons */}
        <h3>Thêm topping</h3>
        <div className="options">
          {addonOptions.map(opt => (
            <label key={opt.value}>
              <input
                type="checkbox"
                checked={selectedAddons.includes(opt.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedAddons([...selectedAddons, opt.value]);
                  } else {
                    setSelectedAddons(selectedAddons.filter(a => a !== opt.value));
                  }
                }}
              />
              {opt.label} (+{opt.price.toLocaleString('vi-VN')}₫)
            </label>
          ))}
        </div>

        {/* Spice */}
        <h3>Độ cay</h3>
        <div className="spice-options">
          {['mild', 'medium', 'hot', 'extra-hot'].map(level => (
            <button
              key={level}
              className={spiceLevel === level ? 'selected' : ''}
              onClick={() => setSpiceLevel(level as 'mild' | 'medium' | 'hot' | 'extra-hot')}
            >
              {level.toUpperCase()}
            </button>
          ))}
        </div>

        <h3>Ghi chú</h3>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Không hành, thêm ớt..."
        />

        <div className="modal-footer">
          <div className="quantity">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          <button onClick={handleAddToCart}>
            Thêm {totalPrice.toLocaleString('vi-VN')}₫
          </button>
        </div>
      </div>
    </div>
  );
}
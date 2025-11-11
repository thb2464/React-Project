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
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <img src={item.image} alt={item.name} className="modal-image" />
          <div>
            <h2>{item.name}</h2>
            <p className="modal-desc">{item.description}</p>
            <div className="modal-rating">
              {item.rating} ⭐ {item.time} · {item.calories} cal
            </div>
          </div>
        </div>

        <div className="modal-body">
          {/* Size */}
          <section>
            <h3>Size</h3>
            <div className="options-group">
              {sizeOptions.map(opt => (
                <label key={opt.value} className={`option-radio ${selectedSize === opt.value ? 'selected' : ''}`}>
                  <input
                     type="radio"
                    name="size"
                    value={opt.value}
                    checked={selectedSize === opt.value}
                    onChange={(e) => setSelectedSize(e.target.value as any)}
                  />
                  <span>
                    {opt.label}{' '}
                    {opt.price !== basePrice && (
                  <span className="price-diff">
                    ({opt.price > basePrice ? '+' : ''}{Math.round(opt.price - basePrice).toLocaleString('vi-VN')}đ)
                  </span>
                )}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Add-ons */}
          <section>
            <h3>Add-ons</h3>
            <div className="options-group">
              {addonOptions.map(opt => (
                <label key={opt.value} className="option-checkbox">
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={selectedAddons.includes(opt.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAddons([...selectedAddons, opt.value]);
                      } else {
                        setSelectedAddons(selectedAddons.filter(a => a !== opt.value));
                      }
                    }}
                  />
                  <span>{opt.label} (+{opt.price.toLocaleString('vi-VN')}₫)</span>
                </label>
              ))}
            </div>
          </section>

          {/* Spice Level */}
          <section>
            <h3>Spice Level</h3>
            <div className="spice-level">
              {(['mild', 'medium', 'hot', 'extra-hot'] as const).map(level => (
                <button
                  key={level}
                  className={`spice-btn ${spiceLevel === level ? 'selected' : ''}`}
                  onClick={() => setSpiceLevel(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </section>

          {/* Special Instructions */}
          <section>
            <h3>Special Instructions</h3>
            <textarea
              placeholder="Any special requests or allergies?"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
            />
          </section>
        </div>

        <div className="modal-footer">
          <div className="quantity">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart · {totalPrice.toLocaleString('vi-VN')}₫
          </button>
        </div>
      </div>
    </div>
  );
}
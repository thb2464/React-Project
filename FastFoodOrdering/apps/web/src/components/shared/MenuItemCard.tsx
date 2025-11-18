// apps/web/src/components/shared/MenuItemCard.tsx
import React, { useState } from 'react';
import '../../styles/MenuItemCard.css';
import { MenuItemType } from '../../types';
import CustomizeModal from './CustomizeModal';
import { useAppState } from '../../hooks/useAppState';

interface MenuItemCardProps {
  item: MenuItemType;
}

function MenuItemCard({ item }: MenuItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useAppState();

  const handleAddToCart = (customizedItem: MenuItemType & { quantity: number }) => {
    addToCart(customizedItem);
  };

  return (
    <>
      <div className="item-card">
        {item.isPopular && <span className="popular-tag">Popular</span>}
        <img
          src={item.image}
          alt={item.name}
          className="item-image"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found';
          }}
        />
        <span className="favorite">♡</span>
        <div className="item-details">
          <h3>{item.name}</h3>
          <p className="price">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.discountedPrice)}
          </p>
          <p className="description">{item.description}</p>
          <div className="item-info">
            <span>Star {item.rating}</span>
            <span>{item.time}</span>
            <span>{item.calories} cal</span>
          </div>
          <div className="tags">
            {item.tags.map((tag) => (
              <span key={tag} className={`tag ${tag.toLowerCase().replace(/ /g, '-')}`}>
                {tag}
              </span>
            ))}
          </div>
          <div className="button-group">
            <button className="customize" onClick={() => setIsModalOpen(true)}>
              Customize
            </button>
            <button className="add" onClick={() => addToCart({ ...item, quantity: 1 })}>
              +
            </button>
          </div>
        </div>
      </div>

      <CustomizeModal
        item={item}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}

export default MenuItemCard;
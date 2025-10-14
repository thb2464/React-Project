// apps/web/src/components/shared/MenuItemCard.tsx
import React from 'react'
import '../../styles/MenuItemCard.css'
import { MenuItemType } from '../../types'

interface MenuItemCardProps {
  item: MenuItemType
}

function MenuItemCard({ item }: MenuItemCardProps) {
  return (
    <div className="item-card">
      {item.isPopular && <span className="popular-tag">Popular</span>}
      <img 
        src={item.image} 
        alt={item.name} 
        className="item-image" 
        // Thêm ảnh dự phòng nếu ảnh chính bị lỗi
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found'; }}
      />
      <span className="favorite">♡</span>
      <div className="item-details">
        <h3>{item.name}</h3>
        {/* Chuyển đổi giá sang định dạng tiền tệ Việt Nam */}
        <p className="price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.discountedPrice)}</p>
        <p className="description">{item.description}</p>
        <div className="item-info">
          <span>⭐ {item.rating}</span>
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
        <button className="customize">Customize</button>
        <button className="add">+</button>
      </div>
    </div>
  )
}

export default MenuItemCard

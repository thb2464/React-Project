// apps/web/src/types/index.ts
export interface Category {
    icon: string
    name: string
  }
  
  export interface MenuItem {
    name: string
    price: number
    description: string
    rating: number
    time: string
    calories: number
    image: string
    tags: string[]
    isPopular?: boolean
  }
  
  // Add more types as needed
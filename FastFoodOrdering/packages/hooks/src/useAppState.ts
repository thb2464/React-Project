// apps/web/src/hooks/useAppState.ts
import { useState } from 'react'

export function useAppState() {
  const [cart, setCart] = useState<any[]>([]) // Replace any with proper type

  // Add more state as needed

  return { cart, addToCart: (item: any) => setCart([...cart, item]) }
}
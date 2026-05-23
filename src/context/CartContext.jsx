import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('stella_cart') || '[]')
    } catch {
      return []
    }
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('stella_cart', JSON.stringify(items))
  }, [items])

  function addItem(product, quantity = 1) {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id && i.type === product.type)
      if (existing) {
        return prev.map(i =>
          i.id === product.id && i.type === product.type
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { ...product, quantity }]
    })
    setIsOpen(true)
  }

  function removeItem(id, type) {
    setItems(prev => prev.filter(i => !(i.id === id && i.type === type)))
  }

  function updateQuantity(id, type, quantity) {
    if (quantity < 1) {
      removeItem(id, type)
      return
    }
    setItems(prev =>
      prev.map(i => (i.id === id && i.type === type ? { ...i, quantity } : i))
    )
  }

  function clearCart() {
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, total, count, isOpen, setIsOpen, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

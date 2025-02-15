"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

const POSContext = createContext()

export const usePOSContext = () => {
  const context = useContext(POSContext)
  if (!context) {
    throw new Error("usePOSContext must be used within a POSProvider")
  }
  return context
}

export const POSProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("New Transaction")
  const [time, setTime] = useState(new Date())
  const [cart, setCart] = useState([])
  const [transactionNo, setTransactionNo] = useState(1)
  const [globalDiscount, setGlobalDiscount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPrintReceipt, setShowPrintReceipt] = useState(false)
  const [currentReceipt, setCurrentReceipt] = useState(null)
  const [dailySales, setDailySales] = useState([])
  const [showSuccessMessage, setShowSuccessMessage] = useState({ visible: false, message: "" })
  const [cashierName, setCashierName] = useState("John Doe")
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const today = new Date().toDateString()
    const storedDate = localStorage.getItem("lastTransactionDate")
    if (storedDate !== today) {
      setTransactionNo(1)
      localStorage.setItem("lastTransactionDate", today)
    } else {
      const lastTransactionNo = Number.parseInt(localStorage.getItem("lastTransactionNo") || "1")
      setTransactionNo(lastTransactionNo)
    }
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/productlist/")
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }
        const data = await response.json()
        setProducts(data)
        setIsLoading(false)
      } catch (error) {
        setError(error.message)
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const addToCart = useCallback(
    (product) => {
      const existingItem = cart.find((item) => item._id === product._id)
      if (existingItem) {
        setCart(
          cart.map((item) =>
            item._id === product._id ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.sellPrice } : item,
          ),
        )
      } else {
        setCart([...cart, { ...product, qty: 1, total: product.sellPrice, discount: 0 }])
      }
    },
    [cart],
  )

  const handleBarcodeSubmit = useCallback(
    (scannedBarcode) => {
      const product = products.find((p) => p.barcode === scannedBarcode)
      if (product) {
        addToCart(product)
        return true
      } else {
        return false
      }
    },
    [addToCart, products],
  )

  const clearCart = () => {
    setCart([])
    setGlobalDiscount(0)
  }

  const settlePayment = (paymentAmount, paymentType) => {
    const total = calculateTotal()
    if (paymentAmount >= total) {
      const change = paymentAmount - total
      const newSale = {
        transactionNo: transactionNo,
        date: new Date().toLocaleString(),
        subtotal: calculateSubtotal(),
        totalDiscount: calculateTotalDiscount(),
        vat: 0,
        total: total,
        paymentAmount: paymentAmount,
        change: change,
        paymentType: paymentType,
        items: cart,
      }
      setCurrentReceipt(newSale)
      setDailySales([...dailySales, newSale])
      setShowPrintReceipt(true)
      clearCart()
      setTransactionNo((prevNo) => {
        const newNo = prevNo + 1
        localStorage.setItem("lastTransactionNo", newNo.toString())
        return newNo
      })
      setShowSuccessMessage({ visible: true, message: "Payment processed successfully." })
      setTimeout(() => setShowSuccessMessage({ visible: false, message: "" }), 3000)
    } else {
      alert("Insufficient payment amount")
    }
    setShowPaymentModal(false)
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTotalDiscount = () => {
    return cart.reduce((sum, item) => sum + (item.discount || 0), 0) + globalDiscount
  }

  const calculateTotal = () => {
    return calculateSubtotal() - calculateTotalDiscount()
  }

  const updateCartItemQuantity = (id, newQty) => {
    const validQty = isNaN(newQty) || newQty < 1 ? 1 : Math.floor(newQty)
    setCart(cart.map((item) => (item._id === id ? { ...item, qty: validQty, total: validQty * item.sellPrice } : item)))
  }

  const updateCartItemDiscount = (id, newDiscount) => {
    const validDiscount = isNaN(newDiscount) || newDiscount < 0 ? 0 : Number(newDiscount)
    setCart(
      cart.map((item) =>
        item._id === id
          ? {
              ...item,
              discount: validDiscount,
            }
          : item,
      ),
    )
  }

  const removeCartItem = (id) => {
    setCart(cart.filter((item) => item._id !== id))
  }

  const updateGlobalDiscount = (newDiscount) => {
    setGlobalDiscount(newDiscount)
  }

  const value = {
    activeTab,
    setActiveTab,
    time,
    cart,
    setCart,
    transactionNo,
    globalDiscount,
    setGlobalDiscount,
    searchTerm,
    setSearchTerm,
    showPaymentModal,
    setShowPaymentModal,
    showPrintReceipt,
    setShowPrintReceipt,
    currentReceipt,
    setCurrentReceipt,
    dailySales,
    setDailySales,
    showSuccessMessage,
    setShowSuccessMessage,
    cashierName,
    setCashierName,
    products,
    isLoading,
    setIsLoading,
    error,
    setError,
    addToCart,
    handleBarcodeSubmit,
    clearCart,
    settlePayment,
    calculateSubtotal,
    calculateTotalDiscount,
    calculateTotal,
    updateCartItemQuantity,
    updateCartItemDiscount,
    removeCartItem,
    updateGlobalDiscount,
  }

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>
}


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
  const [transactionNo, setTransactionNo] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [showPrintReceipt, setShowPrintReceipt] = useState(false)
  const [currentReceipt, setCurrentReceipt] = useState(null)
  const [dailySales, setDailySales] = useState([])
  const [showSuccessMessage, setShowSuccessMessage] = useState({ visible: false, message: "", isError: false })
  const [cashierName, setCashierName] = useState("Cashier1")
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [customerName, setCustomerName] = useState("")
  const [customerNumber, setCustomerNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [errorMessage, setErrorMessage] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const generateTransactionNo = () => {
      const date = new Date()
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const day = date.getDate().toString().padStart(2, "0")
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")
      return Number.parseInt(`${year}${month}${day}${random}`, 10)
    }

    setTransactionNo(generateTransactionNo())
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

  const addToCart = useCallback((product) => {
    if (product.totalQuantity <= 0) {
      setErrorMessage(`${product.description} is out of stock.`)
      setTimeout(() => setErrorMessage(""), 3000)
      return false
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product._id)
      if (existingItem) {
        if (existingItem.quantity >= product.totalQuantity) {
          setErrorMessage(`Cannot add more ${product.description}. Stock limit reached.`)
          setTimeout(() => setErrorMessage(""), 3000)
          return prevCart
        }
        return prevCart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * product.sellPrice }
            : item,
        )
      } else {
        return [...prevCart, { productId: product._id, quantity: 1, totalPrice: product.sellPrice }]
      }
    })
    return true
  }, [])

  const handleBarcodeSubmit = useCallback(
    (scannedBarcode) => {
      const product = products.find((p) => p.barcode === scannedBarcode)
      if (product) {
        return addToCart(product)
      } else {
        return false
      }
    },
    [products, addToCart],
  )

  const clearCart = useCallback(() => {
    setCart([])
    setDiscount(0)
  }, [])

  const settlePayment = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:4000/api/sales/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionNo,
          products: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          discount,
          paymentMethod,
          customerName,
          customerNumber,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to process sale")
      }

      const data = await response.json()
      setCurrentReceipt(data.sale)
      setShowPrintReceipt(true)
      clearCart()
      setTransactionNo(Math.floor(100000 + Math.random() * 900000)) // Generate a new 6-digit transaction number
      setShowSuccessMessage({ visible: true, message: "Sale completed successfully." })
      setTimeout(() => setShowSuccessMessage({ visible: false, message: "" }), 3000)
    } catch (error) {
      setShowSuccessMessage({ visible: true, message: `Error: ${error.message}`, isError: true })
      setTimeout(() => setShowSuccessMessage({ visible: false, message: "", isError: false }), 3000)
    }
  }, [cart, transactionNo, discount, paymentMethod, customerName, customerNumber, clearCart])

  const calculateSubtotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0)
  }, [cart])

  const calculateTotal = useCallback(() => {
    return calculateSubtotal() - discount
  }, [calculateSubtotal, discount])

  const updateCartItemQuantity = useCallback(
    (id, newQty) => {
      const validQty = isNaN(newQty) || newQty < 1 ? 1 : Math.floor(newQty)
      setCart((prevCart) =>
        prevCart.map((item) => {
          if (item.productId === id) {
            const product = products.find((p) => p._id === id)
            return {
              ...item,
              quantity: validQty,
              totalPrice: validQty * (product ? product.sellPrice : 0),
            }
          }
          return item
        }),
      )
    },
    [products],
  )

  const removeCartItem = useCallback((id) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== id))
  }, [])

  const updateDiscount = useCallback((newDiscount) => {
    setDiscount(newDiscount)
  }, [])

  const refreshComponents = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1)
  }, [])

  const refreshProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:4000/api/productlist/")
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()
      setProducts(data)
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = {
    activeTab,
    setActiveTab,
    time,
    cart,
    setCart,
    transactionNo,
    discount,
    setDiscount,
    searchTerm,
    setSearchTerm,
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
    calculateTotal,
    updateCartItemQuantity,
    removeCartItem,
    updateDiscount,
    customerName,
    setCustomerName,
    customerNumber,
    setCustomerNumber,
    paymentMethod,
    setPaymentMethod,
    errorMessage,
    setErrorMessage,
    refreshComponents,
    refreshKey,
    refreshProducts,
    refreshTrigger,
  }

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>
}


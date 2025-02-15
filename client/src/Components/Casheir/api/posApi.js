const API_BASE_URL = "http://localhost:4000/api"

export const addToCart = async (cartData) => {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cartData),
  })
  return response.json()
}

export const getCart = async () => {
  const response = await fetch(`${API_BASE_URL}/cart`)
  return response.json()
}

export const clearCart = async () => {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: "DELETE",
  })
  return response.json()
}

export const createTransaction = async (transactionData) => {
  const response = await fetch(`${API_BASE_URL}/transaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transactionData),
  })
  return response.json()
}

export const getTransactions = async () => {
  const response = await fetch(`${API_BASE_URL}/transaction`)
  return response.json()
}


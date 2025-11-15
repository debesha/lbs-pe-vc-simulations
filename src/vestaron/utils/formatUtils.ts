export const formatCurrency = (value: number): string => {
  return value >= 0
    ? `$${Math.abs(value).toFixed(0)}`
    : `-$${Math.abs(value).toFixed(0)}`
}

export const formatCurrencyLarge = (value: number): string => {
  return `$${value.toFixed(1)}M`
}


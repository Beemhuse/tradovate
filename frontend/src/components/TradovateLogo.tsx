import React from 'react'

const TradovateLogo = ({className}: {className?: string}) => {
  return (
    <img src="/tradovate_logo.png" alt="tradovate_logo" className={`w-48 h-32 self-center ${className}`} /> 
  )
}

export default TradovateLogo
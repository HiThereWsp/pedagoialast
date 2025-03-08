
import { useEffect, useState } from "react"

const phrases = [
  "planifier",
  "différencier",
  "générer",
  "évaluer",
  "communiquer",
  "gagner du temps"
]

interface DynamicTextProps {
  items?: string[];
  interval?: number;
  className?: string;
}

export const DynamicText = ({ 
  items = phrases, 
  interval = 3000,
  className = "bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 text-transparent bg-clip-text"
}: DynamicTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
    }, interval)

    return () => clearInterval(intervalId)
  }, [items, interval])

  return (
    <span className={className}>
      {items[currentIndex]}
    </span>
  )
}

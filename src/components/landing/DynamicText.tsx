
import { useEffect, useState } from "react"

const phrases = [
  "planifier",
  "différencier",
  "générer",
  "évaluer"
]

export const DynamicText = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % phrases.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <span className="bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 text-transparent bg-clip-text">
      {phrases[currentIndex]}
    </span>
  )
}

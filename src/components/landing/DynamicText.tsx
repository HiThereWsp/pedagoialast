import { useEffect, useState } from "react"

const phrases = [
  "adapter vos cours",
  "préparer vos cours plus efficacement",
  "différencier vos exercices",
  "effectuer vos tâches administratives"
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
    <span className="block h-[1.5em] bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 text-transparent bg-clip-text transition-all duration-500">
      {phrases[currentIndex]}
    </span>
  )
}
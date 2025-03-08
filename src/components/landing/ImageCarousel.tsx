
import { useEffect, useState } from "react"

interface ImageCarouselProps {
  images: string[];
  interval?: number;
  className?: string;
  imageClassName?: string;
}

export const ImageCarousel = ({ 
  images, 
  interval = 4000,
  className = "w-full h-full rounded-lg overflow-hidden",
  imageClassName = "w-full h-full object-cover object-center transition-opacity duration-500"
}: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Déclencher l'animation de fade-out
      setFadeOut(true)
      
      // Après la transition de fade-out, changer l'image
      const timeout = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
        setFadeOut(false)
      }, 500) // Durée de la transition
      
      return () => clearTimeout(timeout)
    }, interval)

    return () => clearInterval(intervalId)
  }, [images, interval])

  return (
    <div className={className}>
      <img 
        src={images[currentIndex]} 
        alt={`Démonstration ${currentIndex + 1}`}
        className={`${imageClassName} ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  )
}

import React, { memo, useEffect, useState } from "react"

const images = [
  "https://img.freepik.com/free-psd/online-shopping-horizontal-banner-template_23-2148900158.jpg?t=st=1740647604~exp=1740651204~hmac=9a32cb144919e7f5b1f35ffef6dbd1e10e9da58cc8e0c419d4a00ffe5fc41b91&w=1800",
  "https://img.freepik.com/premium-vector/shopping-online-modern-marketing-mobile-application-internet-shops-website-concept-web-page-design-website-banner-mobile-website-3d-vector-illustration_473922-253.jpg"
]

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  return (
    <div className="w-full relative overflow-hidden rounded-xl shadow-lg">
      <div className="relative h-[350px] md:h-[465px]">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`banner-${index}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? "bg-white w-4" 
                : "bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 w-10 h-10 rounded-full flex items-center justify-center text-white"
      >
        {"<"}
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 w-10 h-10 rounded-full flex items-center justify-center text-white"
      >
        {">"}
      </button>
    </div>
  )
}

export default memo(Banner)
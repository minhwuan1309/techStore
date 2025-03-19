import React, { memo, useEffect, useState } from "react";

const image = [
  "https://img.freepik.com/free-psd/online-shopping-horizontal-banner-template_23-2148900158.jpg?t=st=1740647604~exp=1740651204~hmac=9a32cb144919e7f5b1f35ffef6dbd1e10e9da58cc8e0c419d4a00ffe5fc41b91&w=1800",
  "https://img.freepik.com/premium-vector/shopping-online-modern-marketing-mobile-application-internet-shops-website-concept-web-page-design-website-banner-mobile-website-3d-vector-illustration_473922-253.jpg"
];

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % image.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full relative overflow-hidden rounded-xl shadow-lg mt-4">
      {/* Banner Images */}
      <div className="relative w-full h-[350px] md:h-[465px]">
        {image.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`banner-${index}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {image.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 transition-all duration-300 w-10 h-10 rounded-full flex items-center justify-center text-white"
        onClick={() => setCurrentIndex((prevIndex) => (prevIndex - 1 + image.length) % image.length)}
        aria-label="Previous slide"
      >
        &#10094;
      </button>
      <button 
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 transition-all duration-300 w-10 h-10 rounded-full flex items-center justify-center text-white"
        onClick={() => setCurrentIndex((prevIndex) => (prevIndex + 1) % image.length)}
        aria-label="Next slide"
      >
        &#10095;
      </button>
    </div>
  );
};

export default memo(Banner);

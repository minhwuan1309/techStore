import React, { memo, useEffect, useState } from "react"

const image = [
  "https://img.freepik.com/free-psd/online-shopping-horizontal-banner-template_23-2148900158.jpg?t=st=1740647604~exp=1740651204~hmac=9a32cb144919e7f5b1f35ffef6dbd1e10e9da58cc8e0c419d4a00ffe5fc41b91&w=1800",
  "https://img.freepik.com/premium-vector/shopping-online-modern-marketing-mobile-application-internet-shops-website-concept-web-page-design-website-banner-mobile-website-3d-vector-illustration_473922-253.jpg"
]

const Banner = () => {
  const [ currentIndex, setCurrentIndex] = useState(0)

  useEffect(()=>{
    const interval = setInterval(() =>{
      setCurrentIndex((prevIndex) => (prevIndex +1)% image.length)
    },2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full relative ">
      <img
        src={image[currentIndex]}
        alt="banner"
        className="w-full h-[430px] md:object-cover object-contain transition-opacity duration-1000"
      />
    </div>
  )
}

export default memo(Banner)

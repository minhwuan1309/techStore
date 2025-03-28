import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import vietnam from "assets/vietnam.png"

const VietnamMap = () => {
  const [topPosition, setTopPosition] = useState(window.innerHeight / 2)

  useEffect(() => {
    const handleScroll = () => {
      setTopPosition(window.scrollY + window.innerHeight / 2)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.div
      className="fixed right-4 w-64 flex flex-col shadow-lg rounded-lg items-center opacity-90"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ top: `${topPosition}px`, transform: "translateY(-50%)" }}
    >
      <motion.img
        id="vietnam-map"
        src={vietnam}
        alt="Vietnam Map"
        className="w-full h-auto"
        style={{ transition: "top 0.3s ease-in-out" }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ rotate: 3 }}
      />
      <motion.div
        className="mt-4 bg-white px-4 py-2 text-red-600 font-bold text-lg text-center rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
      >
        <span>Hoàng Sa - Trường Sa</span><br />
        <span>Là Của Việt Nam</span>
      </motion.div>
    </motion.div>
  )
}

export default VietnamMap

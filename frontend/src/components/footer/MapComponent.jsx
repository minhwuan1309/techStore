import React from "react";

const MapComponent = () => {
  return (
    <div className="w-full h-[200px] bg-gray-800 rounded-lg overflow-hidden">
      <iframe
        className="w-full h-full"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.369788568334!2d106.7830265!3d10.8557382!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175276e7ea103df%3A0xb6cf10bb7d719327!2sHUTECH%20University%20-%20Thu%20Duc%20Campus!5e0!3m2!1sen!2s!4v1709100000000"
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};

export default MapComponent;
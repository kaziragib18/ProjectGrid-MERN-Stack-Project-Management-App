// components/ThreeBallLoader.tsx
import React from "react";
import "@/app.css"; // or the correct path to your global CSS file

const CustomLoader: React.FC = () => {
  return (
    <div className="three-ball-loader-container">
      <div className="three-ball-loader">
        <span className="ball ball1"></span>
        <span className="ball ball2"></span>
        <span className="ball ball3"></span>
      </div>
      <p className="loader-text">Loading...</p>
    </div>
  );
};

export default CustomLoader;

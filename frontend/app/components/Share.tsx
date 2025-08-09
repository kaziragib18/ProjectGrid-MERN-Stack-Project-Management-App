import React, { useState } from 'react';


const Share = () => {
  const [toggle, setToggle] = useState(false);

  const handleClick = () => {
    setToggle(!toggle);
  };

  return (
    <div className="relative">
      {/* Share Button */}
      <div
        className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-white dark:text-black bg-black dark:bg-white border border-gray-400 rounded-full cursor-pointer transition-transform scale-80 p-2 w-8 h-8 z-10"
        onClick={handleClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Circular Social Cards */}
      <div className="flex flex-wrap justify-center items-center gap-4 mt-8">
        {/* Instagram */}
        <button
          data-toggle1={toggle ? 'true' : 'false'}
          className="w-[60px] h-[60px] rounded-full bg-black dark:bg-white shadow-lg transition-all duration-300 hover:bg-[#cc39a4] dark:hover:bg-[#cc39a4] hover:scale-110 flex items-center justify-center group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0,0,256,256"
            width="24"
            height="24"
            className="fill-[#cc39a4] group-hover:fill-white"
          >
            <path d="M..." /> {/* Replace with actual Instagram path if needed */}
          </svg>
        </button>

        {/* Twitter */}
        <button
          data-toggle2={toggle ? 'true' : 'false'}
          className="w-[60px] h-[60px] rounded-full bg-black dark:bg-white shadow-lg transition-all duration-300 hover:bg-[#03A9F4] dark:hover:bg-[#03A9F4] hover:scale-110 flex items-center justify-center group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="24"
            height="24"
            className="fill-[#03A9F4] group-hover:fill-white"
          >
            <path d="M..." /> {/* Replace with actual Twitter path if needed */}
          </svg>
        </button>

        {/* GitHub */}
        <button
          data-toggle3={toggle ? 'true' : 'false'}
          className="w-[60px] h-[60px] rounded-full bg-black dark:bg-white shadow-lg transition-all duration-300 hover:bg-[#272727] dark:hover:bg-[#272727] hover:scale-110 flex items-center justify-center group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 30 30"
            width="24"
            height="24"
            className="fill-[#F0F6FC] dark:fill-[#1e1f25] group-hover:fill-white"
          >
            <path d="M..." /> {/* Replace with actual GitHub path if needed */}
          </svg>
        </button>

        {/* Discord */}
        <button
          data-toggle4={toggle ? 'true' : 'false'}
          className="w-[60px] h-[60px] rounded-full bg-black dark:bg-white shadow-lg transition-all duration-300 hover:bg-[#8c9eff] dark:hover:bg-[#8c9eff] hover:scale-110 flex items-center justify-center group"
        >
          <svg
            height="24"
            width="24"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            className="fill-[#8c9eff] group-hover:fill-white"
          >
            <path d="M..." /> {/* Replace with actual Discord path if needed */}
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Share;

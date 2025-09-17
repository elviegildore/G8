import React from "react";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#696969] text-center py-2 shadow-md z-40">
      <p className="text-white tracking-widest font-[Poppins]">
        © {new Date().getFullYear()} All Rights Reserved
      </p>
    </footer>
  );
};

export default Footer;

import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#696969] text-center py-2 shadow-md">
      <p className="text-white tracking-widest font-[Poppins]">
        © {new Date().getFullYear()} All Rights Reserved
      </p>
    </footer>
  );
};

export default Footer;

import React from "react";
import NavbarForDesktop from "./NavbarForDesktop";
import NavbarForMobile from "./NavbarForMobile";

const Navbar: React.FC = () => {
  return (
    <>
      <NavbarForMobile />
      <NavbarForDesktop />
    </>
  );
};

export default Navbar;

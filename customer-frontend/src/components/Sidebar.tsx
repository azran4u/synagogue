import React from "react";
import { useDispatch } from "react-redux";
import { selectSidebarIsOpen, sidebarActions } from "../store/sidebarSlice";
import { useAppSelector } from "../store/hooks";
import { useNavigate } from "react-router-dom";
import { AppToolBar } from "./AppToolBar";
import { AppSideBar } from "./AppSideBar";
import { useAuth } from "../hooks/useAuth";

export const Sidebar: React.FC = () => {
  const isSidebarOpen = useAppSelector(selectSidebarIsOpen);
  const dispatch = useDispatch();
  const handleDrawerToggle = () => dispatch(sidebarActions.toggle());
  const closeDrawer = () => dispatch(sidebarActions.closeSidebar());
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLinkClick = (path: string) => {
    closeDrawer();
  };

  const handleLogout = () => {
    logout();
    handleDrawerToggle();
    navigate("/");
  };

  return (
    <>
      <AppToolBar
        onDrawerToggle={handleDrawerToggle}
        onLogoClick={() => handleLinkClick("/")}
      />
      <AppSideBar
        isOpen={isSidebarOpen}
        onClose={handleDrawerToggle}
        onLinkClick={handleLinkClick}
        onLogout={handleLogout}
      />
    </>
  );
};

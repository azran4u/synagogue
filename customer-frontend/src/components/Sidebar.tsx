import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { selectSidebarIsOpen, sidebarActions } from "../store/sidebarSlice";
import { useAppSelector } from "../store/hooks";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { AppToolBar } from "./AppToolBar";
import { AppSideBar } from "./AppSideBar";
import { useAuth } from "../hooks/useAuth";
import { useMobile } from "../hooks/useMobile";

export const Sidebar: React.FC = () => {
  const isSidebarOpen = useAppSelector(selectSidebarIsOpen);
  const dispatch = useDispatch();
  const handleDrawerToggle = () => dispatch(sidebarActions.toggle());
  const closeDrawer = () => dispatch(sidebarActions.closeSidebar());
  const openDrawer = () => dispatch(sidebarActions.openSidebar());
  const { logout } = useAuth();
  const navigate = useSynagogueNavigate();
  const isMobile = useMobile();

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  const handleLinkClick = (path: string) => {
    closeDrawer();
  };

  const handleLogout = () => {
    logout();
    handleDrawerToggle();
    navigate("");
  };

  useEffect(() => {
    if (!isMobile || isSidebarOpen) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
      touchEndY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      const swipeDistanceX = touchStartX.current - touchEndX.current;
      const swipeDistanceY = Math.abs(touchStartY.current - touchEndY.current);
      const minSwipeDistance = 50;
      const edgeThreshold = 50; // Start swipe from within 50px from the right edge

      // Check if swipe started from the right edge
      const isFromRightEdge =
        touchStartX.current >= window.innerWidth - edgeThreshold;

      // Check if it's a right-to-left swipe (positive swipeDistanceX)
      // And vertical movement is less than horizontal (to avoid scrolling confusion)
      if (
        isFromRightEdge &&
        swipeDistanceX > minSwipeDistance &&
        swipeDistanceY < swipeDistanceX
      ) {
        openDrawer();
      }
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, isSidebarOpen, openDrawer]);

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

import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../store/hooks";
import { sidebarActions } from "../store/sidebarSlice";
import { selectCartItemsCount } from "../store/cartSlice";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Badge } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const CartWithBadge: React.FC = () => {
  const dispatch = useAppDispatch();
  const itemsCount = useSelector(selectCartItemsCount);
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => {
        dispatch(sidebarActions.closeSidebar());
        navigate("/cart");
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <IconButton color="inherit" sx={{ padding: 0 }}>
        <Badge
          badgeContent={itemsCount}
          color="info"
          overlap="rectangular"
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
    </Box>
  );
};

export default CartWithBadge;

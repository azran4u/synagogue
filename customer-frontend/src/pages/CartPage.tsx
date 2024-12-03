import React, { useMemo } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Title from "../components/Title";
import { cartActions } from "../store/cartSlice";
import { useAppDispatch } from "../store/hooks";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import Paper from "@mui/material/Paper";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import useTheme from "@mui/material/styles/useTheme";
import { useCartProducts } from "../hooks/useCartProducts";
import { useCartDiscount } from "../hooks/useCartDiscount";
import { useNavigate } from "react-router-dom";

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const productsInCart = useCartProducts();
  const { totalCost, totalCostAfterDiscount } = useCartDiscount();

  const handleRemoveItem = (id: string) => {
    dispatch(cartActions.removeItem(id));
  };

  const handleIncreaseQuantity = (id: string) => {
    dispatch(cartActions.increaseAmount({ id }));
  };

  const handleDecreaseQuantity = (id: string) => {
    dispatch(cartActions.decreaseAmount({ id }));
  };

  const isCartEmpty = useMemo(
    () => productsInCart.length === 0,
    [productsInCart]
  );

  return (
    <>
      <Title title="עגלת קניות" />
      {isCartEmpty ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">העגלה ריקה</Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">סכ"ה לתשלום: ₪{totalCost}</Typography>
            {totalCost > totalCostAfterDiscount && (
              <>
                <Typography variant="h6">
                  סכ"ה לתשלום לאחר הנחה: ₪{totalCostAfterDiscount}
                </Typography>
                <Typography variant="h6" color={theme.palette.primary.light}>
                  בקנייה זו חסכת: ₪{totalCost - totalCostAfterDiscount}
                </Typography>
              </>
            )}
          </Box>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    תיאור
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    כמות
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    מחיר
                  </TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productsInCart.map(({ product, amount }) => (
                  <TableRow
                    key={product.id}
                    sx={{
                      "&:last-child td, &:last-child th": {
                        border: 0,
                      },
                    }}
                  >
                    <TableCell
                      align="center"
                      onClick={() =>
                        navigate(`/product/${product.kind}`, {
                          state: {
                            product,
                            amount,
                          },
                        })
                      }
                    >
                      <Typography variant="body2">{product.name} </Typography>
                      {product.kind === "tights" && (
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography variant="body2">
                            דניר: {product.denier}
                          </Typography>
                          <Typography variant="body2">
                            רגל: {product.leg}
                          </Typography>
                          <Typography variant="body2">
                            מידה: {product.size}
                          </Typography>
                          <Typography variant="body2">
                            צבע: {product.color}
                          </Typography>
                        </Box>
                      )}
                      {product.kind === "lace" && (
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography variant="body2">
                            תחרה: {product.lace}
                          </Typography>
                          <Typography variant="body2">
                            צבע: {product.color}
                          </Typography>
                        </Box>
                      )}
                      {product.kind === "short" && (
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography variant="body2">
                            אורך: {product.length}
                          </Typography>
                          <Typography variant="body2">
                            צבע: {product.color}
                          </Typography>
                        </Box>
                      )}
                      {product.kind === "thermal" && (
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography variant="body2">
                            רגל: {product.leg}
                          </Typography>
                          <Typography variant="body2">
                            מידה: {product.size}
                          </Typography>
                          <Typography variant="body2">
                            צבע: {product.color}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          gap: "0.5rem",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <AddIcon
                          fontSize="small"
                          onClick={() => handleIncreaseQuantity(product.id)}
                          sx={{ cursor: "pointer" }}
                        />
                        <Typography variant="body1" sx={{ fontSize: "1.5rem" }}>
                          {amount}
                        </Typography>
                        <RemoveIcon
                          fontSize="small"
                          onClick={() => handleDecreaseQuantity(product.id)}
                          sx={{ cursor: "pointer" }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {product.price * amount}
                    </TableCell>
                    <TableCell align="center">
                      <DeleteIcon
                        onClick={() => handleRemoveItem(product.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <br />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button variant="contained" onClick={() => navigate("/checkout")}>
              בצע הזמנה
            </Button>
          </Box>
        </>
      )}
    </>
  );
};

export default CartPage;

// <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           gap: "2rem",
//         }}
//       >
//         <Title title="עגלה" />
//         {productsInCart.length === 0 ? (
//           <Typography variant="h6">העגלה ריקה</Typography>
//         ) : (
//           productsInCart.map(({ product, amount }) => (
//             <Card
//               key={product.id}
//               sx={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 width: { w },
//               }}
//             >
//               <Typography variant="h6">{product.name}</Typography>
//               <CardContent
//                 sx={{
//                   display: "flex",
//                   flexDirection: "row",
//                   gap: "1rem",
//                   justifyContent: "start",
//                 }}
//               >
//                 {/* <Typography variant="body2">{product.description}</Typography> */}
//                 <DeleteIcon onClick={() => handleRemoveItem(product.id)} />
//                 <FirebaseStorageImage url={product?.image ?? ""} size="small" />
//                 {product.kind === "tights" && (
//                   <Box sx={{ display: "flex", flexDirection: "column" }}>
//                     <Typography variant="body2">
//                       דניר: {product.denier}
//                     </Typography>
//                     <Typography variant="body2">רגל: {product.leg}</Typography>
//                     <Typography variant="body2">
//                       מידה: {product.size}
//                     </Typography>
//                     <Typography variant="body2">
//                       צבע: {product.color}
//                     </Typography>
//                   </Box>
//                 )}
//                 {product.kind === "lace" && (
//                   <Box sx={{ display: "flex", flexDirection: "column" }}>
//                     <Typography variant="body2">
//                       תחרה: {product.lace}
//                     </Typography>
//                     <Typography variant="body2">
//                       צבע: {product.color}
//                     </Typography>
//                   </Box>
//                 )}
//                 {product.kind === "short" && (
//                   <Box sx={{ display: "flex", flexDirection: "column" }}>
//                     <Typography variant="body2">
//                       אורך: {product.length}
//                     </Typography>
//                     <Typography variant="body2">
//                       צבע: {product.color}
//                     </Typography>
//                   </Box>
//                 )}
//                 {product.kind === "thermal" && (
//                   <Box sx={{ display: "flex", flexDirection: "column" }}>
//                     <Typography variant="body2">רגל: {product.leg}</Typography>
//                     <Typography variant="body2">
//                       מידה: {product.size}
//                     </Typography>
//                     <Typography variant="body2">
//                       צבע: {product.color}
//                     </Typography>
//                   </Box>
//                 )}
//               </CardContent>
//               <Typography variant="body1">
//                 מחיר: ₪{product.price * amount}
//               </Typography>
//               <CardActions
//                 sx={{
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: "1rem",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <Box
//                   sx={{
//                     display: "flex",
//                     flexDirection: "row",
//                     gap: "1rem",
//                     justifyContent: "start",
//                   }}
//                 >
//                   <Button
//                     variant="contained"
//                     size="small"
//                     onClick={() => handleIncreaseQuantity(product.id)}
//                   >
//                     +
//                   </Button>
//                   <Typography variant="body1">כמות: {amount}</Typography>
//                   <Button
//                     size="small"
//                     variant="contained"
//                     onClick={() => handleDecreaseQuantity(product.id)}
//                     disabled={amount <= 1}
//                   >
//                     -
//                   </Button>
//                 </Box>
//               </CardActions>
//             </Card>
//           ))
//         )}
//       </Box>

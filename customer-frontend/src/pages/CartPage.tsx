import React, { useMemo, useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Title from "../components/Title";
import { cartActions, selectOrderId } from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
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
import { useOrderById } from "../hooks/useOrderById";
import { useDeleteOrderById } from "../hooks/useDeleteOrderById";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import { useCurrentSale } from "../hooks/useCurrentSale";

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const orderId = useAppSelector(selectOrderId);
  const { order, isLoading: orderByIdLoading } = useOrderById(orderId);
  const { deleteOrder } = useDeleteOrderById();
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
  const [showCreateNewOrderModal, setShowCreateNewOrderModal] = useState(false);
  const { isLoading: saleIsLoading, currentSale: sale } = useCurrentSale();

  const createNewOrderHandler = () => {
    dispatch(cartActions.restoreInitialState());
    setShowCreateNewOrderModal(false);
    navigate("/");
  };

  const deleteOrderHandler = () => {
    dispatch(cartActions.restoreInitialState());
    deleteOrder(orderId);
    setShowDeleteOrderModal(false);
    navigate("/");
  };

  const { cartProducts: productsInCart, isLoading: productsInCartLoading } =
    useCartProducts();
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

  const isExistingOrder = useMemo(() => {
    if (order && order?.products?.length > 0) return true;
    return false;
  }, [order]);

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr 1fr",
        }}
      >
        <Button
          disabled={!sale}
          variant="contained"
          onClick={() => setShowCreateNewOrderModal(true)}
          sx={{
            width: "1rem",
            height: "2.5rem",
            display: "flex",
            marginLeft: "1rem",
            marginTop: "1rem",
          }}
        >
          הזמנה חדשה
        </Button>
        <Title title="עגלת קניות" />
      </Box>
      <Dialog
        open={showCreateNewOrderModal}
        onClose={() => setShowCreateNewOrderModal(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          פעולה זו תנקה את הסל ותתחיל הזמנה חדשה. היא אינה משפיעה על הזמנות שכבר
          ביצעת
        </DialogTitle>
        <DialogActions>
          <Button
            onClick={() => setShowCreateNewOrderModal(false)}
            color="primary"
          >
            בטל
          </Button>
          <Button onClick={createNewOrderHandler} color="error" autoFocus>
            כן, המשך
          </Button>
        </DialogActions>
      </Dialog>
      {productsInCartLoading || orderByIdLoading ? (
        <CircularProgress />
      ) : isCartEmpty ? (
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
            <Typography variant="h6">סה"כ לתשלום: ₪{totalCost}</Typography>
            {totalCost > totalCostAfterDiscount && (
              <>
                <Typography variant="h6">
                  סה"כ לתשלום לאחר הנחה: ₪{totalCostAfterDiscount}
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
                  <TableCell align="center">
                    {order?.date && (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                          setShowDeleteOrderModal(true);
                        }}
                        sx={{
                          width: "1rem",
                          height: "2.5rem",
                        }}
                      >
                        בטל הזמנה
                      </Button>
                    )}
                  </TableCell>

                  <Dialog
                    open={showDeleteOrderModal}
                    onClose={() => setShowDeleteOrderModal(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                  >
                    <DialogTitle id="alert-dialog-title">
                      למחוק את ההזמנה?
                    </DialogTitle>
                    <DialogActions>
                      <Button
                        onClick={() => setShowDeleteOrderModal(false)}
                        color="primary"
                      >
                        בטל
                      </Button>
                      <Button
                        onClick={deleteOrderHandler}
                        color="error"
                        autoFocus
                      >
                        כן,מחק
                      </Button>
                    </DialogActions>
                  </Dialog>
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
                        navigate(`/product/${product.kind}/${product.name}`, {
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
                            מידה: {product.size}
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
                            מידה: {product.size}
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
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <Typography variant="h6">סה"כ לתשלום: ₪{totalCost}</Typography>
            {totalCost > totalCostAfterDiscount && (
              <>
                <Typography variant="h6">
                  סה"כ לתשלום לאחר הנחה: ₪{totalCostAfterDiscount}
                </Typography>
                <Typography variant="h6" color={theme.palette.primary.light}>
                  בקנייה זו חסכת: ₪{totalCost - totalCostAfterDiscount}
                </Typography>
              </>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <Button
              disabled={!sale}
              variant="contained"
              onClick={() => navigate("/checkout")}
            >
              {isExistingOrder ? "עדכן/י הזמנה" : "בצע/י הזמנה"}
            </Button>
            {!sale && (
              <Typography
                variant="h5"
                color="error"
                gutterBottom
                sx={{ margin: "0 auto" }}
              >
                המכירה סגורה כעת
              </Typography>
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default CartPage;

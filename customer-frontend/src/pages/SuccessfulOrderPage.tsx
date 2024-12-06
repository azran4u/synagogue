import Typography from "@mui/material/Typography";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useOrderUrl } from "../hooks/useOrderLink";
import { useAppSelector } from "../store/hooks";
import { selectCheckout } from "../store/cartSlice";
import { useCurrentSale } from "../hooks/useCurrentSale";
import { useMemo } from "react";

const SuccessfulOrderPage = () => {
  const { currentSale } = useCurrentSale();
  const navigate = useNavigate();
  const { endpoint } = useOrderUrl();
  const checkout = useAppSelector(selectCheckout);
  const orderSuccessMessage = "הזמנתך בוצעה בהצלחה!";
  const pickupMessage = "הזמנתך תמתין לך בנקודת החלוקה שבחרת: ";
  const thankYouMessage = "תודה שקנית בטייץ שומרון";
  const detailsMessage = "תשלום יתבצע לאחר איסוף ההזמנה מנקודת החלוקה";
  const finalPayment = "סכום סופי לתשלום יופיע על החבילה";
  const paymentMessage = "ניתן לשלם ללירון או שרהל'ה בביט / פייבוקס";
  const emailMessage = "אישור הזמנה ישלח לכתובת המייל שהזנת";
  const editMessage = useMemo(
    () =>
      `ניתן לערוך את ההזמנה באמצעות הקישור הבא עד לסגירת המכירה בתאריך: ${currentSale?.end_date}`,
    [currentSale]
  );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          {orderSuccessMessage}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {thankYouMessage}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {pickupMessage}
        </Typography>
        <Typography variant="h5" gutterBottom>
          {checkout?.prefferedPickupLocation}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {detailsMessage}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {finalPayment}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {paymentMessage}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {emailMessage}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {editMessage}
        </Typography>
      </Box>
      <Button
        onClick={() => {
          navigate(endpoint ?? "");
        }}
        variant="contained"
        sx={{ display: "flex", margin: "1rem auto" }}
      >
        לצפייה בהזמנה
      </Button>
    </>
  );
};

export default SuccessfulOrderPage;

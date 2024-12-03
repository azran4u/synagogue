import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import { useOrderUrl } from "../hooks/useOrderLink";
import { useAppSelector } from "../store/hooks";
import { selectCheckout } from "../store/cartSlice";

const SuccessfulOrderPage = () => {
  const orderSuccessMessage = "הזמנתך בוצעה בהצלחה!";
  const pickupMessage = "הזמנתך תמתין לך בנקודת החלוקה שבחרת: ";
  const thankYouMessage = "תודה שקנית בטייץ השומרון";
  const detailsMessage = "תשלום יתבצע לאחר איסוף ההזמנה מנקודת החלוקה";
  const finalPayment = "סכום סופי לתשלום יופיע על החבילה";
  const paymentMessage = "ניתן לשלם ללירון או שרהל'ה בביט / פייבוקס";
  const emailMessage = "אישור הזמנה ישלח לכתובת המייל שהזנת";
  const editMessage = "ניתן לערוך את ההזמנה בכל עת באמצעות הקישור הבא";
  const {endpoint} = useOrderUrl();
  const checkout = useAppSelector(selectCheckout);

  return (
    <Box
      sx={{
        minHeight: "15vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ margin: "0 auto" }}>
        {orderSuccessMessage}
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ margin: "0 auto" }}>
        {thankYouMessage}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ margin: "0 auto" }}>
        {pickupMessage}
      </Typography>
      <Typography variant="h5" gutterBottom sx={{ margin: "0 auto" }}>
        {checkout?.prefferedPickupLocation}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ margin: "0 auto" }}>
        {detailsMessage}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ margin: "0 auto" }}>
        {finalPayment}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ margin: "0 auto" }}>
        {paymentMessage}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ margin: "0 auto" }}>
        {emailMessage}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ margin: "0 auto" }}>
        {editMessage}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Link to={endpoint ?? ""}>
          <Typography variant="h6" gutterBottom sx={{ margin: "0 auto" }}>
            לצפייה בהזמנה
          </Typography>
        </Link>
      </Box>
    </Box>
  );
};

export default SuccessfulOrderPage;

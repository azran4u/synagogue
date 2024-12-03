import React from "react";
import Button from "@mui/material/Button";
import { useFormik } from "formik";
import Box from "@mui/material/Box";
import * as Yup from "yup";
import SelectComponent from "../components/SelectComponent";
import Title from "../components/Title";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { usePickups } from "../hooks/usePickups";
import { useMobile } from "../hooks/useMobile";
import { useCartProducts } from "../hooks/useCartProducts";
import { useCartDiscount } from "../hooks/useCartDiscount";
import Typography from "@mui/material/Typography";
import { useCurrentSale } from "../hooks/useCurrentSale";
import CircularProgress from "@mui/material/CircularProgress";
import { useSubmitOrder } from "../hooks/useSubmitOrder";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { cartActions, selectCheckout, selectOrderId } from "../store/cartSlice";
import { useNavigate } from "react-router-dom";
import { useSendEmail } from "../hooks/useSendEmail";
import { useOrderUrl } from "../hooks/useOrderLink";

export interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  prefferedPickupLocation: string;
  comments: string;
}

const CheckoutPage: React.FC = () => {
  const { currentSale: sale, isLoading: saleIsLoading } = useCurrentSale();
  const { pickups } = usePickups();
  const isMobile = useMobile();
  const cartProducts = useCartProducts();
  const { totalCost, totalCostAfterDiscount, discount } = useCartDiscount();
  const { submitOrder } = useSubmitOrder();
  const orderId = useAppSelector(selectOrderId);
  const navigate = useNavigate();
  const checkout = useAppSelector(selectCheckout);
  const dispatch = useAppDispatch();
  const { sendEmail } = useSendEmail();
  const { url } = useOrderUrl();

  const {
    values,
    isSubmitting,
    handleChange,
    handleSubmit,
    touched,
    errors,
    status,
  } = useFormik<CheckoutFormValues>({
    initialValues: checkout,
    validationSchema: Yup.object<CheckoutFormValues>({
      firstName: Yup.string().required("שדה חובה"),
      lastName: Yup.string().required("שדה חובה"),
      email: Yup.string().email("כתובת אימייל לא תקינה").required("שדה חובה"),
      phoneNumber: Yup.string().required("שדה חובה"),
      prefferedPickupLocation: Yup.string().required("שדה חובה"),
      comments: Yup.string(),
    }),
    onSubmit: async (values: CheckoutFormValues, { setStatus }) => {
      if (cartProducts.length === 0) {
        setStatus("העגלה ריקה. אנא הוסף/י מוצרים לעגלה לפני ביצוע ההזמנה.");
        return;
      }
      if (!sale) {
        setStatus("המכירה סגורה כעת");
        return;
      }
      if (!orderId) {
        setStatus("אירעה שגיאה בקבלת מזהה הזמנה");
        return;
      }
      try {
        submitOrder({
          id: orderId,
          comments: values.comments,
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
          prefferedPickupLocation: values.prefferedPickupLocation,
          products: cartProducts,
          saleName: sale?.name,
          totalCost: totalCost,
          totalCostAfterDiscount: totalCostAfterDiscount,
          discount: discount,
          date: new Date().toLocaleString(),
          status: "התקבלה",
        });
        setStatus(null);
        dispatch(
          cartActions.setCheckout({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phoneNumber: values.phoneNumber,
            prefferedPickupLocation: values.prefferedPickupLocation,
            comments: values.comments,
          })
        );
        sendEmail({
          from: "MS_7732lz@trial-x2p03476779gzdrn.mlsender.net",
          to: values.email,
          message: {
            subject: "תודה שהזמנת באתר טייץ השומרון",
            html: `
           <div style="direction: rtl; text-align: right;">
          <h1>הזמנתך התקבלה בהצלחה</h1>
          <p>פרטי ההזמנה:</p>
          <p>שם פרטי: ${values.firstName}</p>
          <p>שם משפחה: ${values.lastName}</p>
          <p>אימייל: ${values.email}</p>
          <p>טלפון נייד: ${values.phoneNumber}</p>
          <p>נקודת חלוקה: ${values.prefferedPickupLocation}</p>
          <p>קישור להזמנה: <a href=${url}>לחץ כאן</a></p>
          <p>סכום לתשלום: ${totalCost} ש"ח</p>
          ${
            discount > 0
              ? `
            <p>הנחה: ${discount} ש"ח</p>
            <p>סכום לתשלום לאחר הנחה: ${totalCostAfterDiscount} ש"ח</p>            
            `
              : ""
          }
          <p>תאריך: ${new Date().toLocaleString()}</p>
          <p>סטטוס: התקבלה</p>
        </div>
            `,
          },
        });
        navigate("/success");
      } catch (error) {
        setStatus("אירעה שגיאה בעת ביצוע ההזמנה. אנא נסה שוב.");
      }
    },
  });

  const maxWidth = isMobile ? "80vw" : "400px";
  return saleIsLoading ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  ) : sale ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: { maxWidth },
        margin: "auto",
        gap: "0.5rem",
      }}
    >
      <Title title={"טופס הזמנה"} />
      <form onSubmit={handleSubmit}>
        {status && (
          <Typography
            variant="body2"
            color="error"
            sx={{ marginBottom: "1rem", textAlign: "center" }}
          >
            {status}
          </Typography>
        )}
        <FormControl fullWidth sx={{ margin: "1rem 0" }}>
          <FormLabel htmlFor="firstName">שם פרטי</FormLabel>
          <TextField
            fullWidth
            id="firstName"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            error={touched.firstName && Boolean(errors.firstName)}
            helperText={touched.firstName && errors.firstName}
          />
        </FormControl>

        <FormControl fullWidth sx={{ margin: "1rem 0" }}>
          <FormLabel htmlFor="lastName">שם משפחה</FormLabel>
          <TextField
            fullWidth
            id="lastName"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            error={touched.lastName && Boolean(errors.lastName)}
            helperText={touched.lastName && errors.lastName}
          />
        </FormControl>

        <FormControl fullWidth sx={{ margin: "1rem 0" }}>
          <FormLabel htmlFor="email">אימייל</FormLabel>
          <TextField
            fullWidth
            id="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email && errors.email}
          />
        </FormControl>

        <FormControl fullWidth sx={{ margin: "1rem 0" }}>
          <FormLabel htmlFor="phoneNumber">טלפון נייד</FormLabel>
          <TextField
            fullWidth
            id="phoneNumber"
            name="phoneNumber"
            value={values.phoneNumber}
            onChange={handleChange}
            error={touched.phoneNumber && Boolean(errors.phoneNumber)}
            helperText={touched.phoneNumber && errors.phoneNumber}
          />
        </FormControl>

        <SelectComponent
          label="נקודת חלוקה"
          name="prefferedPickupLocation"
          value={values.prefferedPickupLocation}
          options={pickups.map((x) => x.name)}
          onChange={handleChange}
          error={
            touched.prefferedPickupLocation &&
            Boolean(errors.prefferedPickupLocation)
          }
          helperText={errors.prefferedPickupLocation}
        />

        <FormControl fullWidth sx={{ margin: "1rem 0" }}>
          <FormLabel htmlFor="comments">הערות</FormLabel>
          <TextField
            fullWidth
            id="comments"
            name="comments"
            value={values.comments}
            onChange={handleChange}
            error={touched.comments && Boolean(errors.comments)}
            helperText={touched.comments && errors.comments}
            multiline
            rows={4}
          />
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          sx={{ margin: "1rem auto", display: "flex" }}
        >
          בצע/י הזמנה
        </Button>
      </form>
    </Box>
  ) : (
    <Typography variant="body1" color="error" sx={{ textAlign: "center" }}>
      המכירה סגורה כעת
    </Typography>
  );
};

export default CheckoutPage;

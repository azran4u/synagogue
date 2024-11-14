import React from "react";
import styled from "styled-components";
import { OptionalClassName } from "../../../utils/classNameInterface";
import Button from "../../../shared/components/Button";
import Underline from "../../../shared/components/Underline";
import ProductAmountButtons from "../../../shared/components/ProductAmountButtons";
import { FaTrash } from "react-icons/fa";
import { device } from "../../../utils/device.sizes";
import CartItemDescription from "./CartItemDescription";
import { useHistory } from "react-router";
import { ProductWithAmount } from "../../../model/product/ProductWithAmount";

interface CartContentProps extends OptionalClassName {
  cartProductsWithAmount: ProductWithAmount[];
  totalCost: number;
  totalCostAfterDiscount: number;
  allowEdit?: boolean;
  clearCart: () => void;
  increaseAmount: (sku: string) => void;
  decreaseAmount: (sku: string) => void;
  removeItem: (sku: string) => void;
  submitButtonClicked: () => void;
}

const CartContent: React.FC<CartContentProps> = (props) => {
  const allowEdit = props?.allowEdit ?? true;
  const history = useHistory();

  return (
    <Wrapper className={props.className}>
      {allowEdit && (
        <div className="top-buttons">
          <Button
            className="top-buttons-item"
            text="להמשך קניות"
            onClick={() => history.push("/")}
          />
          <Button
            className="clear-cart"
            text="רוקן עגלה"
            onClick={props.clearCart}
          />
        </div>
      )}
      <div className="cart-items-list">
        <table>
          <thead>
            <tr>
              <th>
                <div className="header">
                  <h5>פריט</h5>
                  <Underline className="underline" />
                </div>
              </th>
              <th>
                <div className="header">
                  <h5>כמות</h5>
                  <Underline className="underline" />
                </div>
              </th>
              <th>
                <div className="header">
                  <h5>מחיר</h5>
                  <Underline className="underline" />
                </div>
              </th>
              <th>
                <div className="header">
                  <h5>סיכום</h5>
                  <Underline className="underline" />
                </div>
              </th>
              {allowEdit && (
                <th>
                  <div key="header-trash"> </div>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {props.cartProductsWithAmount.length > 0 &&
              props.cartProductsWithAmount.map((cartItem) => {
                return (
                  <tr key={cartItem.sku}>
                    <td>
                      <div className="row-value">
                        <CartItemDescription sku={cartItem.sku} />
                      </div>
                    </td>
                    <td>
                      <h5 className="row-value">
                        <ProductAmountButtons
                          className="amount-buttons"
                          allowEdit={allowEdit}
                          amount={cartItem.amount}
                          increase={() => props.increaseAmount(cartItem.sku)}
                          decrease={() => {
                            if (cartItem.amount > 1)
                              props.decreaseAmount(cartItem.sku);
                          }}
                        />
                      </h5>
                    </td>
                    <td>
                      <h5 className="row-value">{cartItem.price}</h5>
                    </td>
                    <td>
                      <h5 className="row-value">
                        {cartItem.amount * cartItem.price}
                      </h5>
                    </td>
                    {allowEdit && (
                      <td>
                        <div
                          className="row-value change-mouse"
                          onClick={() => props.removeItem(cartItem.sku)}
                          key={cartItem.sku + "trash"}
                        >
                          <FaTrash />
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="cart-summary">
        <h5> סכום כולל: {props.totalCost} ש"ח</h5>
        <h5>
          בקנייה זו חסכת: {props.totalCost - props.totalCostAfterDiscount} ש"ח
        </h5>
        <h5 className="final-price">
          סכום סופי: {props.totalCostAfterDiscount} ש"ח
        </h5>
      </div>

      <div className="place-order">
        <Button
          className="place-order-button"
          text={allowEdit ? "ביצוע הזמנה" : "עריכת הזמנה"}
          onClick={props.submitButtonClicked}
        />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  table {
    width: 100%;
  }

  .header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    h5 {
      margin-bottom: 0.5rem;
      text-align: center;
      @media ${device.mobile} {
        font-size: 0.75rem;
      }
    }
  }

  .row-value {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 1rem;
  }

  .underline {
    width: 6rem;

    @media ${device.mobile} {
      width: 2rem;
    }
  }
  .amount-buttons {
    .amount {
      font-size: 1rem;
    }
  }

  .clear-cart {
    background: var(--clr-button-warning-background);
    color: var(--clr-button-warning-text);
  }

  .top-buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .top-buttons-item {
    display: block;
  }

  .place-order {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .place-order-button {
    width: 20rem;
    height: 2rem;
  }

  .cart-summary {
    margin: 0 auto;
    margin-top: 1rem;
    width: 15rem;
    height: 6rem;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: var(--clr-content-background);

    h5 {
      font-weight: 400;
    }
    .final-price {
      margin-top: 1rem;
      font-weight: bold;
    }
  }

  .change-mouse :hover {
    cursor: pointer;
  }
`;
export default CartContent;

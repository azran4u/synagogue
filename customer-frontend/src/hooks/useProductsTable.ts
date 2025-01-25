import { useMemo } from "react";
import { CartProduct } from "../model/cartProduct";

export function useProductsTable(products: CartProduct[]) {
  return useMemo(() => {
    const tableRows = products
      .map((product) => {
        return `
      <tr>
        <td>
        <div>${product.product.display_name}</div>
        ${
          //@ts-ignore
          product.product?.denier
            ? //@ts-ignore
              `<div>דניר: ${product.product?.denier}</div>`
            : ``
        }
        ${
          //@ts-ignore
          product.product?.leg
            ? //@ts-ignore
              `<div>רגל: ${product.product?.leg}</div>`
            : ``
        }
        ${
          //@ts-ignore
          product.product?.lace
            ? //@ts-ignore
              `<div>תחרה: ${product.product?.lace}</div>`
            : ``
        }
        ${
          //@ts-ignore
          product.product?.length
            ? //@ts-ignore
              `<div>אורך: ${product.product?.length}</div>`
            : ``
        }
        ${
          //@ts-ignore
          product.product?.size
            ? //@ts-ignore
              `<div>מידה: ${product.product?.size}</div>`
            : ``
        }
        ${
          //@ts-ignore
          product.product?.color
            ? //@ts-ignore
              `<div>צבע: ${product.product?.color}</div>`
            : ``
        }        
        </td>
        <td>${product.amount}</td>
        <td>${product.product.price}</td>
        <td>${product.product.price * product.amount}</td>
      `;
      })
      .join("");

    return `
      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr>
            <th>תיאור</th>
            <th>כמות</th>
            <th>מחיר ליחידה</th>
            <th>מחיר (לפני הנחה)</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
  }, [products]);
}

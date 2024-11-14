import { isNil } from "lodash";
import { Sale } from "../../../model/sale/sale";
import { FirestoreService } from "../../../shared/services/firestoreService";

export class SaleService extends FirestoreService<Sale> {
  constructor() {
    super("sales");
  }

  public async getActiveSale(): Promise<Sale | undefined> {
    const sales = await this.getAll();
    return this.currentSale(sales);
  }

  public async getActiveSaleLiveQuery(cb: (sale: Sale) => void) {
    await this.liveQuery((sales) => {
      const sale = this.currentSale(sales);
      cb(sale);
    });
  }

  private currentSale(sales: Sale[]) {
    const activeSale = sales.find((sale) => sale.active);
    if (isNil(activeSale)) return { active: false, name: "" };
    return activeSale;
  }
}

export const saleService = new SaleService();

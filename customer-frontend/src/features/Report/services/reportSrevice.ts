import { Order } from "../../../model/order/order";
import { PickupHistogramEntry } from "../../../model/report/pickupHistogram";
import { Report } from "../../../model/report/report";
import { SupplierBom } from "../../../model/report/suppliersBom";
import { Supplier } from "../../../model/supplier/Supplier";
import {
  ordersService,
  OrdersService,
} from "../../Order/services/ordersSrevice";
import { saleService, SaleService } from "../../Sale/services/saleSrevice";

export class ReportService {
  private orders: Order[] = [];

  constructor(
    private ordersService: OrdersService,
    private saleService: SaleService
  ) {}

  async getReport(): Promise<Report> {
    await this.getOrders();

    return {
      totalOrderCount: this.orders.length,
      totalCost: this.totalCost(),
      pickupHistogram: this.pickupCostHistogram(),
      orders: this.orders,
      suppliersBom: this.suppliersBom(),
    };
  }

  private totalCost() {
    return this.orders.reduce(
      (totalCost, order) => totalCost + order.totalCostAfterDiscount,
      0
    );
  }

  private pickupCostHistogram(): PickupHistogramEntry[] {
    const histogramMap = new Map<string, number>();

    this.orders.forEach((order) => {
      const pickupLocation = order.checkoutDetails.prefferedPickupLocation;
      const currentCost = histogramMap.get(pickupLocation) ?? 0;
      histogramMap.set(
        pickupLocation,
        currentCost + order.totalCostAfterDiscount
      );
    });

    const histogram: PickupHistogramEntry[] = [];
    histogramMap.forEach((value, key) => {
      histogram.push({
        pickupDisplayName: key,
        totalCost: value,
        commision: this.calcCommition(value),
      });
    });

    return histogram;
  }

  private suppliersBom(): SupplierBom[] {
    const suppliersBom = new Map<Supplier, Map<string, number>>();

    const bom: SupplierBom[] = [];

    this.orders.forEach((order) => {
      order.products.forEach((product) => {
        const supplier = product.supplier;
        const supplierBom = suppliersBom.get(supplier);
        if (!supplierBom) {
          const newSupplierBom = new Map<string, number>();
          newSupplierBom.set(product.sku, product.amount);
          suppliersBom.set(supplier, newSupplierBom);
        } else {
          const sku = product.sku;
          const currentAmount = supplierBom.get(sku);
          if (!currentAmount) {
            supplierBom.set(sku, product.amount);
          } else {
            supplierBom.set(sku, currentAmount + product.amount);
          }
        }
      });
    });

    suppliersBom.forEach((supplierBom, supplier) => {
      supplierBom.forEach((amount, sku) => {
        bom.push({
          supplier,
          sku,
          amount,
        });
      });
    });

    return bom;
  }

  private calcCommition(cost: number) {
    return Math.floor(cost * 0.1);
  }

  private async getOrders() {
    this.orders = await this.ordersService.getAll();
  }
}

export const reportService = new ReportService(ordersService, saleService);

import { IDiscountCalculator } from "./refac.discount-calculator";
import { Product } from "./refac.product";
import { IShippingCostCalculator } from "./refac.shipping-cost";

interface IPropsProductItem {
    productInfo: Product;
    quantity: number;
}

interface IOrderCalculator {
    calculateOrder(products: IPropsProductItem[], ...args: unknown[]): number;
}

class OrderCalculator implements IOrderCalculator {
    private _productDiscountCalculator: IDiscountCalculator;
    private _shippingCostCalculator: IShippingCostCalculator;

    constructor(
        productDiscountCalculator: IDiscountCalculator,
        shippingCostCalculator: IShippingCostCalculator,
    ) {
        this._productDiscountCalculator = productDiscountCalculator;
        this._shippingCostCalculator = shippingCostCalculator;
    }

    calculateOrder(products: IPropsProductItem[]) {
        return products.reduce((acc, product) => {
            const allProductsCost = product.productInfo.basePrice * product.quantity;

            const discount = this._productDiscountCalculator.calculateDiscount(
                product.productInfo.basePrice,
                product.quantity
            );

            const shippingCost = this._shippingCostCalculator.calculateCost(
                allProductsCost,
                product.quantity
            );

            return acc + allProductsCost - discount + shippingCost;
        }, 0);
    }
}

export { IOrderCalculator, OrderCalculator }
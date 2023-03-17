import { AbstractProductDiscountCalculatorViaQuantity, IDiscountCalculator, ProductDiscountCalculatorViaQuantity } from "./refac.discount-calculator";
import { Product } from "./refac.product";
import { AbstractShippingCostCalculator } from "./refac.shipping-cost";

interface IPropsProductItem {
    productInfo: Product;
    quantity: number;
}

abstract class AbstractOrderCalculator {
    protected _productDiscountCalculator: IDiscountCalculator;
    protected _shippingCostCalculator: AbstractShippingCostCalculator;

    constructor(
        productDiscountCalculator: IDiscountCalculator,
        shippingCostCalculator: AbstractShippingCostCalculator,
    ) {
        this._productDiscountCalculator = productDiscountCalculator;
        this._shippingCostCalculator = shippingCostCalculator;
    }

    abstract calculateOrder(products: IPropsProductItem[]): number;
}

class OrderCalculator extends AbstractOrderCalculator {
    constructor(
        productDiscountCalculator: AbstractProductDiscountCalculatorViaQuantity,
        shippingCostCalculator: AbstractShippingCostCalculator
    ) {
        super(productDiscountCalculator, shippingCostCalculator)
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

export { AbstractOrderCalculator, OrderCalculator }
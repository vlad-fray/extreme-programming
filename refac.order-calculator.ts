import { IDiscountCalculator } from './refac.discount-calculator';
import { Product } from './refac.product';
import { IShippingCostCalculator } from './refac.shipping-cost';

interface IPropsProductItem {
    productInfo: Product;
    quantity: number;
}

interface IOrderCalculator {
    calculateOrder(products: IPropsProductItem[], ...args: unknown[]): number;
}

enum EShippingCostType {
    viaFinalCost = 'viaFinalCost',
    withoutDiscounts = 'withoutDiscounts',
}

class OrderCalculator implements IOrderCalculator {
    private _productDiscountCalculator: IDiscountCalculator;
    private _shippingCostCalculator: IShippingCostCalculator;
    private _shippingCostType: EShippingCostType = EShippingCostType.withoutDiscounts;

    constructor(
        productDiscountCalculator: IDiscountCalculator,
        shippingCostCalculator: IShippingCostCalculator,
        shippingCostType?: EShippingCostType
    ) {
        this._productDiscountCalculator = productDiscountCalculator;
        this._shippingCostCalculator = shippingCostCalculator;

        if (shippingCostType) {
            this._shippingCostType = shippingCostType;
        }
    }

    private _calculateProductOrderPrice(product: IPropsProductItem) {
        const allProductsCost = product.productInfo.basePrice * product.quantity;

        const discount = this._productDiscountCalculator.calculateDiscount(
            product.productInfo.basePrice,
            product.quantity
        );

        const shippingCost = this._shippingCostCalculator.calculateCost(
            this._shippingCostType === EShippingCostType.withoutDiscounts ? allProductsCost : allProductsCost - discount,
            product.quantity
        );

        return allProductsCost - discount + shippingCost;
    }

    calculateOrder(products: IPropsProductItem[]) {        
        return products.reduce((acc, product) => {
            return acc + this._calculateProductOrderPrice(product);
        }, 0);
    }
}

export { IOrderCalculator, OrderCalculator, EShippingCostType };

import { ICouponDiscountCalculator } from "./refac.coupon";

interface IDiscountCalculator {
    calculateDiscount(baseProductPrice: number, quantity: number, ...args: unknown[]): number;
}

class ProductDiscountCalculatorViaQuantity implements IDiscountCalculator {
    private _discountThreshold: number;
    private _discountRate: number;

    constructor(discountThreshold: number, discountRate: number) {
        this._discountThreshold = discountThreshold;
        this._discountRate = discountRate;
    }

    calculateDiscount(baseProductPrice: number, quantity: number): number {
        return (
            Math.max(quantity - this._discountThreshold, 0) * baseProductPrice * this._discountRate
        );
    }
}

class ProductDiscountCalculatorViaOrder implements IDiscountCalculator {
    private _freeElementOrder: number;

    constructor(freeElementOrder: number) {
        this._freeElementOrder = freeElementOrder;
    }

    calculateDiscount(baseProductPrice: number, quantity: number) {
        return Math.floor(quantity / this._freeElementOrder) * baseProductPrice;
    }
}

class ProductDiscountCalculatorDecoratedWithCoupon implements IDiscountCalculator {
    private _discountCalculator: IDiscountCalculator;
    private _couponDiscountCalculator: ICouponDiscountCalculator;

    constructor(discountCalculator: IDiscountCalculator, couponDiscountCalculator: ICouponDiscountCalculator) {
        this._discountCalculator = discountCalculator;
        this._couponDiscountCalculator = couponDiscountCalculator;
    }

    calculateDiscount(baseProductPrice: number, quantity: number, ...args: unknown[]) {
        const discount = this._discountCalculator.calculateDiscount(baseProductPrice, quantity, ...args);
        const couponDiscount = this._couponDiscountCalculator.calculateDiscount(baseProductPrice * quantity - discount);
        return discount + couponDiscount;
    }
}

export {
    IDiscountCalculator,
    ProductDiscountCalculatorViaQuantity,
    ProductDiscountCalculatorViaOrder,
    ProductDiscountCalculatorDecoratedWithCoupon,
};

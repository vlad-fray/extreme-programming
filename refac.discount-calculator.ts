interface IDiscountCalculator {
    calculateDiscount(baseProductPrice: number, quantity: number): number;
}

// Via quantity
abstract class AbstractProductDiscountCalculatorViaQuantity implements IDiscountCalculator {
    protected _discountThreshold: number;
    protected _discountRate: number;

    constructor(discountThreshold: number, discountRate: number) {
        this._discountThreshold = discountThreshold;
        this._discountRate = discountRate;
    }

    abstract calculateDiscount(baseProductPrice: number, quantity: number): number;
}

class ProductDiscountCalculatorViaQuantity extends AbstractProductDiscountCalculatorViaQuantity {
    constructor(discountThreshold: number, discountRate: number) {
        super(discountThreshold, discountRate);
    }

    calculateDiscount(baseProductPrice: number, quantity: number): number {
        return (
            Math.max(quantity - this._discountThreshold, 0) * baseProductPrice * this._discountRate
        );
    }
}

// Via order
abstract class AbstractProductDiscountCalculatorViaOrder implements IDiscountCalculator {
    protected _freeElementOrder: number;

    constructor(freeElementOrder: number) {
        this._freeElementOrder = freeElementOrder;
    }

    abstract calculateDiscount(baseProductPrice: number, quantity: number): number;
}

class ProductDiscountCalculatorViaOrder extends AbstractProductDiscountCalculatorViaOrder {
    constructor(freeElementOrder: number) {
        super(freeElementOrder);
    }

    calculateDiscount(baseProductPrice: number, quantity: number) {
        return Math.floor(quantity / this._freeElementOrder) * baseProductPrice;
    }
}

export {
    IDiscountCalculator,
    AbstractProductDiscountCalculatorViaQuantity,
    ProductDiscountCalculatorViaQuantity,
    AbstractProductDiscountCalculatorViaOrder,
    ProductDiscountCalculatorViaOrder,
};

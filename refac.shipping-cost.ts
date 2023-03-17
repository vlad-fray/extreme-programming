abstract class AbstractShippingCostCalculator {
    protected _discountThreshold: number;
    protected _discountFeePerCase: number;
    protected _feePerCase: number;

    constructor(discountThreshold: number, discountFeePerCase: number, feePerCase: number) {
        this._discountThreshold = discountThreshold;
        this._discountFeePerCase = discountFeePerCase;
        this._feePerCase = feePerCase;
    }

    abstract calculateCost(allProductsCost: number, quantity: number): number;
}

class ShippingCostCalculatorViaAllProductsCost extends AbstractShippingCostCalculator {
    constructor(discountThreshold: number, discountFeePerCase: number, feePerCase: number) {
        super(discountThreshold, discountFeePerCase, feePerCase);
    }

    calculateCost(allProductsCost: number, quantity: number): number {
        return allProductsCost > this._discountThreshold
            ? this._discountFeePerCase * quantity
            : this._feePerCase * quantity;
    }
}

export { AbstractShippingCostCalculator, ShippingCostCalculatorViaAllProductsCost };
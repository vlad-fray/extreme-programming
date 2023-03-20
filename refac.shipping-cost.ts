interface IShippingCostCalculator {
    calculateCost(allProductsCost: number, quantity: number, ...args: unknown[]): number;
}

class ShippingCostCalculatorViaAllProductsCost implements IShippingCostCalculator {
    private _discountThreshold: number;
    private _discountFeePerCase: number;
    private _feePerCase: number;

    constructor(discountThreshold: number, discountFeePerCase: number, feePerCase: number) {
        this._discountThreshold = discountThreshold;
        this._discountFeePerCase = discountFeePerCase;
        this._feePerCase = feePerCase;
    }

    calculateCost(allProductsCost: number, quantity: number): number {
        return allProductsCost > this._discountThreshold
            ? this._discountFeePerCase * quantity
            : this._feePerCase * quantity;
    }
}

class ShippingCostCalculatorFreeViaAllProductsCost implements IShippingCostCalculator {
    private _discountThreshold: number;
    private _feePerCase: number;

    constructor(discountThreshold: number, feePerCase: number) {
        this._discountThreshold = discountThreshold;
        this._feePerCase = feePerCase;
    }

    calculateCost(allProductsCost: number, quantity: number): number {
        return allProductsCost > this._discountThreshold ? 0 : this._feePerCase * quantity;
    }
}

export {
    IShippingCostCalculator,
    ShippingCostCalculatorViaAllProductsCost,
    ShippingCostCalculatorFreeViaAllProductsCost,
};

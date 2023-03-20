class Coupon {
    private _maxDiscountAmount: number;
    private _maxDiscountRate: number;

    constructor(maxDiscountAmount: number, maxDiscountRate: number) {
        this._maxDiscountAmount = maxDiscountAmount;
        this._maxDiscountRate = maxDiscountRate;
    }

    get() {
        return {
            maxDiscountAmount: this._maxDiscountAmount,
            maxDiscountRate: this._maxDiscountRate,
        };
    }
}

interface ICouponDiscountCalculator {
    calculateDiscount(productsFullPrice: number): number;
}

class CouponDiscountCalculator implements ICouponDiscountCalculator {
    private _coupon: Coupon;

    constructor(coupon: Coupon) {
        this._coupon = coupon;
    }   

    calculateDiscount(productsFullPrice: number) {
        const availableDiscountViaRate = productsFullPrice * this._coupon.get().maxDiscountRate;
        const availableDiscountViaAmount = this._coupon.get().maxDiscountAmount;

        return Math.min(availableDiscountViaRate, availableDiscountViaAmount);
    }
}

export { Coupon, ICouponDiscountCalculator, CouponDiscountCalculator };

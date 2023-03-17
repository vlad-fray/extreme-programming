// Bad Code
function priceOrder(
    product: {
        basePrice: number;
        discountRate: number;
        discountThreshold: number;
    },
    quantity: number,
    shippingMethod: {
        discountThreshold: number;
        discountFee: number;
        feePerCase: number;
    }
) {
    const basePrice = product.basePrice * quantity;

    const discount =
        Math.max(quantity - product.discountThreshold, 0) *
        product.basePrice *
        product.discountRate;

    const shippingPerCase =
        basePrice > shippingMethod.discountThreshold
            ? shippingMethod.discountFee
            : shippingMethod.feePerCase;

    const shippingCost = quantity * shippingPerCase;

    return basePrice - discount + shippingCost;
}

export { priceOrder };
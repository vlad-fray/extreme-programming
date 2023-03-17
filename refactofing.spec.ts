import { uid } from 'uid';

describe('Test refactoring', () => {
    it('Final result is the same', () => {
        const productBasePrice = 300;
        const productDiscountRate = 0.1;
        const productDiscountThreshold = 7;
        const productsQuantity = 8;
        const shippingDiscountThreshold = 1000;
        const shippingDiscountFeePerCase = 50;
        const shippingFeePerCase = 70;

        const priceViaBadMethod = priceOrder(
            {
                basePrice: productBasePrice,
                discountRate: productDiscountRate,
                discountThreshold: productDiscountThreshold,
            },
            productsQuantity,
            {
                discountThreshold: shippingDiscountThreshold,
                discountFee: shippingDiscountFeePerCase,
                feePerCase: shippingFeePerCase,
            }
        );

        const productDiscountCalculator = new ProductDiscountCalculatorViaQuantity(
            productDiscountThreshold,
            productDiscountRate
        );

        const shippingCostCalculator = new ShippingCostCalculatorViaAllProductsCost(
            shippingDiscountThreshold,
            shippingDiscountFeePerCase,
            shippingFeePerCase
        );

        const orderCalculator = new OrderCalculator(
            productDiscountCalculator,
            shippingCostCalculator
        );

        const product = new Product('Chair', productBasePrice);
        orderCalculator.addProductToCart(product, productsQuantity);
        const priceViaMyMethod = orderCalculator.calculateOrder();

        expect(priceViaBadMethod).toBe(priceViaMyMethod);
    });
});

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

// My Code
abstract class AbstractProductDiscountCalculator {
    discountThreshold: number;
    discountRate: number;

    constructor(discountThreshold: number, discountRate: number) {
        this.discountThreshold = discountThreshold;
        this.discountRate = discountRate;
    }

    abstract calculateDiscount(baseProductPrice: number, quantity: number): number;
}

abstract class AbstractShippingCostCalculator {
    discountThreshold: number;
    discountFeePerCase: number;
    feePerCase: number;

    constructor(discountThreshold: number, discountFeePerCase: number, feePerCase: number) {
        this.discountThreshold = discountThreshold;
        this.discountFeePerCase = discountFeePerCase;
        this.feePerCase = feePerCase;
    }

    abstract calculateCost(allProductsCost: number, quantity: number): number;
}

class ProductDiscountCalculatorViaQuantity extends AbstractProductDiscountCalculator {
    constructor(discountThreshold: number, discountRate: number) {
        super(discountThreshold, discountRate);
    }

    calculateDiscount(baseProductPrice: number, quantity: number): number {
        return (
            Math.max(quantity - this.discountThreshold, 0) * baseProductPrice * this.discountRate
        );
    }
}

class ShippingCostCalculatorViaAllProductsCost extends AbstractShippingCostCalculator {
    constructor(discountThreshold: number, discountFeePerCase: number, feePerCase: number) {
        super(discountThreshold, discountFeePerCase, feePerCase);
    }

    calculateCost(allProductsCost: number, quantity: number): number {
        return allProductsCost > this.discountThreshold
            ? this.discountFeePerCase * quantity
            : this.feePerCase * quantity;
    }
}

class Product {
    id: string;
    name: string;
    basePrice: number;

    constructor(name: string, basePrise: number) {
        this.id = uid();
        this.name = name;
        this.basePrice = basePrise;
    }
}

class OrderCalculator {
    private _cart: { productInfo: Product; quantity: number }[] = [];
    productDiscountCalculator: AbstractProductDiscountCalculator;
    shippingCostCalculator: AbstractShippingCostCalculator;

    constructor(
        discountCalculator: AbstractProductDiscountCalculator,
        shippingCostCalculator: AbstractShippingCostCalculator
    ) {
        this.productDiscountCalculator = discountCalculator;
        this.shippingCostCalculator = shippingCostCalculator;
    }

    addProductToCart(product: Product, quantity?: number) {
        const isAlreadyInCart = !!this._cart.find((item) => item.productInfo.id === product.id);

        if (isAlreadyInCart) {
            this._cart = this._cart.map((item) => {
                if (item.productInfo.id === product.id) {
                    return { ...item, quantity: (item.quantity += quantity ?? 1) };
                }

                return item;
            });
        } else {
            this._cart.push({ productInfo: product, quantity: quantity ?? 1 });
        }
    }

    calculateOrder() {
        return this._cart.reduce((acc, product) => {
            const allProductsCost = product.productInfo.basePrice * product.quantity;

            const discount = this.productDiscountCalculator.calculateDiscount(
                product.productInfo.basePrice,
                product.quantity
            );

            const shippingCost = this.shippingCostCalculator.calculateCost(
                allProductsCost,
                product.quantity
            );

            return acc + allProductsCost - discount + shippingCost;
        }, 0);
    }
}

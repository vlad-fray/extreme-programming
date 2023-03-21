import { priceOrder } from './refac.bad-code-example';

import {
    ProductDiscountCalculatorDecoratedWithCoupon,
    ProductDiscountCalculatorViaOrder,
    ProductDiscountCalculatorViaQuantity,
} from './refac.discount-calculator';
import {
    ShippingCostCalculatorFreeViaAllProductsCost,
    ShippingCostCalculatorViaAllProductsCost,
} from './refac.shipping-cost';
import { EShippingCostType, OrderCalculator } from './refac.order-calculator';
import { Product } from './refac.product';
import { Cart } from './refac.cart';
import { Coupon, CouponDiscountCalculator } from './refac.coupon';

// Добавить 2 новых вида скидки на товары:
// + 1) Каждый n - бесплатный
// + 2) Скидки по купону (maxDiscountAmount: number, maxDiscountRate: number)

// Добавить новый вид высчитывания стоимости доставки
// + Бесплатная доставка свыше суммы N с учётом скидки на товары и без её учёта

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

        const cart = new Cart(orderCalculator);
        const product = new Product('Chair', productBasePrice);
        cart.addProductToCart(product, productsQuantity);

        const priceViaMyMethod = cart.getCartPrice();

        expect(priceViaBadMethod).toBe(priceViaMyMethod);
    });

    it('Every n is free', () => {
        const productBasePrice = 300;
        const productFreeElementOrder = 3;
        const productsQuantity = 8;
        const shippingDiscountThreshold = 1000;
        const shippingDiscountFeePerCase = 50;
        const shippingFeePerCase = 70;

        const productDiscountCalculator = new ProductDiscountCalculatorViaOrder(
            productFreeElementOrder
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

        const cart = new Cart(orderCalculator);
        const product = new Product('Chair', productBasePrice);
        cart.addProductToCart(product, productsQuantity);

        const priceViaMyMethod = cart.getCartPrice();

        expect(priceViaMyMethod).toBe(300 * 8 - 300 * 2 + 50 * 8);
    });

    it('Every n is free with coupon', () => {
        const productBasePrice = 300;
        const productFreeElementOrder = 3;
        const productsQuantity = 8;
        const shippingDiscountThreshold = 1000;
        const shippingDiscountFeePerCase = 50;
        const shippingFeePerCase = 70;

        const productDiscountCalculator = new ProductDiscountCalculatorViaOrder(
            productFreeElementOrder
        );

        const couponDiscountCalculator = new CouponDiscountCalculator(new Coupon(300, 0.5));

        const decoratedProductDiscountCalculator = new ProductDiscountCalculatorDecoratedWithCoupon(
            productDiscountCalculator,
            couponDiscountCalculator
        );

        const shippingCostCalculator = new ShippingCostCalculatorViaAllProductsCost(
            shippingDiscountThreshold,
            shippingDiscountFeePerCase,
            shippingFeePerCase
        );

        const orderCalculator = new OrderCalculator(
            decoratedProductDiscountCalculator,
            shippingCostCalculator
        );

        const cart = new Cart(orderCalculator);
        const product = new Product('Chair', productBasePrice);
        cart.addProductToCart(product, productsQuantity);

        const priceViaMyMethod = cart.getCartPrice();

        expect(priceViaMyMethod).toBe(300 * 8 - 300 * 2 - 300 + 50 * 8);
    });

    describe('Shipping cost is free after N', () => {
        const productBasePrice = 300;
        const productFreeElementOrder = 3;
        const productsQuantity = 8;
        const shippingDiscountThresholdFree = 0;
        const shippingDiscountThresholdFullPrice = 100000;
        const shippingFeePerCase = 70;

        const product = new Product('Chair', productBasePrice);
        const productDiscountCalculator = new ProductDiscountCalculatorViaOrder(
            productFreeElementOrder
        );

        it('Shipping is free', () => {
            const shippingCostCalculatorFree = new ShippingCostCalculatorFreeViaAllProductsCost(
                shippingDiscountThresholdFree,
                shippingFeePerCase
            );

            const orderCalculatorFreeShipping = new OrderCalculator(
                productDiscountCalculator,
                shippingCostCalculatorFree
            );

            const cartFreeShipping = new Cart(orderCalculatorFreeShipping);
            cartFreeShipping.addProductToCart(product, productsQuantity);
            const priceFreeShipping = cartFreeShipping.getCartPrice();

            expect(priceFreeShipping).toBe(300 * 8 - 300 * 2);
        });

        it('Shipping is full price', () => {
            const shippingCostCalculatorFull = new ShippingCostCalculatorFreeViaAllProductsCost(
                shippingDiscountThresholdFullPrice,
                shippingFeePerCase
            );

            const orderCalculatorShippingWithCost = new OrderCalculator(
                productDiscountCalculator,
                shippingCostCalculatorFull
            );

            const cartShippingWithCost = new Cart(orderCalculatorShippingWithCost);
            cartShippingWithCost.addProductToCart(product, productsQuantity);
            const priceShippingWithCost = cartShippingWithCost.getCartPrice();

            expect(priceShippingWithCost).toBe(300 * 8 - 300 * 2 + 70 * 8);
        });
    });

    describe('Shipping via what amount', () => {
        const productBasePrice = 300;
        const productFreeElementOrder = 3;
        const productsQuantity = 8;
        const shippingDiscountThreshold = 2000;
        const shippingDiscountFeePerCase = 50;
        const shippingFeePerCase = 70;

        const product = new Product('Chair', productBasePrice);
        const productDiscountCalculator = new ProductDiscountCalculatorViaOrder(
            productFreeElementOrder
        );

        it('Via full cost', () => {
            const shippingCostCalculator = new ShippingCostCalculatorViaAllProductsCost(
                shippingDiscountThreshold,
                shippingDiscountFeePerCase,
                shippingFeePerCase
            );

            const orderCalculator = new OrderCalculator(
                productDiscountCalculator,
                shippingCostCalculator,
                EShippingCostType.withoutDiscounts
            );

            const cart = new Cart(orderCalculator);
            cart.addProductToCart(product, productsQuantity);

            const priceViaMyMethod = cart.getCartPrice();

            expect(priceViaMyMethod).toBe(300 * 8 - 300 * 2 + 50 * 8);
        });

        it('Via discount cost', () => {
            const shippingCostCalculator = new ShippingCostCalculatorViaAllProductsCost(
                shippingDiscountThreshold,
                shippingDiscountFeePerCase,
                shippingFeePerCase
            );

            const orderCalculator = new OrderCalculator(
                productDiscountCalculator,
                shippingCostCalculator,
                EShippingCostType.viaFinalCost
            );

            const cart = new Cart(orderCalculator);
            cart.addProductToCart(product, productsQuantity);

            const priceViaMyMethod = cart.getCartPrice();

            expect(priceViaMyMethod).toBe(300 * 8 - 300 * 2 + 70 * 8);
        });
    });
});

describe('Calculates', () => {
    const productBasePrice = 300;
    const productDiscountRate = 0.1;
    const shippingDiscountFeePerCase = 50;
    const shippingFeePerCase = 70;
    const product = new Product('Chair', productBasePrice);

    const calculatePrice = (
        productDiscountThreshold: number,
        productsQuantity: number,
        shippingDiscountThreshold: number,
        shippingCostType?: EShippingCostType,
    ) => {
        const productDiscountCalculator = new ProductDiscountCalculatorViaQuantity(
            productDiscountThreshold,
            productDiscountRate,
        );

        const shippingCostCalculator = new ShippingCostCalculatorViaAllProductsCost(
            shippingDiscountThreshold,
            shippingDiscountFeePerCase,
            shippingFeePerCase,
        );

        const orderCalculator = new OrderCalculator(
            productDiscountCalculator,
            shippingCostCalculator,
            shippingCostType,
        );

        const cart = new Cart(orderCalculator);
        cart.addProductToCart(product, productsQuantity);
        return cart.getCartPrice();
    }

    describe('Old shipping formula, ignore the discount', () => {
        it('No product`s discount. Hasn`t shipping discount because threshold is more than full product`s price', () => {
            expect(calculatePrice(7, 6, 6 * productBasePrice + 1, EShippingCostType.withoutDiscounts))
                .toBe(6 * productBasePrice + 70 * 6);
        });

        it('No product`s discount. Has shipping discount because threshold is less than full product`s price', () => {
            expect(calculatePrice(7, 6, 6 * productBasePrice - 1, EShippingCostType.withoutDiscounts))
                .toBe(6 * productBasePrice + shippingDiscountFeePerCase * 6);
        });

        it('Has product`s discount. Hasn`t shipping discount because threshold is more than full product`s price', () => {
            expect(calculatePrice(7, 8, 8 * productBasePrice + 1, EShippingCostType.withoutDiscounts))
                .toBe(8 * productBasePrice - (8 - 7) * productBasePrice * productDiscountRate + 70 * 8);
        });

        it('Has product`s discount. Has shipping discount because threshold is less than full product`s price', () => {
            expect(calculatePrice(7, 8, 8 * productBasePrice - 1, EShippingCostType.withoutDiscounts))
                .toBe(8 * productBasePrice - (8 - 7) * productBasePrice * productDiscountRate + shippingDiscountFeePerCase * 8);
        });
    });

    describe('Old shipping formula, take into account the discount', () => {
        it('No product`s discount. Hasn`t shipping discount because threshold is more than full product`s price', () => {
            expect(calculatePrice(7, 6, 6 * productBasePrice + 1, EShippingCostType.viaFinalCost))
                .toBe(6 * productBasePrice + 70 * 6);
        });

        it('No product`s discount. Has shipping discount because threshold is less than full product`s price', () => {
            expect(calculatePrice(7, 6, 6 * productBasePrice - 1, EShippingCostType.viaFinalCost))
                .toBe(6 * productBasePrice + shippingDiscountFeePerCase * 6);
        });

        it('Has product`s discount. Hasn`t shipping discount because threshold is more than full product`s price', () => {
            expect(calculatePrice(7, 8, 8 * productBasePrice + 1, EShippingCostType.viaFinalCost))
                .toBe(8 * productBasePrice - (8 - 7) * productBasePrice * productDiscountRate + 70 * 8);
        });

        it('Has product`s discount. Hasn`t shipping discount because threshold is less than full product`s price but more than discount price', () => {
            expect(calculatePrice(7, 8, 8 * productBasePrice - 1, EShippingCostType.viaFinalCost))
                .toBe(8 * productBasePrice - (8 - 7) * productBasePrice * productDiscountRate + 70 * 8);
        });

        it('Has product`s discount. Has shipping discount because threshold is less than discount price', () => {
            expect(calculatePrice(7, 8, 8 * productBasePrice - 400, EShippingCostType.viaFinalCost))
                .toBe(8 * productBasePrice - (8 - 7) * productBasePrice * productDiscountRate + shippingDiscountFeePerCase * 8);
        });
    });
});

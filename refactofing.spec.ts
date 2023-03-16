// Bad Code
function badPriceOrder(
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
    },
) {
    const basePrice = product.basePrice * quantity;
    
    const discount = Math.max(quantity - product.discountThreshold, 0)
        * product.basePrice * product.discountRate;

    const shippingPerCase = basePrice > shippingMethod.discountThreshold
        ? shippingMethod.discountFee : shippingMethod.feePerCase;
    
    const shippingCost = quantity * shippingPerCase;

    return basePrice - discount + shippingCost;
}

// Good Code
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

    abstract calculateCost(allProductsCost: number): number;
}

class ProductDiscountCalculatorViaQuantity extends AbstractProductDiscountCalculator {
    constructor(discountThreshold: number, discountRate: number) {
        super(discountThreshold, discountRate);
    }

    calculateDiscount(baseProductPrice: number, quantity: number): number {
        return Math.max(quantity - this.discountThreshold, 0)
            * baseProductPrice * this.discountRate;
    }
}

class ShippingCostCalculatorViaAllProductsCost extends AbstractShippingCostCalculator {
    constructor(discountThreshold: number, discountFeePerCase: number, feePerCase: number) {
        super(discountThreshold, discountFeePerCase, feePerCase);
    }

    calculateCost(allProductsCost: number): number {
        return allProductsCost > this.discountThreshold
            ? this.discountFeePerCase : this.feePerCase;
    }
}

class Product {
    name: string;
    basePrice: number;
    discountCalculator: AbstractProductDiscountCalculator; 

    constructor(name: string, basePrise: number, discountCalculator: AbstractProductDiscountCalculator) {
        this.name = name;
        this.basePrice = basePrise;
        this.discountCalculator = discountCalculator;
    }
}

interface IShoppingCartItem {
    productInfo: Product;
    quantity: number;
}

class OrderCalculator {
    cart: IShoppingCartItem[]
    discountCalculator: AbstractProductDiscountCalculator;
    shippingCostCalculator: AbstractShippingCostCalculator;

    constructor(
        cart: IShoppingCartItem[],
        discountCalculator: AbstractProductDiscountCalculator,
        shippingCostCalculator: AbstractShippingCostCalculator,
    ) {
        this.cart = cart;
        this.discountCalculator = discountCalculator;
        this.shippingCostCalculator = shippingCostCalculator;
    }

    calculateOrder() {
        return this.cart.reduce((acc, product) => {
            const allProductsCost = product.productInfo.basePrice * product.quantity;
            const discount = this.discountCalculator.calculateDiscount(product.productInfo.basePrice, product.quantity);
            const shippingCost = this.shippingCostCalculator.calculateCost(allProductsCost);

            return allProductsCost - discount + shippingCost;
        }, 0)
    }
}

const productDiscountCalculator = new ProductDiscountCalculatorViaQuantity(5, 0.1);
const product = new Product('Chair', 500, productDiscountCalculator);
const shippingCostCalculator = new ShippingCostCalculatorViaAllProductsCost(1000, 50, 100);
const orderCalculator = new OrderCalculator()
priceOrder(product, 7, shippingCostCalculator)
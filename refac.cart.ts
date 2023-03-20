import { IOrderCalculator } from "./refac.order-calculator";
import { Product } from "./refac.product";

class Cart {
    private _cart: { productInfo: Product; quantity: number }[] = [];
    private _orderCalculator: IOrderCalculator;

    constructor(orderCalculator: IOrderCalculator) {
        this._orderCalculator = orderCalculator;
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

    getCartPrice() {
        return this._orderCalculator.calculateOrder(this._cart);
    }
}

export { Cart };
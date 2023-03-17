import { uid } from "uid";

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

export { Product };
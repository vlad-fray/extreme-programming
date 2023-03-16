describe('Test', () => {
    it('Multiplication', () => {
        const fiveBucks = Money.dollar(5);
        expect(fiveBucks.times(3).equals(Money.dollar(15))).toBe(true);
    });

    it('Currencies', () => {
        expect(Money.dollar(1).get().currency).toBe('USD');
        expect(Money.franc(1).get().currency).toBe('CHF');
    });

    it('Equality', () => {
        expect(Money.dollar(5).equals(Money.dollar(5))).toBeTruthy();
        expect(Money.franc(5).equals(Money.franc(5))).toBeTruthy();
        expect(Money.dollar(5).equals(Money.dollar(6))).toBeFalsy();
    });

    it('Reduce sum', () => {
        const sum = new Sum(Money.dollar(3), Money.dollar(4));
        const bank = new Bank();
        const result = bank.reduce(sum, 'USD');
        expect(Money.dollar(7).equals(result)).toBeTruthy();
    });

    it('Plus returns sum', () => {
        const five = Money.dollar(5);
        const result = five.plus(five);
        const sum = new Sum(result.augend, result.addend);
        expect(five.equals(sum.augend)).toBeTruthy();
        expect(five.equals(sum.addend)).toBeTruthy();
    });

    it('Checks hashcode func', () => {
        const bank = new Bank();
        bank.addRate('USD', 'CHF', 2);
        expect(bank.rate('USD', 'USD')).toBe(1);
        expect(bank.rate('USD', 'CHF')).toBe(2);
        expect(bank.rate('CHF', 'USD')).toBe(1 / 2);
    });

    it('Test identity rate', () => {
        expect(new Bank().rate('USD', 'USD')).toBe(1);
    });

    it('Reduces money with different currency', () => {
        const bank = new Bank();
        bank.addRate('CHF', 'USD', 2);
        const result: IExpression = bank.reduce(Money.franc(2), 'USD');
        expect(Money.dollar(1).equals(result)).toBeTruthy();
    });

    it('Mixed addition', () => {
        const fiveBucks: IExpression = Money.dollar(5);
        const tenFrancs: IExpression = Money.franc(10);
        const bank = new Bank();
        bank.addRate('CHF', 'USD', 2);
        const sum = new Sum(fiveBucks, tenFrancs).plus(fiveBucks);
        const result = bank.reduce(sum, 'USD');
        expect(Money.dollar(15).equals(result)).toBeTruthy();
    });

    it('Sum times', () => {
        const fiveBucks: IExpression = Money.dollar(5);
        const tenFrancs: IExpression = Money.franc(10);
        const bank = new Bank();
        bank.addRate('CHF', 'USD', 2);
        const sum = new Sum(fiveBucks, tenFrancs).times(2);
        const result = bank.reduce(sum, 'USD');
        expect(Money.dollar(20).equals(result)).toBeTruthy();
    });
});

class Pair {
    private _from: string;
    private _to: string;

    constructor(from: string, to: string) {
        this._from = from;
        this._to = to;
    }

    equals(object: { from: string; to: string }) {
        return this._from === object.from && this._to === object.to;
    }

    getHashCode() {
        return `${this._from}-${this._to}`;
    }
}

class Bank {
    private _rates: { [key: string]: number } = {};

    addRate(from: string, to: string, rate: number) {
        this._rates[new Pair(from, to).getHashCode()] = rate;
        this._rates[new Pair(to, from).getHashCode()] = 1 / rate;
    }

    rate(from: string, to: string): number | null {
        if (from === to) {
            return 1;
        }

        return this._rates[new Pair(from, to).getHashCode()] ?? null;
    }

    reduce(source: IExpression, to: string): Money {
        return source.reduce(this, to);
    }
}

interface IExpression {
    reduce(bank: Bank, to: string): Money;
    plus(addend: IExpression): IExpression;
    times(multiplier: number): IExpression;
    equals(addend: IExpression): boolean;
}

class Money implements IExpression {
    private _amount: number;
    private _currency: string;

    constructor(amount: number, currency: string) {
        this._amount = amount;
        this._currency = currency;
    }

    static dollar(amount: number) {
        return new Money(amount, 'USD');
    }

    static franc(amount: number) {
        return new Money(amount, 'CHF');
    }

    get() {
        return {
            amount: this._amount,
            currency: this._currency,
        };
    }

    equals(object: Object) {
        if (!(object instanceof Money)) return false;
        return object.get().amount === this._amount && object.get().currency === this._currency;
    }

    times(muliplier: number): IExpression {
        return new Money(this._amount * muliplier, this._currency);
    }

    plus(addend: IExpression) {
        return new Sum(this, addend);
    }

    reduce(bank: Bank, to: string): Money {
        const rate = bank.rate(this._currency, to);
        return rate ? new Money(this._amount / rate, to) : new Money(0, to);
    }
}

class Sum implements IExpression {
    augend: IExpression;
    addend: IExpression;

    constructor(augend: IExpression, addend: IExpression) {
        this.augend = augend;
        this.addend = addend;
    }

    reduce(bank: Bank, to: string): Money {
        const amount =
            this.augend.reduce(bank, to).get().amount + this.addend.reduce(bank, to).get().amount;
        return new Money(amount, to);
    }

    plus(addend: IExpression): IExpression {
        return new Sum(this, addend);
    }

    times(multiplier: number) {
        return new Sum(this.augend.times(multiplier), this.addend.times(multiplier));
    }

    equals(object: IExpression): boolean {
        if (!(object instanceof Sum)) return false;
        return this.augend.equals(object.augend) && this.addend.equals(object.addend);
    }
}

export interface Order {
    _id: string;
    userId: string;
    cardNumber: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    cardCvv: string;
    storeCreditDetails: boolean;
}

export interface Flight {
    cid: string;
    flight_num: string;
    departure: string;
    destination: string;
    carrier_id: string;
    departure_datetime: Date;
    arrival_datetime: Date;
    airline_type: string;
    max_capacity: number;
    current_capacity: number;
    price_per_ticket: number;
}
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

import { environment } from "src/environments/environment";
import { Airline } from "../models/airline";
import { Flight } from "../models/flight";
import { Order } from "../models/order";
import { State } from "../models/state";
import { TravelRoute } from "../models/travel-route";

@Injectable({
    providedIn: "root",
})
export class HttpService {
    private apiBaseUrl = environment.backendBaseUrl;

    constructor(private httpClient: HttpClient) {}

    getAirlines(): Observable<Airline[]> {
        return this.httpClient.get<Airline[]>(
            `${this.apiBaseUrl}/airlines/get`
        );
    }

    getFlights(): Observable<Flight[]> {
        return this.httpClient.get<Flight[]>(`${this.apiBaseUrl}/flights/get`);
    }

    getFlightById(cid: string): Observable<Flight> {
        return this.httpClient.get<Flight>(
            `${this.apiBaseUrl}/flights/get/${cid}`
        );
    }

    getState(): Observable<State[]> {
        return this.httpClient.get<State[]>(`${this.apiBaseUrl}/states/get`);
    }

    getTravelRoutes(): Observable<TravelRoute[]> {
        return this.httpClient.get<TravelRoute[]>(
            `${this.apiBaseUrl}/travelRoutes/get`
        );
    }

    searchFlights(
        departure: string,
        destination: string,
        departure_datetime: string,
        arrival_datetime: string
    ): Observable<Flight[]> {
        const headers = new HttpHeaders().set(
            "Content-Type",
            "application/x-www-form-urlencoded"
        );

        const params = new HttpParams()
            .set("departure", departure)
            .set("destination", destination)
            .set("departure_datetime", departure_datetime)
            .set("arrival_datetime", arrival_datetime);

        return this.httpClient.get<Flight[]>(
            `${this.apiBaseUrl}/flights/search`,
            {
                headers: headers,
                params: params,
            }
        );
    }

    searchTravelRoutes(from: string, to: string): Observable<TravelRoute> {
        const headers = new HttpHeaders().set(
            "Content-Type",
            "application/x-www-form-urlencoded"
        );

        const params = new HttpParams().set("from", from).set("to", to);

        return this.httpClient.get<TravelRoute>(
            `${this.apiBaseUrl}/travelRoutes/search`,
            {
                headers: headers,
                params: params,
            }
        );
    }

    createFlight(flight: Flight): Observable<Flight> {
        return this.httpClient.post<Flight>(
            `${this.apiBaseUrl}/flights/create`,
            flight
        );
    }

    updateFlight(flight: Flight): Observable<Flight> {
        return this.httpClient.put<Flight>(
            `${this.apiBaseUrl}/flights/update`,
            flight
        );
    }

    deleteFlight(cid: string): Observable<void> {
        const options = {
            headers: new HttpHeaders({
                "Content-Type": "application/json",
            }),
            body: {
                cid,
            },
        };

        return this.httpClient
            .delete(`${this.apiBaseUrl}/flights/delete`, options)
            .pipe(map((res) => void 0));
    }

    createOrder(order: Order): Observable<Order> {
        return this.httpClient.post<Order>(
            `${this.apiBaseUrl}/orders/create`,
            order
        );
    }
}

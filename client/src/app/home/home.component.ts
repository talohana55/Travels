import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
    delay,
    finalize,
    forkJoin,
    map,
    Observable,
    shareReplay,
    startWith,
} from "rxjs";
import { State } from "../models/state";
import { first, tap } from "rxjs";
import { HttpService } from "../services/http.service";

import * as moment from "moment/moment";
import { Flight } from "../models/flight";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TravelRoute } from "../models/travel-route";
import { FadeIn } from "../core/animations/animations";
import { Router } from "@angular/router";

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"],
    animations: [FadeIn(200)],
})
export class HomeComponent implements OnInit {
    readonly defaultImage = "assets/logo.png";
    dateRange!: FormGroup;
    states: State[] = [];
    results: Flight[] = [];
    travelRoutes: TravelRoute[] = [];
    connectionResultsMap!: Map<number, Flight[]>;
    searching = false;

    ticketsCtrl = new FormControl(2, [
        Validators.required,
        Validators.min(1),
        Validators.max(100),
    ]);

    connectionFlightCtrl = new FormControl(false);
    roundTripCtrl = new FormControl(false);

    fromStateCtrl = new FormControl("", [Validators.required]);
    fromFilteredStates$!: Observable<State[]>;

    toStateCtrl = new FormControl("", [Validators.required]);
    toFilteredStates$!: Observable<State[]>;

    constructor(
        private router: Router,
        private snackBar: MatSnackBar,
        private httpService: HttpService
    ) {}

    ngOnInit() {
        this.httpService
            .getTravelRoutes()
            .pipe(
                first(),
                tap((res) => (this.travelRoutes = res))
            )
            .subscribe();

        this.httpService
            .getState()
            .pipe(
                first(),
                tap(
                    (states) => (this.states = [this.flexibleState, ...states])
                ),
                tap(() => this.initForm()),
                shareReplay()
            )
            .subscribe();
    }

    get formInvalid(): boolean {
        return (
            this.fromStateCtrl?.invalid ||
            this.toStateCtrl?.invalid ||
            this.dateRange?.invalid ||
            this.ticketsCtrl?.invalid
        );
    }

    get flexibleState(): State {
        return {
            cid: "anywhere",
            cityName: "anywhere",
            flag: "anywhere",
            state: "anywhere",
        } as State;
    }

    search() {
        this.results = [];
        this.searching = true;

        const startDate = moment(this.dateRange.value.start)
            .startOf("day")
            .toDate()
            .getTime();

        const endDate = moment(this.dateRange.value.end)
            .startOf("day")
            .toDate()
            .getTime();

        if (this.connectionFlightCtrl.value) {
            this.connectionFlightsStream(
                startDate,
                endDate,
                this.roundTripCtrl.value ?? false
            );
        } else {
            if (this.roundTripCtrl.value) {
                forkJoin([
                    this.httpService.searchFlights(
                        "" + this.fromStateCtrl.value,
                        "" + this.toStateCtrl.value,
                        "" + startDate,
                        "" + endDate
                    ),
                    this.httpService.searchFlights(
                        "" + this.toStateCtrl.value,
                        "" + this.fromStateCtrl.value,
                        "" + startDate,
                        ""
                    ),
                ])
                    .pipe(
                        delay(3000),
                        first(),
                        map((results) =>
                            results.reduce(
                                (all, itm: any) => all.concat(itm),
                                []
                            )
                        ),
                        tap((res) => this.setSearchResults(res)),
                        finalize(() => (this.searching = false))
                    )
                    .subscribe();
            } else {
                this.httpService
                    .searchFlights(
                        "" + this.fromStateCtrl.value,
                        "" + this.toStateCtrl.value,
                        "" + startDate,
                        "" + endDate
                    )
                    .pipe(
                        delay(3000),
                        first(),
                        tap((res) => this.setSearchResults(res)),
                        finalize(() => (this.searching = false))
                    )
                    .subscribe();
            }
        }
    }

    private connectionFlightsStream(
        startDate: number,
        endDate: number,
        roundTrip: boolean
    ): void {
        let forkArr = [];
        if (
            "" + this.fromStateCtrl.value === "anywhere" &&
            "" + this.toStateCtrl.value === "anywhere"
        ) {
            forkArr = [
                this.httpService.searchFlights(
                    "" + this.fromStateCtrl.value,
                    "" + this.toStateCtrl.value,
                    "" + startDate,
                    "" + endDate
                ),
            ];
        } else {
            forkArr = [
                this.httpService.searchFlights(
                    "" + this.fromStateCtrl.value,
                    "" + this.toStateCtrl.value,
                    "" + startDate,
                    "" + endDate
                ),
                this.httpService.searchFlights(
                    "" + this.fromStateCtrl.value,
                    "anywhere",
                    "" + startDate,
                    "" + endDate
                ),
                this.httpService.searchFlights(
                    "anywhere",
                    "" + this.toStateCtrl.value,
                    "" + startDate,
                    "" + endDate
                ),
            ];
        }

        if (roundTrip) {
            if (
                "" + this.fromStateCtrl.value === "anywhere" &&
                "" + this.toStateCtrl.value === "anywhere"
            ) {
                forkArr = forkArr.concat([
                    this.httpService.searchFlights(
                        "" + this.toStateCtrl.value,
                        "" + this.fromStateCtrl.value,
                        "" + startDate,
                        ""
                    ),
                ]);
            } else {
                forkArr = forkArr.concat([
                    this.httpService.searchFlights(
                        "" + this.toStateCtrl.value,
                        "" + this.fromStateCtrl.value,
                        "" + startDate,
                        ""
                    ),
                    this.httpService.searchFlights(
                        "anywhere",
                        "" + this.fromStateCtrl.value,
                        "" + startDate,
                        ""
                    ),
                    this.httpService.searchFlights(
                        "" + this.toStateCtrl.value,
                        "anywhere",
                        "" + startDate,
                        ""
                    ),
                ]);
            }
        }

        forkJoin(forkArr)
            .pipe(
                delay(3000),
                first(),
                map((results) =>
                    results.reduce((all, itm: any) => all.concat(itm), [])
                ),
                map((res) =>
                    this.searchConnectionFlights(
                        res,
                        "" + this.fromStateCtrl.value,
                        "" + this.toStateCtrl.value,
                        roundTrip
                    )
                ),
                finalize(() => (this.searching = false))
            )
            .subscribe();
    }

    private searchConnectionFlights(
        flights: Flight[],
        from: string,
        to: string,
        roundTrip: boolean
    ) {
        let map = new Map<number, Flight[]>();

        // direct flights
        const allFlights = flights.filter((f) => {
            if (from !== "anywhere" && to !== "anywhere") {
                return f.departure === from && f.destination === to;
            } else if (from === "anywhere" && to !== "anywhere") {
                return f.destination === to;
            } else if (from !== "anywhere" && to === "anywhere") {
                return f.departure === from;
            }

            return f;
        });
        for (let f of allFlights) {
            if (roundTrip) {
                const fl = flights.filter(
                    (f) => f.departure === to && f.destination === from
                );
                for (let fr of fl) {
                    map.set(map.size + 1, [f, fr]);
                }
            } else {
                map.set(map.size + 1, [f]);
            }
        }

        if (allFlights && roundTrip && map.size === 0) {
            for (let f of allFlights) {
                if (
                    !Array.from(map.values())
                        .map((f) => f[0].cid)
                        .includes(f.cid)
                ) {
                    map.set(map.size + 1, [f]);
                }
            }
        }

        // connection flights
        const fromFlights = flights.filter((f) => f.departure === from);
        for (let f of fromFlights) {
            const destenation = f.destination;
            const possibleConnection = flights.filter(
                (f) => f.departure === destenation && f.destination === to
            );
            for (let p of possibleConnection) {
                if (roundTrip) {
                    const toOptions = flights.filter((f) => f.departure === to);
                    for (let t of toOptions) {
                        const destenation = t.destination;
                        const pos = flights.filter(
                            (f) =>
                                f.departure === destenation &&
                                f.destination === from
                        );
                        for (let poo of pos) {
                            map.set(map.size + 1, [f, p, t, poo]);
                        }
                    }
                } else {
                    map.set(map.size + 1, [f, p]);
                }
            }
        }

        map = this.filterMapResults(map);

        if (!map?.size) {
            this.showNoResultsSnackbar();
        } else {
            this.connectionResultsMap = map;
        }
    }

    private filterMapResults(
        map: Map<number, Flight[]>
    ): Map<number, Flight[]> {
        let filterdMap = new Map<number, Flight[]>();
        for (let entry of map.entries()) {
            let arr = entry[1];
            if (arr.length > 4) {
                continue;
            }

            let error = false;
            for (let i = 0; i < arr.length - 1; i++) {
                if (
                    new Date(arr[i].arrival_datetime).getTime() >=
                    new Date(arr[i + 1].departure_datetime).getTime()
                ) {
                    error = true;
                    break;
                } else if (i === 0 || i === 2) {
                    const start = moment(arr[i + 1].departure_datetime);
                    const end = moment(arr[i].arrival_datetime);
                    var duration = moment.duration(start.diff(end));
                    var hours = duration.asHours();
                    if (hours > 12) {
                        // to much time to wait between connection flights
                        error = true;
                        break;
                    }
                }
            }
            if (error) {
                continue;
            }

            // check if tickets left
            if (
                arr.every(
                    (f) =>
                        f.max_capacity - f.current_capacity >=
                        +(this.ticketsCtrl.value || 0)
                )
            ) {
                filterdMap.set(filterdMap.size, entry[1]);
            }
        }

        return filterdMap;
    }

    private setSearchResults(res: Flight[]): void {
        this.results = res;
        if (!res?.length) {
            this.showNoResultsSnackbar();
        }
    }

    private showNoResultsSnackbar(): void {
        this.snackBar.open(
            "Sorry, we didn't find any flights for this search",
            undefined,
            {
                verticalPosition: "top",
                duration: 3000,
            }
        );
    }

    private initForm(): void {
        this.dateRange = new FormGroup({
            start: new FormControl<Date | null>(null, [Validators.required]),
            end: new FormControl<Date | null>(null, [Validators.required]),
        });

        this.fromFilteredStates$ = this.fromStateCtrl.valueChanges.pipe(
            startWith(""),
            map((state) =>
                state
                    ? this._filterStates(state)
                    : this.states
                          .slice()
                          .sort((a, b) => a.cityName.localeCompare(b.cityName))
            )
        );

        this.toFilteredStates$ = this.toStateCtrl.valueChanges.pipe(
            startWith(""),
            map((state) =>
                state
                    ? this._filterStates(state)
                    : this.states
                          .slice()
                          .sort((a, b) => a.cityName.localeCompare(b.cityName))
            )
        );
    }

    getTotalDuration(flights: Flight[]): string {
        let duration = 0;
        for (let flight of flights) {
            const travelRoute = this.travelRoutes?.find(
                (t) =>
                    t.from === flight.departure && t.to === flight.destination
            );
            if (travelRoute) {
                duration += +travelRoute.estimated_flight_time.split(" ")[0];
            }
        }
        return `${duration.toFixed(2)} hours`;
    }

    getTotalDistance(flights: Flight[]): string {
        let distance = 0;
        for (let flight of flights) {
            const travelRoute = this.travelRoutes?.find(
                (t) =>
                    t.from === flight.departure && t.to === flight.destination
            );
            if (travelRoute) {
                distance += +travelRoute.distance.split(" ")[0];
            }
        }
        return `${distance.toFixed(2)} km`;
    }

    getTotalPrice(flights: Flight[]): number {
        let total = 0;
        for (let flight of flights) {
            total += flight.price_per_ticket;
        }
        return total;
    }

    book(flights: Flight[]): void {
        sessionStorage.setItem("CHECKOUT_FLIGHTS", JSON.stringify(flights));
        sessionStorage.setItem(
            "CHECKOUT_TICKETS",

            JSON.stringify(this.ticketsCtrl.value)
        );
        this.router.navigate(["checkout"]);
    }

    private _filterStates(value: string): State[] {
        const filterValue = value.toLowerCase();

        return this.states
            .filter((state) => {
                const cityNameArr = state.cityName
                    .replace("-", " ")
                    .split(" ")
                    .filter(Boolean);
                const countryArr = state.state
                    .replace("-", " ")
                    .split(" ")
                    .filter(Boolean);

                return (
                    cityNameArr
                        .map((n) => n.toLowerCase())
                        .some((n) => filterValue.includes(n)) ||
                    countryArr
                        .map((n) => n.toLowerCase())
                        .some((n) => filterValue.includes(n))
                );
            })
            .sort((a, b) => a.cityName.localeCompare(b.cityName));
    }
}

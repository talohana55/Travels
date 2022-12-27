import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";
import {
    first,
    forkJoin,
    map,
    Observable,
    startWith,
    tap,
} from "rxjs";

import { FadeIn } from "src/app/core/animations/animations";
import { Airline } from "src/app/models/airline";
import { Flight } from "src/app/models/flight";
import { State } from "src/app/models/state";
import { TravelRoute } from "src/app/models/travel-route";
import { HttpService } from "src/app/services/http.service";

import * as moment from "moment/moment";

@Component({
    selector: "app-add-new-flight",
    templateUrl: "./add-new-flight.component.html",
    styleUrls: ["./add-new-flight.component.scss"],
    animations: [FadeIn(200)],
})
export class AddNewFlightComponent implements OnInit {
    readonly defaultImage = "assets/logo.png";
    private cid!: string;
    newRecord = true;
    formGroup!: FormGroup;
    states: State[] = [];
    airlines: Airline[] = [];
    travelRoutes: TravelRoute[] = [];
    fromFilteredStates$!: Observable<State[]> | undefined;
    toFilteredStates$!: Observable<State[]> | undefined;

    constructor(
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private httpService: HttpService
    ) {}

    ngOnInit(): void {
        const cid = this.route?.firstChild?.snapshot.params["cid"];
        this.cid = cid;
        if (this.cid) {
            this.newRecord = false;
        }
        this.getDataFromServer(cid);
    }

    private getDataFromServer(cid?: string) {
        let httpArr: any = [
            this.httpService.getState(),
            this.httpService.getTravelRoutes(),
            this.httpService.getAirlines(),
        ];
        if (cid) {
            httpArr.push(this.httpService.getFlightById(cid));
        }

        forkJoin(httpArr)
            .pipe(
                first(),
                tap((res: any) => (this.states = res[0])),
                tap((res: any) => (this.travelRoutes = res[1])),
                tap(
                    (res: any) =>
                        (this.airlines = res[2].sort((a: any, b: any) =>
                            a.name.localeCompare(b.name)
                        ))
                ),
                tap((res: any) =>
                    this.initFormGroup(res[3] ? res[3] : undefined)
                )
            )
            .subscribe();
    }

    private initFormGroup(flight?: Flight): void {
        this.formGroup = new FormGroup({
            departure: new FormControl(flight?.departure ?? "", [
                Validators.required,
            ]),
            destination: new FormControl(flight?.destination ?? "", [
                Validators.required,
            ]),
            carrier_id: new FormControl(flight?.carrier_id ?? "", [
                Validators.required,
            ]),
            departure_datetime: new FormControl(
                flight?.departure_datetime
                    ? moment(flight?.departure_datetime)
                          .toDate()
                          .toISOString()
                          .slice(0, 16)
                    : undefined,
                [Validators.required]
            ),
            arrival_datetime: new FormControl(
                flight?.arrival_datetime
                    ? moment(flight?.arrival_datetime)
                          .toDate()
                          .toISOString()
                          .slice(0, 16)
                    : undefined,
                [Validators.required]
            ),
            airline_type: new FormControl(flight?.airline_type ?? "", [
                Validators.required,
            ]),
            max_capacity: new FormControl(flight?.max_capacity ?? 100, [
                Validators.required,
            ]),
            current_capacity: new FormControl(flight?.current_capacity ?? 0, [
                Validators.required,
            ]),
            price_per_ticket: new FormControl(flight?.price_per_ticket ?? "", [
                Validators.required,
            ]),
        });

        this.fromFilteredStates$ = this.formGroup
            ?.get("departure")
            ?.valueChanges.pipe(
                startWith(""),
                map((state) =>
                    state
                        ? this._filterStates(state)
                        : this.states
                              .slice()
                              .sort((a, b) =>
                                  a.cityName.localeCompare(b.cityName)
                              )
                )
            );

        this.toFilteredStates$ = this.formGroup
            ?.get("destination")
            ?.valueChanges.pipe(
                startWith(""),
                map((state) =>
                    state
                        ? this._filterStates(state)
                        : this.states
                              .slice()
                              .sort((a, b) =>
                                  a.cityName.localeCompare(b.cityName)
                              )
                )
            );
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

    submit(): void {
        if (this.formGroup.valid) {
            if (this.newRecord) {
                this.httpService
                    .createFlight(this.formGroup.value)
                    .pipe(
                        first(),
                        tap((res) => console.log(res)),
                        tap((res) =>
                            this.snackBar.open(
                                "Great! we added the flight successfully!",
                                undefined,
                                {
                                    verticalPosition: "top",
                                    duration: 3000,
                                }
                            )
                        )
                    )
                    .subscribe();
            } else {
                this.httpService
                    .updateFlight({
                        cid: this.cid,
                        ...this.formGroup.value,
                    } as Flight)
                    .pipe(
                        first(),
                        tap((res) => console.log(res)),
                        tap((res) =>
                            this.snackBar.open(
                                "Great! we updated the flight successfully!",
                                undefined,
                                {
                                    verticalPosition: "top",
                                    duration: 3000,
                                }
                            )
                        )
                    )
                    .subscribe();
            }
        }
    }
}

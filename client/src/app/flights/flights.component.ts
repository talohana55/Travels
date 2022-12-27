import {
    AfterViewInit,
    Component,
    Input,
    OnInit,
    ViewChild,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";

import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { combineLatest, first, forkJoin, map, startWith, tap } from "rxjs";
import { FadeIn } from "../core/animations/animations";
import {
    TicketsDialog,
    TicketsDialogData,
} from "../core/tickets-dialog/tickets-dialog";
import { Airline } from "../models/airline";
import { Flight } from "../models/flight";
import { User, UserTypeEnum } from "../models/user";
import { HttpService } from "../services/http.service";

import * as moment from "moment";

@Component({
    selector: "app-flights",
    templateUrl: "./flights.component.html",
    styleUrls: ["./flights.component.scss"],
    animations: [FadeIn(200)],
})
export class FlightsComponent implements OnInit, AfterViewInit {
    readonly defaultImage = "assets/logo.png";

    displayedColumns: string[] = [
        "flight_num",
        "departure",
        "destination",
        "carrier_id",
        "departure_datetime",
        "arrival_datetime",
        "airline_type",
    ];
    dataSource!: MatTableDataSource<Flight>;
    airlines: Airline[] = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    loggedInUser!: User;
    carrierCtrl = new FormControl();
    countryCtrl = new FormControl();
    chipestFlightsFirstCtrl = new FormControl(true);

    @Input()
    flights!: Flight[];

    @Input()
    tickets!: number;

    @Input()
    disableBooking = false;

    @Input()
    disableFilter = false;

    @Input()
    disablePagination = false;

    @Input()
    disableAddNewFlight = false;

    constructor(
        private router: Router,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private httpService: HttpService
    ) {}

    ngOnInit(): void {
        const loggedInUserStr = sessionStorage.getItem("logged_in_user");
        if (loggedInUserStr) {
            this.loggedInUser = JSON.parse(loggedInUserStr) as User;
        }

        if (!this.disableBooking) {
            this.displayedColumns.push("options");
        }

        combineLatest([
            this.carrierCtrl.valueChanges.pipe(startWith("")),
            this.countryCtrl.valueChanges.pipe(startWith("")),
            this.chipestFlightsFirstCtrl.valueChanges.pipe(startWith("")),
        ])
            .pipe(tap(() => this.loadFlights()))
            .subscribe();
    }

    ngAfterViewInit(): void {
        if (!this.flights) {
            this.loadFlights();
        } else {
            this.httpService
                .getAirlines()
                .pipe(
                    first(),
                    tap(
                        (res) =>
                            (this.dataSource = new MatTableDataSource(
                                this.flights
                            ))
                    ),
                    tap((res) => (this.airlines = res)),
                    tap(
                        () =>
                            (this.dataSource.paginator = this.disablePagination
                                ? null
                                : this.paginator)
                    ),
                    tap(() => (this.dataSource.sort = this.sort))
                )
                .subscribe();
        }
    }

    private loadFlights(): void {
        forkJoin([
            this.httpService.getFlights(),
            this.httpService.getAirlines(),
        ])
            .pipe(
                first(),
                map((res) => this.loadDataSource(res[0], res[1]))
            )
            .subscribe();
    }

    private loadDataSource(flights: Flight[], airlines: Airline[]) {
        if (this.carrierCtrl.value && this.carrierCtrl.value !== "All") {
            const carrier = airlines.find(
                (a) => a.name === this.carrierCtrl.value
            );
            flights = flights.filter((f) => f.carrier_id === carrier?.cid);
        }
        if (this.countryCtrl.value && this.countryCtrl.value !== "All") {
            flights = flights.filter(
                (f) => f.destination === this.countryCtrl.value
            );
        }
        if (this.chipestFlightsFirstCtrl.value) {
            flights = flights.sort(
                (a, b) => a.price_per_ticket - b.price_per_ticket
            );
        }

        this.dataSource = new MatTableDataSource(flights);
        this.airlines = airlines;

        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.disablePagination
            ? null
            : this.paginator;
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator && !this.disablePagination) {
            this.dataSource.paginator.firstPage();
        }
    }

    getAirlineByCid(cid: string): Airline | undefined {
        return this.airlines.find((a) => a.cid == cid);
    }

    book(flight: Flight) {
        sessionStorage.setItem("CHECKOUT_FLIGHTS", JSON.stringify([flight]));

        if (!this.tickets) {
            const dialogRef = this.dialog.open(TicketsDialog, {
                data: {
                    maxTickets: flight.max_capacity - flight.current_capacity,
                } as TicketsDialogData,
            });

            dialogRef.afterClosed().subscribe((ticketsNumber) => {
                if (ticketsNumber) {
                    sessionStorage.setItem(
                        "CHECKOUT_TICKETS",
                        JSON.stringify(ticketsNumber)
                    );

                    this.router.navigate(["checkout"]);
                }
            });
        } else {
            sessionStorage.setItem(
                "CHECKOUT_TICKETS",
                JSON.stringify(this.tickets)
            );

            this.router.navigate(["checkout"]);
        }
    }

    isTicketDisabled(flight: Flight): boolean {
        // check if less then 12 hours till the flight
        if (
            moment(flight.departure_datetime).diff(
                moment(new Date()),
                "hours"
            ) < 12
        ) {
            return true;
        }

        // check if tickets left
        const ticketsLeft = flight.max_capacity - flight.current_capacity;
        return this.tickets ? ticketsLeft < this.tickets : ticketsLeft <= 0;
    }

    getTicketTooltip(flight: Flight): string {
        // check if less then 12 hours till the flight
        if (
            moment(flight.departure_datetime).diff(
                moment(new Date()),
                "hours"
            ) < 12
        ) {
            return "You missed the time frame for buying ticket for this flight";
        }

        return this.getTicketsLeftText(flight);
    }

    getTicketsLeftText(flight: Flight): string {
        const ticketsLeft = flight.max_capacity - flight.current_capacity;
        if (ticketsLeft) {
            if (this.tickets && ticketsLeft >= this.tickets) {
                return `Tickets available`;
            } else if (this.tickets) {
                return `Sorry we have only ${ticketsLeft} tickets available for this flight`;
            }
            return `${ticketsLeft} Tickets available!`;
        } else {
            return `No tickets left`;
        }
    }

    removeFlight(cid: string): void {
        this.httpService
            .deleteFlight(cid)
            .pipe(
                first(),
                tap(() =>
                    this.snackBar.open(
                        "The flight has been deleted successfully!",
                        undefined,
                        {
                            verticalPosition: "top",
                            duration: 3000,
                        }
                    )
                ),
                map(() => this.loadFlights())
            )
            .subscribe();
    }

    addNewFlight() {
        this.router.navigate(["flight"]);
    }

    updateFlight(cid: string): void {
        this.router.navigate(["flight", cid]);
    }

    get isAdmin(): boolean {
        return this.loggedInUser?.userType === UserTypeEnum.Admin;
    }

    get carriers(): string[] {
        const carr = ["All"];
        return carr.concat(
            Array.from(new Set(this.airlines.map((a) => a.name)))
        );
    }

    get destinationCountries(): string[] {
        const carr = ["All"];
        return carr.concat(
            Array.from(
                new Set(this.dataSource?.data?.map((f) => f.destination))
            )
        );
    }
}

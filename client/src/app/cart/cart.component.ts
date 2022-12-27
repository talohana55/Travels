import { Component, OnInit } from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { combineLatest, finalize, first, forkJoin, tap } from "rxjs";
import { AuthService } from "../app.auth.service";
import { Flight } from "../models/flight";
import { TravelRoute } from "../models/travel-route";
import { User } from "../models/user";
import { HttpService } from "../services/http.service";
import { IPayPalConfig, ICreateOrderRequest } from "ngx-paypal";
import { Order } from "../models/order";

@Component({
    selector: "app-cart",
    templateUrl: "./cart.component.html",
    styleUrls: ["./cart.component.scss"],
})
export class CartComponent implements OnInit {
    public payPalConfig?: IPayPalConfig;

    flights!: Flight[];

    ticketsNumber!: number;

    travelRoutes: TravelRoute[] = [];

    tickets: FormArray<any> = new FormArray<any>([]);

    creditCardDetails!: FormGroup;

    paymentMethodCtrl = new FormControl("visa");

    private loggedInUser!: User;

    constructor(
        private router: Router,
        private snackBar: MatSnackBar,
        private httpService: HttpService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.initPaymentMethods();
        const flightsFromSession = sessionStorage.getItem("CHECKOUT_FLIGHTS");
        const ticketsFromSession = sessionStorage.getItem("CHECKOUT_TICKETS");

        if (flightsFromSession && ticketsFromSession) {
            this.flights = JSON.parse(flightsFromSession);
            this.ticketsNumber = JSON.parse(ticketsFromSession);

            combineLatest([
                this.authService.loggedInUser$,
                this.httpService.getTravelRoutes(),
            ])
                .pipe(
                    first(),
                    tap((res) => (this.loggedInUser = res[0])),
                    tap((res) => (this.travelRoutes = res[1])),
                    tap(() => this.createForm())
                )
                .subscribe();
        }
    }

    private initPaymentMethods(): void {
        this.initPaypalConfig();
        this.creditCardDetails = new FormGroup({
            cardNumber: new FormControl("", [
                Validators.required,
                Validators.minLength(16),
            ]),
            cardExpirationMonth: new FormControl("", [
                Validators.required,
                Validators.min(1),
                Validators.max(12),
            ]),
            cardExpirationYear: new FormControl("", [
                Validators.required,
                Validators.min(new Date().getFullYear()),
            ]),
            cardCvv: new FormControl("", [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(4),
            ]),
            storeCreditDetails: new FormControl(true, Validators.required)
        });
    }

    private createForm(): void {
        for (let i = 0; i < this.ticketsNumber; i++) {
            let formGroup: FormGroup = new FormGroup({
                userFullname: new FormControl(
                    {
                        value: i === 0 ? this.loggedInUser.name : "",
                        disabled: i === 0,
                    },
                    Validators.required
                ),
                userEmail: new FormControl(
                    {
                        value: i === 0 ? this.loggedInUser.email : "",
                        disabled: i === 0,
                    },
                    Validators.required
                ),
                userPhone: new FormControl(
                    {
                        value: i === 0 ? this.loggedInUser.phone : "",
                        disabled: i === 0,
                    },
                    Validators.required
                ),
                birthdate: new FormControl("", Validators.required),
                nationality: new FormControl("", Validators.required),
                userId: new FormControl("", [
                    Validators.required,
                    Validators.pattern("^[0-9]*$"),
                    Validators.minLength(9),
                    Validators.maxLength(9),
                ]),
                passportNumber: new FormControl("", [
                    Validators.required,
                    Validators.pattern("^[0-9]*$"),
                    Validators.minLength(9),
                    Validators.maxLength(9),
                ]),
            });

            this.tickets.push(formGroup);
        }
    }

    get ticketArray(): FormArray {
        return this.tickets as FormArray;
    }

    getTicketFormGroup(index: number): FormGroup {
        return this.ticketArray.controls[index] as FormGroup;
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
        return total * (this.ticketsNumber ?? 1);
    }

    isFormValid(): boolean {
        return this.tickets?.valid && this.creditCardDetails.valid;
    }

    onSubmit(): void {
        if (this.isFormValid()) {
            this.httpService.createOrder({
                userId: this.loggedInUser.email,
                ...this.creditCardDetails.value
            } as Order).pipe(
                first(),
                tap(res => this.updateFlightsAfterPurchase(res)),
            ).subscribe();
        }
    }

    private updateFlightsAfterPurchase(order: Order): void {
        // go to each flight and change the current_capacity number to plus this.ticketsNumber
        let httpArr: any[] = [];
        for (let flight of this.flights) {
            httpArr.push(
                this.httpService.updateFlight({
                    ...flight,
                    current_capacity: flight.current_capacity + this.ticketsNumber,
                } as Flight)
            );
        }

        forkJoin(httpArr)
            .pipe(
                first(),
                finalize(() =>
                    this.router.navigate(["home"]).then(() => {
                        this.snackBar.open(
                            `Thank you! your order number is: ${order._id}, see you soon!`,
                            undefined,
                            {
                                verticalPosition: "top",
                                duration: 3000,
                            }
                        );
                        sessionStorage.clear();
                    })
                )
            )
            .subscribe();
    }
  
    initPaypalConfig(): void {
      this.payPalConfig = {
          currency: "USD",
          clientId: "sb",
          createOrderOnClient: (data) =>
              <ICreateOrderRequest>{
                  intent: "CAPTURE",
                  purchase_units: [
                      {
                          amount: {
                              currency_code: "USD",
                              value: "" + this.getTotalPrice(this.flights),
                              breakdown: {
                                  item_total: {
                                      currency_code: "USD",
                                      value:
                                          "" + this.getTotalPrice(this.flights),
                                  },
                              },
                          },
                          items: [
                              {
                                  name: "Flight tickets",
                                  quantity: "1",
                                  category: "DIGITAL_GOODS",
                                  unit_amount: {
                                      currency_code: "USD",
                                      value:
                                          "" + this.getTotalPrice(this.flights),
                                  },
                              },
                          ],
                      },
                  ],
              },
          advanced: {
              commit: "true",
          },
          style: {
              label: "pay",
            layout: "horizontal",
            fundingicons: true,
              shape: "pill"
          },
          onApprove: (data, actions) => {
              console.log(
                  "onApprove - transaction was approved, but not authorized",
                  data,
                  actions
              );
              actions.order.get().then((details: any) => {
                  console.log(
                      "onApprove - you can get full order details inside onApprove: ",
                      details
                  );
              });
          },
          onClientAuthorization: (data) => {
              console.log(
                  "onClientAuthorization - you should probably inform your server about completed transaction at this point",
                  data
              );
          },
          onCancel: (data, actions) => {
              console.log("OnCancel", data, actions);
          },
          onError: (err) => {
              console.log("OnError", err);
          },
          onClick: (data, actions) => {
              console.log("onClick", data, actions);
          },
      };
  }
}

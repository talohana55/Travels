import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { NgxPayPalModule } from "ngx-paypal";
import { LazyLoadImageModule } from "ng-lazyload-image";

// CORE COMPONENTS
import { NavBarComponent } from './core/navbar/navbar.component';
import { FooterComponent } from './core/footer/footer.component';
import { TicketsDialog } from "./core/tickets-dialog/tickets-dialog";
import { BackgroundComponent } from "./core/background/background.component";

// SHARED COMPONENTS
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FlightsComponent } from './flights/flights.component';
import { HomeComponent } from './home/home.component';
import { CartComponent } from './cart/cart.component';

// ANGULAR MATERIAL
import { MaterialModule } from './material/material.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// APP
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddNewFlightComponent } from './admin/add-new-flight/add-new-flight.component';
import { AddNewAirlineComponent } from './admin/add-new-airline/add-new-airline.component';
import { AddNewStateComponent } from './admin/add-new-state/add-new-state.component';
import { AddNewTravelRouteComponent } from "./admin/add-new-travel-route/add-new-travel-route.component";

export function tokenGetter() {
  return sessionStorage.getItem('access_token');
}

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        HomeComponent,
        NavBarComponent,
        RegisterComponent,
        FooterComponent,
        FlightsComponent,
        CartComponent,
        BackgroundComponent,
        AddNewFlightComponent,
        AddNewAirlineComponent,
        AddNewStateComponent,
        AddNewTravelRouteComponent,
        TicketsDialog,
    ],
    imports: [
        NgxPayPalModule,
        MatDatepickerModule,
        MatNativeDateModule,
        LazyLoadImageModule,
        JwtModule.forRoot({
            config: {
                tokenGetter: tokenGetter,
                allowedDomains: ["localhost:3000"],
            },
        }),
        HttpClientModule,
        BrowserModule,
        MaterialModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        AppRoutingModule,
    ],
    providers: [MatDatepickerModule],
    bootstrap: [AppComponent],
})
export class AppModule {}

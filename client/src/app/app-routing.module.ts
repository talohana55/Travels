import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard, IsAdminGuard } from "./app.auth.guard";
import { HomeComponent } from './home/home.component';
import { CartComponent } from './cart/cart.component';
import { FlightsComponent } from './flights/flights.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AddNewFlightComponent } from "./admin/add-new-flight/add-new-flight.component";
import { AddNewAirlineComponent } from "./admin/add-new-airline/add-new-airline.component";
import { AddNewStateComponent } from "./admin/add-new-state/add-new-state.component";
import { AddNewTravelRouteComponent } from "./admin/add-new-travel-route/add-new-travel-route.component";

const routes: Routes = [
    {
        path: "login",
        component: LoginComponent,
    },
    {
        path: "register",
        component: RegisterComponent,
    },
    {
        path: "home",
        component: HomeComponent,
    },
    {
        path: "flights",
        component: FlightsComponent,
    },
    {
        path: "checkout",
        component: CartComponent,
        canActivate: [AuthGuard],
    },
    {
        path: "airline",
        component: AddNewAirlineComponent,
        canActivate: [AuthGuard, IsAdminGuard],
    },
    {
        path: "flight",
        component: AddNewFlightComponent,
        canActivate: [AuthGuard, IsAdminGuard],
        children: [
            {
                path: ":cid",
                component: AddNewFlightComponent,
                canActivate: [AuthGuard, IsAdminGuard],
            },
        ],
    },
    {
        path: "state",
        component: AddNewStateComponent,
        canActivate: [AuthGuard, IsAdminGuard],
    },
    {
        path: "travel-route",
        component: AddNewTravelRouteComponent,
        canActivate: [AuthGuard, IsAdminGuard],
    },
    {
        path: "",
        redirectTo: "home",
        pathMatch: "full",
    },
    {
        path: "**",
        redirectTo: "home",
        pathMatch: "full",
    },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

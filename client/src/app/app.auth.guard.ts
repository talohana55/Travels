import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { User, UserTypeEnum } from "./models/user";

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (sessionStorage.getItem('access_token')) {
      return true;
    }

    console.log(`User is not authenticated`);
    this.router.navigate(['login']);
    return false;
  }
}

@Injectable({
    providedIn: "root",
})
export class IsAdminGuard implements CanActivate {
    constructor(private router: Router) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const loggedInUserStr = sessionStorage.getItem("logged_in_user");
        if (loggedInUserStr) {
            const user = JSON.parse(loggedInUserStr) as User;
            return user.userType === UserTypeEnum.Admin;
        }

        console.log(`User is not admin`);
        this.router.navigate(["login"]);
        return false;
    }
}

@Injectable({
    providedIn: "root",
})
export class IsMemberGuard implements CanActivate {
    constructor(private router: Router) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const loggedInUserStr = sessionStorage.getItem("logged_in_user");
        if (loggedInUserStr) {
            const user = JSON.parse(loggedInUserStr) as User;
            return user.userType === UserTypeEnum.Member;
        }

        console.log(`User is not a member`);
        this.router.navigate(["login"]);
        return false;
    }
}
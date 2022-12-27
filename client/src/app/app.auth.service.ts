import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, EMPTY, map, Observable, tap } from 'rxjs';

import { environment } from 'src/environments/environment';
import { User } from './models/user';

@Injectable({
    providedIn: "root",
})
export class AuthService {
    private isLoggedIn = new BehaviorSubject<boolean>(false);
    isLoggedIn$ = this.isLoggedIn.asObservable();

    private loggedInUser = new BehaviorSubject<User>({} as User);
    loggedInUser$ = this.loggedInUser.asObservable();

    constructor(
        private router: Router,
        private httpClient: HttpClient,
        private snackBar: MatSnackBar
    ) {}

    updateLoginStateOnAppLoad(): void {
        if (sessionStorage.getItem("access_token")) {
            this.isLoggedIn.next(true);
        }
        if (sessionStorage.getItem("logged_in_user")) {
            const user: any = sessionStorage.getItem("logged_in_user");
            this.loggedInUser.next(JSON.parse(user));
        }
    }

    login(email: string, password: string): Observable<void> {
        return this.httpClient
            .post<User>(`${environment.backendBaseUrl}/login`, {
                email,
                password,
            })
            .pipe(
                tap(() => this.isLoggedIn.next(true)),
                map((result) => {
                    sessionStorage.setItem("access_token", result.token);
                    sessionStorage.setItem(
                        "logged_in_user",
                        JSON.stringify(result)
                    );
                    this.loggedInUser.next(result);
                }),
                catchError((error) => {
                    this.snackBar.open(
                        "Error! no user found for the given credentials",
                        undefined,
                        {
                            verticalPosition: 'top',
                            duration: 3000,
                        }
                    );
                    this.isLoggedIn.next(false);
                    this.loggedInUser.next({} as User);
                    console.log(error);
                    return EMPTY;
                })
            );
    }

    register(
        email: string,
        name: string,
        phone: string,
        password: string
    ): Observable<void> {
        return this.httpClient
            .post<{ user: User }>(`${environment.backendBaseUrl}/register`, {
                email,
                name,
                phone,
                password,
            })
            .pipe(
                tap(() => this.isLoggedIn.next(true)),
                map(() => void 0),
                catchError((error) => {
                    this.snackBar.open(
                        "Error! could not register the user with the given details",
                        undefined,
                        {
                            verticalPosition: "top",
                            duration: 3000,
                        }
                    );
                    this.isLoggedIn.next(false);
                    console.log(error);
                    return EMPTY;
                })
            );
    }

    logout() {
        this.router.navigate(["login"]).then(() => {
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("logged_in_user");

            this.isLoggedIn.next(false);
            this.loggedInUser.next({} as User);
        });
    }
}
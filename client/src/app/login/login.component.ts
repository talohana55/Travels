import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, EMPTY, map, take } from 'rxjs';
import { Router } from '@angular/router';

import { AuthService } from '../app.auth.service';
import { FadeIn } from "../core/animations/animations";

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
    animations: [FadeIn(200)],
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    error!: string;

    constructor(private router: Router, private authService: AuthService) {}

    ngOnInit(): void {
        this.loginForm = new FormGroup({
            email: new FormControl("", [Validators.email, Validators.required]),
            password: new FormControl("", [
                Validators.required,
                Validators.minLength(4),
            ]),
        });
    }

    submit(): void {
        if (this.loginForm.valid) {
            const { email, password } = this.loginForm.value;
            this.authService
                .login(email, password)
                .pipe(
                    take(1),
                    map(() => this.router.navigate(["home"])),
                    catchError((err) => {
                        console.log(err);
                        return EMPTY;
                    })
                )
                .subscribe();
        }
    }
}

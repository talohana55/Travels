import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, map, take } from 'rxjs';

import { AuthService } from '../app.auth.service';
import { FadeIn } from "../core/animations/animations";

@Component({
    selector: "app-register",
    templateUrl: "./register.component.html",
    styleUrls: ["./register.component.scss"],
    animations: [FadeIn(200)],
})
export class RegisterComponent implements OnInit {
    registerForm!: FormGroup;
    error!: string;

    constructor(private router: Router, private authService: AuthService) {}

    ngOnInit(): void {
        this.registerForm = new FormGroup({
            email: new FormControl("", [Validators.email, Validators.required]),
            name: new FormControl("", [
                Validators.required,
                Validators.minLength(2),
            ]),
            phone: new FormControl("", [
                Validators.required,
                Validators.minLength(2),
            ]),
            password: new FormControl("", [
                Validators.required,
                Validators.minLength(4),
            ]),
        });
    }

    submit(): void {
        if (this.registerForm.valid) {
            const { email, name, phone, password } = this.registerForm.value;
            this.authService
                .register(email, name, phone, password)
                .pipe(
                    take(1),
                    map(() => this.router.navigate(["login"])),
                    catchError((err) => {
                        console.log(err);
                        alert("Error occured while register");
                        return EMPTY;
                    })
                )
                .subscribe();
        }
    }
}

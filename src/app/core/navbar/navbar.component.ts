import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from 'src/app/app.auth.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user';


@Component({
    selector: "app-navbar",
    templateUrl: "./navbar.component.html",
    styleUrls: ["./navbar.component.scss"],
})
export class NavBarComponent implements OnInit {
    isLoggedIn$!: Observable<boolean>;
    loggedInUser$!: Observable<User>;

    constructor(private authService: AuthService) {}

    logout(): void {
        this.authService.logout();
    }

    ngOnInit(): void {
        this.isLoggedIn$ = this.authService.isLoggedIn$;
        this.loggedInUser$ = this.authService.loggedInUser$;
    }
}

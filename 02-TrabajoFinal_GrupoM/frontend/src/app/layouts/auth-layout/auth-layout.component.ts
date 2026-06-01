import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
    selector: "app-auth-layout",
    standalone: true,
    imports: [RouterOutlet],
    template: `
        <div class="auth-wrapper">
            <router-outlet></router-outlet>
        </div>
        `,
    styles: [`
        .auth-wrapper {
            min-height: 100vh;
            width: 100%;
            background-color: #f4f7f6;
            }`]
})
export class AuthLayoutComponent {}
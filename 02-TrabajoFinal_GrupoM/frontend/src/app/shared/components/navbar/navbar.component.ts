import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import {
  IsActiveMatchOptions,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected menuOpen = false;

  get nombreUsuario(): string | null {
    return this.authService.obtenerNombre();
  }

  get rolUsuario(): string | null {
    return this.authService.obtenerRol();
  }

  protected readonly dashboardLinkOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    matrixParams: 'ignored',
    fragment: 'ignored',
  };

  protected readonly sectionLinkOptions: IsActiveMatchOptions = {
    paths: 'subset',
    queryParams: 'ignored',
    matrixParams: 'ignored',
    fragment: 'ignored',
  };

  protected toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.updateBodyScroll();
  }

  protected closeMenu(): void {
    this.menuOpen = false;
    this.updateBodyScroll();
  }

  protected logout(): void {
    this.closeMenu();

    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('menu-open-body');
  }

  private updateBodyScroll(): void {
    document.body.classList.toggle('menu-open-body', this.menuOpen);
  }
}
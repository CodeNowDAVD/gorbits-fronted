import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-provider-hub',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './provider-hub.component.html',
  styleUrl: './provider-hub.component.scss',
})
export class ProviderHubComponent {}

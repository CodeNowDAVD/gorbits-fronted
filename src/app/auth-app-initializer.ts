import { AuthService } from './core/services/auth.service';
import { firstValueFrom } from 'rxjs';

export function authAppInitializerFactory(auth: AuthService): () => Promise<void> {
  return () => firstValueFrom(auth.restoreSession());
}

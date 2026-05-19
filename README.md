# GOrbitSF (frontend)

Cliente **Angular 21** para la API **GOrbitS** (Spring Boot en `../GOrbitS`).

## Arranque local

1. Levanta el backend (puerto **8080**):

   ```bash
   cd ../GOrbitS && ./mvnw spring-boot:run
   ```

2. En otra terminal, el frontend:

   ```bash
   npm start
   ```

Abre `http://localhost:4200/`. Las peticiones a `/api/...` se reenvían a `http://localhost:8080` vía `proxy.conf.json`.

La URL base de la API en código está en `src/environments/environment.ts` (`apiBaseUrl`, por defecto `/api/v1`).

### Autenticación

- **Login:** ruta `/login` (`POST /api/v1/auth/login` con usuario/contraseña).
- El **JWT** se guarda en `sessionStorage` y el interceptor añade **`Authorization: Bearer …`** a todas las peticiones salvo el login.
- Tras iniciar sesión se llama a **`GET /api/v1/me`** para cargar id, usuario y rol.
- Recarga de página: si hay token válido, `APP_INITIALIZER` restaura la sesión con `/me`.
- Rutas con sesión: **`/home`** (resumen de cuenta), **`/catalog`** (catálogo de libros y filtro por categoría).
- Rol **ADMIN**: **`/admin`** (usuarios, catálogo, almacén, facturas librería).
- Rol **PROVEEDOR**: menú **Proveedor** → **`/proveedor`** (inventario, librería, clientes, guías, zona). En el **detalle de una guía**: planes de cuotas (iguales o personalizados), abonos y reprogramación de vencimientos; **`/proveedor/calendario-cuotas`** (cuotas por rango de fechas); **`/proveedor/devoluciones-guias`** (listado `GET /guides/returns`).

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.11.

## Development server

```bash
ng serve
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

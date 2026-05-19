# Notas de versión — GOrbitSF (entrega frontend)

Documento de **handoff del desarrollador frontend** a DevOps/servidor.  
Nginx, despliegue en Termux, rollback y publicación los define el equipo de servidor.

---

## 1. Arquitectura en producción

| Componente | Puerto / ruta | Notas |
|------------|---------------|--------|
| Nginx (entrada) | `:8088` | Sirve el SPA y hace proxy de API |
| Frontend estático | `/` | Contenido de `dist/gorbitsf/browser/` |
| API GOrbitS (proxy) | `/api/` → backend interno `:8080` | Perfil `mysql,prod` en Termux |
| Base URL del cliente | **`/api/v1`** (relativa) | Sin IP fija, sin `localhost`, sin `:8080` |

El build **no** embebe host ni puerto del backend; todas las peticiones HTTP usan rutas relativas bajo el mismo origen que Nginx.

---

## 2. Build de producción

Requisitos: Node.js 20+ y npm 10+ (ver `packageManager` en `package.json`).

```bash
cd GOrbitSF
npm ci
npm run build
```

Salida:

```
dist/gorbitsf/browser/
  index.html
  main-*.js
  chunk-*.js
  styles-*.css
  …
```

Verificar que el bundle no referencia `localhost` ni `:8080`:

```bash
grep -r 'localhost\|:8080' dist/gorbitsf/browser/*.js || echo 'OK: sin hosts de desarrollo'
```

---

## 3. Paquete listo para desplegar

Generar tarball de despliegue (incluye `browser/`, documentación y ejemplo de env):

```bash
cd GOrbitSF
npm run build
rm -rf release && mkdir -p release/browser
cp -r dist/gorbitsf/browser/. release/browser/
cp ENTREGA_FRONTEND.md env.required.example release/
tar -czf GOrbitSF-dist.tar.gz -C release .
```

En el servidor: extraer y apuntar Nginx `root` a `browser/` (o copiar su contenido al `root` del sitio).

Alternativa sin empaquetar: copiar solo `dist/gorbitsf/browser/*` al directorio estático de Nginx.

**Contenido recomendado del paquete para DevOps:**

| Elemento | Descripción |
|----------|-------------|
| Código fuente | Carpeta `GOrbitSF/` (repositorio) |
| Build | `dist/gorbitsf/browser/` o `GOrbitSF-dist.tar.gz` |
| `env.required.example` | Sin variables obligatorias en build |
| `ENTREGA_FRONTEND.md` | Este archivo |

---

## 4. Variables de entorno

Ver `env.required.example`. **Ninguna variable es obligatoria** para compilar ni servir el SPA: `apiBaseUrl` está en `environment.prod.ts` como `/api/v1`.

---

## 5. API usada por el frontend (vía Nginx)

Todas las llamadas parten de `environment.apiBaseUrl` = `/api/v1`.

| Área | Método y ruta (relativa) | Servicio Angular |
|------|--------------------------|------------------|
| Login | `POST /api/v1/auth/login` | `AuthService` |
| Sesión | `GET /api/v1/me` | `AuthService` |
| Catálogo público | `GET /api/v1/catalog/...` | `CatalogService` |
| Admin | `/api/v1/admin/...` | `AdminApiService` |
| Catálogo admin | `/api/v1/catalog/...` | `CatalogAdminApiService` |
| Almacén admin | `/api/v1/inventory/warehouse/...` | `WarehouseAdminApiService` |
| Proveedor comercial | `/api/v1/clients`, `/api/v1/guides`, … | `CommercialProviderApiService` |
| Inventario proveedor | `/api/v1/inventory/...` | `InventoryProviderApiService` |
| Cobranza proveedor | `/api/v1/billing/...` | `BillingProviderApiService` |

Health del backend (comprobación DevOps; **no** lo llama el SPA):

```http
GET /api/actuator/health
```

El backend expone actuator en `/actuator/health`. Nginx debe reenviar `/api/actuator/` al path `/actuator/` del JAR (p. ej. `location /api/actuator/ { proxy_pass http://127.0.0.1:8080/actuator/; }`) o la regla equivalente acordada con backend.

---

## 6. Rutas de la SPA (Angular Router)

Requiere `try_files $uri $uri/ /index.html` en Nginx para rutas profundas.

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/login` | Invitado | Inicio de sesión |
| `/home` | Autenticado | Redirección según rol |
| `/proveedor/...` | `PROVEEDOR` | Hub comercial, inventario, cobranza |
| `/admin/...` | `ADMIN` | Dashboard, usuarios, libros, almacén |

Tras login, redirección automática: admin → `/admin/dashboard`, proveedor → `/proveedor`.

---

## 7. Desarrollo local (referencia)

```bash
npm start
# ng serve + proxy.conf.json → http://localhost:8080 para /api/*
```

`proxy.conf.json` solo aplica en desarrollo; **no** se incluye en `dist/`.

---

## 8. Requisitos Nginx (resumen para DevOps)

```nginx
# SPA
location / {
    root /ruta/a/dist/browser;
    try_files $uri $uri/ /index.html;
}

# API → Spring Boot :8080 (mantener prefijo /api)
location /api/ {
    proxy_pass http://127.0.0.1:8080/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Actuator (ajuste si se expone como /api/actuator/health)
location /api/actuator/ {
    proxy_pass http://127.0.0.1:8080/actuator/;
}
```

Puerto público acordado: **8088**.

---

## 9. Credenciales demo

Si el backend aplicó la migración `V20260517_1220`, ver `ENTREGA_BACKEND.md` (admin, proveedor, embajadores).

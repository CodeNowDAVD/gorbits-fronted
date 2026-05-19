# Manual CI/CD — GOrbitSF (Frontend)

**Proyecto:** GOrbitSF — Angular 21 (SPA)  
**Entrega:** Manual paso a paso con capturas (Sesión 08 — variante Frontend)  
**Autor / equipo:** [tu nombre]  
**Fecha:** [completar]

---

## Resumen ejecutivo

| Fase | Qué hace | Herramienta |
|------|----------|-------------|
| **CI** | Compilar el SPA de producción | `npm ci` + `npm run build` |
| **CD** | Publicar estáticos en el servidor | `tar` → `scp` → `deploy.sh` (Termux) |
| **Runtime** | Nginx sirve `/`, proxy `/api/` al backend | Puerto **8088** |

**Diferencia con el backend (GOrbitS):**

| | Backend | Frontend |
|---|---------|----------|
| Artefacto | JAR | Carpeta `dist/gorbitsf/browser/` |
| Build | Maven | npm / Angular |
| Deploy | `POST https://app.gorbits.xyz/deploy` | SSH + `gorbits-frontend/bin/deploy.sh` |
| Tests en pipeline | JUnit + JaCoCo (obligatorio en curso) | Opcional (`npm test`); este manual usa **build + deploy** |

---

## Mapa de entregables

| # | Qué documentar | Archivo / comando |
|---|----------------|-------------------|
| 1 | Prerrequisitos Node 20 | `node -v`, `npm -v` |
| 2 | Build producción | `./ci/build-production.sh` |
| 3 | Verificación bundle | `grep` sin `localhost` |
| 4 | Deploy Termux | `./ci/deploy-frontend-termux.sh` |
| 5 | Verificación final | `./ci/verify-deploy.sh` + navegador |
| 6 | Infra compartida (opcional) | Docker Jenkins/Sonar (misma del backend) |
| 7 | Arquitectura | `ENTREGA_FRONTEND.md` |

---

## 1. Arquitectura en producción

```
[Navegador] → http://192.168.2.4:8088
                    │
                    ▼
              [Nginx :8088]
                 /     \
                /       \
         / (SPA)         \api/ (proxy)
              │               │
    dist/gorbitsf/browser     ▼
                         GOrbitS :8080
```

| Ruta | Destino |
|------|---------|
| `/` | Archivos estáticos Angular (`index.html`, `*.js`, `*.css`) |
| `/api/v1/...` | Backend Spring Boot (vía `proxy_pass`) |
| `/api/actuator/health` | Health del backend |

El cliente Angular usa URL relativa en producción:

```typescript
apiBaseUrl: '/api/v1'   // environment.prod.ts
```

> **[CAPTURA 1]** Diagrama o tabla de arquitectura (esta sección en Word).

---

## 2. Prerrequisitos

### 2.1 En la Mac (desarrollador)

```bash
node -v    # v20.x recomendado
npm -v     # 10.x
```

> **[CAPTURA 2]** Terminal con `node -v` y `npm -v`.

### 2.2 Backend activo

El frontend **no** funciona solo: Nginx reenvía `/api/` al JAR.

```bash
curl -s http://192.168.2.4:8088/api/actuator/health
```

Debe responder JSON con `"status":"UP"` (o equivalente).

> **[CAPTURA 3]** Salida del `curl` health.

### 2.3 Servidor Termux

| Dato | Valor |
|------|--------|
| IP | `192.168.2.4` |
| SSH puerto | `8022` |
| Usuario | `u0_a296` |
| URL frontend | http://192.168.2.4:8088 |

> **[CAPTURA 4]** (Opcional) Terminal con `ssh -p 8022 u0_a296@192.168.2.4` conectando.

---

## 3. CI — Build de producción

### 3.1 Ir al proyecto

```bash
cd ~/Programacion/despliegueS/GOrbitSF
```

### 3.2 Ejecutar script de build

```bash
chmod +x ci/*.sh
./ci/build-production.sh
```

El script ejecuta:

1. `npm ci` — dependencias reproducibles  
2. `npm run build` — compilación Angular (`configuration: production`)  
3. Comprueba que exista `dist/gorbitsf/browser/index.html`  
4. Verifica que los JS **no** contengan `localhost` ni `:8080`

**Salida esperada:**

```
dist/gorbitsf/browser/
  index.html
  main-XXXXX.js
  styles-XXXXX.css
  chunk-*.js
```

> **[CAPTURA 5]** Terminal: `npm run build` terminando sin errores.  
> **[CAPTURA 6]** Finder o `ls dist/gorbitsf/browser/` mostrando archivos.

### 3.3 Verificación manual (alternativa)

```bash
grep -r 'localhost\|:8080' dist/gorbitsf/browser/*.js || echo 'OK: sin hosts de desarrollo'
```

> **[CAPTURA 7]** Línea `OK: sin hosts de desarrollo`.

---

## 4. CD — Despliegue continuo (Termux)

### 4.1 Precondición

Build reciente en `dist/gorbitsf/browser/` (paso 3).

### 4.2 Deploy automatizado

```bash
./ci/deploy-frontend-termux.sh
```

**Pasos internos del script:**

1. `tar -czf /tmp/frontend-new.tar.gz` desde `dist/gorbitsf/browser/`  
2. `scp` al servidor → `~/servers/gorbits-frontend/releases/frontend-new.tar.gz`  
3. `ssh` ejecuta `~/servers/gorbits-frontend/bin/deploy.sh`  
4. Publica en `~/servers/gorbits-frontend/current/`  
5. Nginx sirve la nueva versión en `/`

> **[CAPTURA 8]** Terminal: mensaje del `tar` y tamaño del archivo.  
> **[CAPTURA 9]** Terminal: `scp` completado.  
> **[CAPTURA 10]** Terminal: salida de `deploy.sh` en el servidor.

### 4.3 Comando manual (referencia — una línea)

```bash
tar -czf /tmp/frontend-new.tar.gz -C ~/Programacion/despliegueS/GOrbitSF/dist/gorbitsf/browser . && \
scp -P 8022 /tmp/frontend-new.tar.gz u0_a296@192.168.2.4:~/servers/gorbits-frontend/releases/frontend-new.tar.gz && \
ssh -p 8022 u0_a296@192.168.2.4 '~/servers/gorbits-frontend/bin/deploy.sh ~/servers/gorbits-frontend/releases/frontend-new.tar.gz'
```

---

## 5. Verificación post-deploy

```bash
./ci/verify-deploy.sh
```

Abrir en navegador:

| URL | Comprobar |
|-----|-----------|
| http://192.168.2.4:8088 | Carga la app |
| http://192.168.2.4:8088/login | Pantalla de login |
| http://192.168.2.4:8088/api/actuator/health | API UP |

> **[CAPTURA 11]** Salida SSH de `status.sh` (frontend + nginx).  
> **[CAPTURA 12]** Navegador: página de login GOrbitS.  
> **[CAPTURA 13]** Navegador o terminal: health JSON con UP.

---

## 6. Paquete de entrega (opcional)

Para adjuntar artefacto al informe:

```bash
./ci/package-release.sh
```

Genera `GOrbitSF-dist.tar.gz` con `browser/`, `ENTREGA_FRONTEND.md`, `env.required.example`.

> **[CAPTURA 14]** Archivo `GOrbitSF-dist.tar.gz` en el explorador.

---

## 7. Infraestructura CI/CD compartida (Jenkins + Docker)

El frontend reutiliza la misma infra del backend (Sesión 08):

| Servicio | URL |
|----------|-----|
| Jenkins | http://localhost:9080 |
| SonarQube | http://localhost:9001 |

Levantar contenedores (desde repo `despliegueS`):

```bash
./scripts/sesion08-docker-up.sh
docker ps
```

> **[CAPTURA 15]** `docker ps` con Jenkins y SonarQube en ejecución.  
> **[CAPTURA 16]** Pantalla principal de Jenkins.  
> **[CAPTURA 17]** (Opcional) SonarQube — proyecto si se analiza TS en el futuro.

### Pipeline frontend en Jenkins (referencia)

Job sugerido: `gorbitsf-pipeline`  
Archivo: `Jenkinsfile.frontend` (raíz del monorepo).

Stages típicos: **Clone → Check Node → Build → Deploy Frontend**

> **Nota:** `GOrbitSF/` puede estar en `.gitignore`; para que Jenkins clone el frontend, incluir la carpeta en el repositorio o usar un repo dedicado.

> **[CAPTURA 18]** (Opcional) Stage View de Jenkins con build frontend en verde.

---

## 8. Equivalencia con la guía del curso (Tomcat)

En la guía clásica se despliega un **WAR en Tomcat Manager**.

| Guía del curso | GOrbitS / GOrbitSF |
|----------------|-------------------|
| Tomcat Manager + WAR | Deploy HTTP JAR (backend) |
| Servidor de aplicaciones | Nginx + archivos estáticos (frontend) |
| URL de manager | `deploy.sh` en Termux |

---

## 9. Rutas importantes de la SPA

| Ruta | Uso |
|------|-----|
| `/login` | Inicio de sesión |
| `/home` | Redirección por rol |
| `/admin/...` | Panel administrador |
| `/proveedor/...` | Panel proveedor |

Nginx debe tener `try_files $uri $uri/ /index.html` para rutas profundas.

---

## 10. Troubleshooting

| Problema | Solución |
|----------|----------|
| `npm ci` falla | `node -v` ≥ 20; borrar `node_modules` y repetir |
| Build OK pero API 502 | Desplegar/arrancar backend primero |
| `scp` connection refused | Termux encendido, misma WiFi, IP correcta |
| Pantalla en blanco | Revisar `deploy.sh` y `current/` en servidor |
| Login falla | Health API UP; credenciales en `ENTREGA_BACKEND.md` |

---

## Checklist final (imprimir)

- [ ] Node 20+ verificado  
- [ ] `./ci/build-production.sh` OK  
- [ ] `grep` sin localhost  
- [ ] `./ci/deploy-frontend-termux.sh` OK  
- [ ] `./ci/verify-deploy.sh` OK  
- [ ] Navegador `:8088/login` OK  
- [ ] Manual con **≥15 capturas** y flechas  
- [ ] PDF/Word subido a Classroom  

---

## Referencias

- `ENTREGA_FRONTEND.md` — handoff DevOps  
- `comandos_despliegue_gorbits.txt` — comandos servidor  
- `GOrbitS/CI.md` — CI/CD backend (misma sesión)  
- Scripts: `GOrbitSF/ci/*.sh`

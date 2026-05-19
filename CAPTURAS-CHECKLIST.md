# Checklist de capturas — Manual Frontend

Marca cada casilla al tomar la foto. En Word, pega la imagen y añade **flecha roja** al elemento importante.

| # | Qué capturar | Dónde / comando |
|---|--------------|-----------------|
| 1 | Tabla/diagrama arquitectura | Sección 1 de `CI-FRONTEND.md` |
| 2 | `node -v` y `npm -v` | Terminal Mac |
| 3 | Health API JSON | `curl http://192.168.2.4:8088/api/actuator/health` |
| 4 | (Opc.) SSH a Termux | `ssh -p 8022 u0_a296@192.168.2.4` |
| 5 | Build terminado OK | `./ci/build-production.sh` |
| 6 | Carpeta `dist/gorbitsf/browser/` | Finder o `ls` |
| 7 | `OK: sin hosts de desarrollo` | salida grep |
| 8 | Creación del `.tar.gz` | deploy script paso 1 |
| 9 | `scp` completado | deploy script paso 2 |
| 10 | Salida `deploy.sh` | deploy script paso 3 |
| 11 | `status.sh` frontend + nginx | `./ci/verify-deploy.sh` |
| 12 | Login en navegador | http://192.168.2.4:8088/login |
| 13 | Health en navegador o curl | misma URL health |
| 14 | (Opc.) `GOrbitSF-dist.tar.gz` | `./ci/package-release.sh` |
| 15 | `docker ps` Jenkins+Sonar | desde repo despliegueS |
| 16 | UI Jenkins localhost:9080 | navegador |
| 17 | (Opc.) SonarQube | localhost:9001 |
| 18 | (Opc.) Pipeline Jenkins verde | job gorbitsf |

**Orden rápido de ejecución (tú):**

```bash
cd ~/Programacion/despliegueS/GOrbitSF
chmod +x ci/*.sh
./ci/build-production.sh          # capturas 5–7
./ci/deploy-frontend-termux.sh    # capturas 8–10 (requiere Termux ON)
./ci/verify-deploy.sh             # capturas 11–13
```

**Si Termux está apagado:** haz capturas 2, 5, 6, 7 y documenta deploy como “pendiente de servidor” con el comando en captura 8 (texto).

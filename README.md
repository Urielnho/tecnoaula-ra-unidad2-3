# TecnoAula - Resultado de Aprendizaje de las Unidades 2 y 3

Aplicación Django + React con login JWT, registro, Dashboard protegido, AuthContext persistente, API externa y consumo SOAP. Se reutiliza y adapta el backend de la Práctica 4; el proyecto anterior no se modifica.

## Requisitos
- Python 3.14 (versión utilizada) y Node.js 24.14.0.
- Google Chrome para repetir las capturas.
- Internet para instalar dependencias, consultar Open-Meteo y el servicio SOAP.
- SQLite por defecto; no requiere configurar MySQL.

## Backend - terminal 1, desde la raíz
```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python backend/manage.py migrate
.\.venv\Scripts\python scripts/seed_demo.py
.\.venv\Scripts\python backend/manage.py runserver 127.0.0.1:8001
```
Swagger: http://127.0.0.1:8001/swagger/
Admin de Django: http://127.0.0.1:8001/admin/

`seed_demo.py` crea o restablece únicamente dos cuentas de demostración y un producto:

| Rol | Email | Contraseña | Matrícula |
| --- | --- | --- | --- |
| Estudiante | alumno@tecnoaula.local | AlumnoDemo!4926 | IDGS9001 |
| Administrador | admin@tecnoaula.local | AdminDemo!8246 | ADM001 |

Estas cuentas son sintéticas y exclusivamente locales. Para una cuenta propia usar el formulario de registro o `python backend/manage.py createsuperuser` con el entorno activado. No ejecutar la carga demo en producción.

## Frontend - terminal 2, desde la raíz
```powershell
npm ci --prefix frontend
npm run dev --prefix frontend
```
Abrir http://127.0.0.1:5173/ e iniciar sesión o crear una cuenta.

La configuración predeterminada apunta a Django en el puerto 8001 para permitir que la Práctica 4 siga en el puerto 8000. Para cambiarla, copiar `frontend/.env.example` a `frontend/.env` y modificar `VITE_BASE_API_URL`. CORS permite solo los orígenes locales del frontend en el puerto 5173. Los cambios de `.env` requieren reiniciar Vite.

## Requisitos implementados
| Requisito | Implementación |
| --- | --- |
| React con Vite | `frontend/package.json`, `vite.config.js`, JavaScript y Sass |
| React Router v6 | `src/routes/Navigation.jsx`; layouts Common, Client y Admin |
| Login | `src/pages/common/Login.jsx`; Formik/Yup y errores visibles |
| Registro | `src/pages/common/Register.jsx` y `POST /api/v1/auth/register/` |
| AuthContext y custom hook | `src/context/AuthContext.jsx`, `src/hooks/useAuth.js` y `useUser.js` |
| Sesión persistente | Tokens en localStorage, recuperación del usuario en `/auth/me/` y refresh automático |
| Dashboard protegido | `AdminLayout` verifica la sesión; backend también exige JWT |
| API externa con fetch | `WeatherWidget` consulta directamente Open-Meteo; selector de ciudad y actualización |
| Web service propio | `GET /api/v1/auth/me/`, autenticado, sin contraseña ni hash |
| SOAP con zeep | `GET /api/v1/integrations/country/?code=MX`; `CountryWidget` lo consulta |

## APIs y autenticación
- `POST /api/v1/auth/register/`: email, first_name, last_name, matricula y password. Solo crea usuarios normales; no expone la lista de usuarios ni permite solicitar permisos administrativos.
- `POST /api/v1/auth/token/`: email y password; devuelve access y refresh.
- `POST /api/v1/auth/token/refresh/`: refresh; devuelve un nuevo access.
- `GET /api/v1/auth/me/`: perfil del usuario autenticado.
- `GET /api/v1/integrations/country/?code=MX`: información pública de un país obtenida por Django vía SOAP.
- CRUD `/api/v1/users/`: reservado para administradores.
- `/api/v1/products/` y `/api/v1/categories/`: lectura autenticada y escritura administrativa.

En Swagger usar Authorize con `Bearer <access>`. Access dura 15 minutos y refresh un día. En desarrollo la consola informa que se recibió el token, mostrando solo un fragmento. No se registran contraseñas ni tokens completos. La consola de la evidencia es real.

## Consumo externo
**REST:** Open-Meteo. `fetch` desde React carga temperatura, humedad, viento y condición meteorológica. Se muestra la ciudad y la hora de lectura; no se pide geolocalización. Existe estado de carga, error y reintento; no se usan datos simulados como respaldo.

**SOAP:** CountryInfoService, operación `FullCountryInfo`. Django crea un cliente `zeep.Client` con WSDL fijo, envía un código ISO de dos letras y transforma la respuesta XML en JSON. La respuesta incluye proveedor, protocolo, operación y hora de consulta. React muestra capital, moneda, prefijo e idiomas. El proveedor de demostración publica su servicio por HTTP; solo se envían códigos públicos como MX, nunca el JWT ni datos de usuario. Se validan las entradas y se devuelve 502 cuando falla el proveedor, 404 para un país inexistente y 401 sin JWT. Se usan timeouts y caché del WSDL.

## Verificación
```powershell
.\.venv\Scripts\python backend/manage.py check
.\.venv\Scripts\python backend/manage.py makemigrations --check --dry-run
.\.venv\Scripts\python backend/manage.py test users integrations products
npm run build --prefix frontend
```
Resultados obtenidos: 24 pruebas del backend aprobadas, check sin errores, migraciones al día y compilación React correcta. El navegador verificó login inválido/válido, registro real, recuperación de sesión al recargar, refresh, logout, bloqueo de la ruta protegida, selección real de país/ciudad y pantalla móvil sin desbordamiento horizontal. Los tests unitarios aíslan SOAP con mocks; las evidencias y el recorrido del navegador sí consultaron al proveedor real.

## Evidencias reales
[PDF de entrega](output/pdf/Resultado_Aprendizaje_U2_U3.pdf). Formato sencillo, Arial 14 y descripción debajo de cada captura.

PNG originales y resultados del recorrido: `output/evidencias/`. Las capturas corresponden a Chrome con los servidores en ejecución. No se fabricaron pantallas ni respuestas. Las imágenes de consola se capturaron desde el propio Chrome DevTools; el token aparece abreviado por el código de desarrollo.

Para repetir el recorrido (con ambos servidores ejecutándose):
```powershell
.\.venv\Scripts\python -m pip install -r requirements-evidence.txt
.\.venv\Scripts\python scripts/capturar_evidencias.py
.\.venv\Scripts\python scripts/crear_pdf.py
```
El recorrido crea un usuario de prueba único por ejecución. Para repetir la consola: ejecutar `scripts/capturar_consola.py` y, en otra terminal, `node scripts/capturar_devtools.mjs` mientras ese Chrome siga abierto. El segundo script captura el panel real de consola; su recorte corresponde a la ventana de prueba de esta máquina.

## Decisiones y límites
Se conserva React Router **v6** porque lo pide la rúbrica. `npm audit` informa dos avisos moderados de React Router cuya corrección requiere cambiar a v7; esta aplicación no usa SSR y sus destinos de navegación son rutas internas fijas. No se ejecutó una actualización mayor que incumpliera ese requisito.
Los tokens en localStorage siguen el enfoque del manual; para producción se recomienda una estrategia de sesión adecuada al despliegue, HTTPS y protección frente a XSS. El cierre local elimina los tokens del navegador; no revoca access tokens ya emitidos. La base de datos y la clave local no se publican. `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=0` y los hosts deben configurarse para producción.

## Referencias oficiales
- [React Router v6](https://reactrouter.com/6.30.3/start/overview)
- [Vite](https://vite.dev/guide/)
- [Open-Meteo](https://open-meteo.com/en/docs)
- [Zeep](https://docs.python-zeep.org/en/master/)
- [CountryInfoService WSDL](http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL)
- [django-cors-headers](https://github.com/adamchainz/django-cors-headers)
- Manual del curso: Desarrollo Django React, páginas 13 a 35, y rúbrica Resultado de aprendizaje-2y3.

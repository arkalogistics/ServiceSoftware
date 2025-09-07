# OrgProj – Gestor de proyectos con KYC/Contratos

Stack: Next.js 14 (App Router) + Chakra UI v2 + Prisma (SQLite) + NextAuth (credenciales + 2FA TOTP).

## Inicio rápido

1. Copia `.env.example` a `.env` y ajusta `NEXTAUTH_SECRET`.
2. Instala dependencias:
   - `npm install`
3. Genera e inicializa la BD:
   - `npx prisma migrate dev --name init`
4. Arranca la app:
   - `npm run dev`

## Características

- Registro/Login con contraseña y 2FA TOTP opcional.
- Dashboard y listado de proyectos (cards).
- KYC por proyecto: subida de INE frente/reverso, firma digital (canvas) y comprobante de domicilio. Los archivos se guardan en `public/uploads/`.
- Contrato de prestación de servicios editable (plantilla en `contracts/`), con firmas en formato dataURL.
- Documentos de proyecto (similar a filas de una hoja): título, status, fechas, horas y comentarios.

Nota legal: La plantilla de contrato es referencial y no constituye asesoría legal. Para contratos notariados, consulta a un notario/abogado y adapta el texto a tu jurisdicción.

## Seguridad

- Contraseñas con `bcryptjs` (12 rounds).
- 2FA TOTP (ruta `/2fa`).
- Cookies `secure` en producción y middleware de protección para rutas `/dashboard` y `/projects`.
- Límite básico de tasa en registro y subida de archivos.

## Próximos pasos sugeridos

- Integrar OCR (por ejemplo, Tesseract.js) para extraer campos de INE y mostrar un formulario de verificación antes de guardar.
- Generar PDF del contrato con firmas.
- Agregar roles/permisos y miembros por proyecto.
- Sustituir almacenamiento en disco por S3 u otro bucket.


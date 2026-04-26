# Buenas Prácticas Inmobiliarias (Next.js)

## 1. Imágenes (Rendimiento Crítico)
* **`next/image`**: Uso obligatorio para formatos modernos (WebP/AVIF) y compresión automática.
* **LCP Prioritario**: `priority={true}` exclusivamente en la imagen principal (Hero) de la propiedad.
* **Placeholder Blur**: `placeholder="blur"` en galerías y grids para mejorar la percepción de carga.
* **CDN Especializado**: Usar Cloudinary o Imgix si el volumen de fotos de alta resolución es masivo.

## 2. Arquitectura (App Router)
* **Server Components (RSC)**: Componente por defecto (Catálogos, Detalle de Propiedad) para enviar 0 KB de JS.
* **Client Components**: Restringidos a islas de interactividad (Mapas, Carruseles, Formularios, Favoritos).
* **ISR (Incremental Static Regeneration)**: Configurar `revalidate` en fetch para servir propiedades cacheadas ultra-rápidas.

## 3. SEO (Optimización Orgánica)
* **Metadata Dinámica**: `generateMetadata` para títulos dinámicos ("Villa en Marbella | $2.5M").
* **Structured Data (JSON-LD)**: Inyectar esquema `RealEstateListing` para Rich Snippets de Google.
* **Sitemaps Dinámicos**: `sitemap.ts` generado a partir del inventario en base de datos.
* **Open Graph (OG)**: Tarjetas visualmente atractivas al compartir links en WhatsApp/Redes.

## 4. Base de Datos (Supabase/PostgreSQL)
* **Búsquedas Geoespaciales**: Extensión `PostGIS` para búsquedas por mapa o cercanía (radio).
* **Estado en la URL**: Sincronizar filtros (`?beds=3&price=1M`) con la URL para búsquedas compartibles.
* **Keyset Pagination**: Paginación por cursor para scroll infinito eficiente (evitar `OFFSET`).

## 5. UI/UX "Premium"
* **Skeleton Loaders**: Estructuras previas al cargar/filtrar para evitar Layout Shifts (CLS).
* **Animaciones Fluidas**: Micro-interacciones lujosas en hover y transiciones de página.
* **Visores Inmersivos**: Galerías de fotos en pantalla completa.
* **Sticky CTA / FAB**: Botones de contacto ("Agendar Visita") siempre accesibles en móviles.

## 6. Manejo de Leads y Seguridad
* **Server Actions**: Procesar envío de formularios (contactos) de forma segura sin rutas de API.
* **Validación Robusta**: Uso de `Zod` para verificar teléfonos e emails antes de tocar la DB.
* **Anti-Spam Invisible**: Cloudflare Turnstile o reCAPTCHA v3 para blindar el buzón de asesores.

## 7. Manejo de Casos Especiales
* **Empty States Atractivos**: Sugerir propiedades similares si los filtros del usuario no arrojan resultados.
* **404s Personalizados**: Ofrecer buscador general si el usuario accede a una propiedad ya vendida/eliminada.

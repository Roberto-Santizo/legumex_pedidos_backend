# Schema Check — Módulo Contenedores

Fecha de verificación: 2026-04-13

---

## 1. ORM y base de datos

| Campo | Valor |
|-------|-------|
| ORM | TypeORM 0.3.28 |
| Base de datos | **PostgreSQL** (no MySQL) |
| Driver | `pg` |
| Sincronización | `synchronize: true` — NO hay sistema de migraciones. El schema se sincroniza automáticamente desde las entidades. |
| Framework | Express.js 5.2.1 (sin NestJS) |

**Implicación**: No hay comando `migration:generate`. Las entidades nuevas (`Container`, `ContainerOrder`) se registrarán en `datasource.ts` y TypeORM las creará automáticamente al arrancar el servidor.

---

## 2. Formato de `requiredByDate`

```
"2026-04-13"
```

**Formato: ISO `YYYY-MM-DD`** ✅

El filtro `BETWEEN` funciona por orden lexicográfico directamente. No se necesita `STR_TO_DATE()`.

En TypeORM/PostgreSQL:
```typescript
.where('"order"."requiredByDate" BETWEEN :weekStart AND :weekEnd', { weekStart, weekEnd })
```

---

## 3. Valores del ENUM `transportType`

| Valor |
|-------|
| `CROSSDOCK` |
| `PREPAID` |

Ya está declarado en la entidad `Order.ts` como:
```typescript
export enum TransportOptions {
    CROSSDOCK = "CROSSDOCK",
    PREPAID = "PREPAID",
}
```

**Acción**: Importar `TransportOptions` desde `../entities/Order` en la entidad `Container`. No redeclarar.

---

## 4. Valores reales del campo `dc`

| Valor |
|-------|
| `MINOOKA, IL (WHS 5359)` |
| `WALMART NEW CANEY D.C. 7010` |

Son strings largos con espacios, comas y paréntesis. El campo `dc` en la entidad `Container` debe ser `varchar(100)` mínimo (se usará `length: 200` por seguridad).

---

## 5. Valores del campo `status`

| status | count | Significado |
|--------|-------|-------------|
| 2 | 1 | Confirmado por sistema (pendiente verificar) |
| 3 | 1 | **Recibido** — solo estos entran al módulo de contenedores |

Confirmado: `status = 3` es el estado "Recibido". Solo órdenes con este status pueden agregarse a un contenedor.

---

## 6. Muestra de órdenes reales

| id | status | transportType | dc | requiredByDate | total_lbs | total_pallets | total_boxes |
|----|--------|---------------|----|----------------|-----------|---------------|-------------|
| 2 | 2 | PREPAID | MINOOKA, IL (WHS 5359) | 2026-04-13 | 80 | 1 | 20 |
| 1 | 3 | CROSSDOCK | WALMART NEW CANEY D.C. 7010 | 2026-04-13 | 12 | 6 | 12 |

**Observación**: La BD tiene muy pocos datos de prueba (2 órdenes). Solo la orden `id=1` tiene `status=3` y podría entrar a un contenedor.

---

## 7. Tablas de contenedores existentes

```
(ninguna)
```

No existe ninguna tabla con `container` en el nombre. El módulo parte de cero.

---

## 8. Nombre real de la columna con typo

En la entidad `Order.ts` la columna con typo se llama:
```typescript
@Column({ nullable: true })
receviedConfirmatioDate: string;   // ← typo original preservado
```

**No tocar.**

---

## 9. Diferencias clave respecto al prompt original (asumía MySQL)

| Aspecto | Prompt original asumía | Realidad del proyecto |
|---------|------------------------|----------------------|
| BD | MySQL | **PostgreSQL** |
| Backticks en SQL | `` `order` `` | **Comillas dobles** `"order"` |
| FLOAT8 | Tipo MySQL | En PostgreSQL es `float8` / `double precision` — TypeORM lo mapea como `float` |
| Migraciones | `migration:generate` | **No hay migraciones** — usa `synchronize: true` |
| STR_TO_DATE() | Función MySQL | No aplica — el formato ya es ISO, BETWEEN funciona directo |

---

## 10. Patrón de arquitectura del proyecto

```
entities/           ← TypeORM entities
domain/
  datasources/      ← interfaces abstractas (datasource)
  repositories/     ← interfaces abstractas (repository)
infrastructure/
  datasources/      ← implementaciones concretas
  repositories/     ← implementaciones concretas (wrappean datasource)
services/           ← lógica de negocio
controllers/        ← handlers HTTP (clases abstractas con métodos estáticos)
routes/             ← Express Router con express-validator
providers/          ← singletons de servicios (dependency injection manual)
resources/          ← transformación de entidades a DTOs de respuesta
```

Validación: `express-validator` (no class-validator, no zod, no joi).

Errores custom: `NotFoundError`, `ConflictError`, `NotAuthorizedError` en `src/infrastructure/errors/errors.ts`.

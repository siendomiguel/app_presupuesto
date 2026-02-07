# Fintrack - Aplicación de Presupuesto

Aplicación de seguimiento de gastos y presupuestos con soporte multi-moneda (USD/COP).

## 🚀 Configuración de la Base de Datos

### Paso 1: Ejecutar el Schema SQL en Supabase

1. Abre tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido completo del archivo `supabase/schema.sql`
5. Haz clic en **Run** para ejecutar el script

El script creará:
- ✅ Tablas: `profiles`, `categories`, `accounts`, `budgets`, `transactions`
- ✅ Políticas RLS para seguridad
- ✅ Vista `budget_progress` para cálculos de presupuesto
- ✅ Función `create_default_categories` para categorías predeterminadas
- ✅ Trigger automático para crear perfil y categorías al registrar usuario

### Paso 2: Verificar la Instalación

Ejecuta esta query en el SQL Editor para verificar que las tablas se crearon correctamente:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver: `accounts`, `budgets`, `categories`, `profiles`, `transactions`

### Paso 3: Verificar RLS

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 📦 Instalación Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 🔑 Variables de Entorno

Asegúrate de tener configurado tu archivo `.env` con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-proyecto
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-clave-publica
```

## 🎯 Características

- ✅ Autenticación con Supabase
- ✅ Soporte multi-moneda (USD y COP)
- ✅ Presupuestos compartidos entre monedas
- ✅ Categorías personalizables
- ✅ Gráficos y reportes visuales
- ✅ Dashboard interactivo
- ✅ Responsive design

## 📊 Estructura de la Base de Datos

### Tablas Principales

- **profiles**: Información del usuario
- **categories**: Categorías de ingresos/gastos
- **accounts**: Cuentas bancarias y tarjetas
- **budgets**: Presupuestos con soporte multi-moneda
- **transactions**: Transacciones con moneda específica

### Características Especiales

- Cada transacción tiene una moneda específica (USD o COP)
- Los presupuestos pueden tener montos en ambas monedas
- Los gastos se descuentan automáticamente del presupuesto correspondiente
- Categorías predeterminadas se crean automáticamente al registrarse

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **UI**: shadcn/ui, Tailwind CSS
- **Gráficos**: Recharts
- **Validación**: Zod + React Hook Form

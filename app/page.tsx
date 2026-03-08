import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BarChart3,
  Brain,
  CreditCard,
  DollarSign,
  Globe,
  LayoutDashboard,
  LineChart,
  Lock,
  PiggyBank,
  Shield,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
  CheckCircle2,
  Star,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image src="/Logo.png" alt="Fintrack" width={32} height={32} />
            <span className="text-lg font-bold tracking-tight">Fintrack</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Funciones
            </a>
            <a href="#ai-insights" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              IA Insights
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Planes
            </a>
            <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <LayoutDashboard className="h-4 w-4" />
                Ir al dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Iniciar sesion
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Empezar gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute right-0 top-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Ahora con analisis de IA integrado
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Tus finanzas bajo control.{" "}
              <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                Sin excusas.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Deja de preguntarte &quot;a donde se fue mi dinero&quot;. Fintrack te muestra exactamente como gastas,
              te alerta cuando te excedes y te da recomendaciones con inteligencia artificial para que ahorres de verdad.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Ir al dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/sign-up"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
                >
                  Crear cuenta gratis
                  <ArrowRight className="h-5 w-5" />
                </Link>
              )}
              <a
                href="#features"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 py-3.5 text-base font-semibold transition-colors hover:bg-muted sm:w-auto"
              >
                Ver funciones
              </a>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                100% gratis
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Sin tarjeta de credito
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Multi-moneda
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { value: "USD + COP", label: "Soporte multi-moneda" },
            { value: "100%", label: "Gratis para siempre" },
            { value: "IA", label: "Analisis inteligente" },
            { value: "PWA", label: "Instala en tu celular" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem / Agitation */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            El 78% de las personas no sabe cuanto gasta al mes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Gastos hormiga, suscripciones olvidadas, compras impulsivas... todo suma.
            Si no mides tu dinero, no puedes controlarlo. Y si no lo controlas, se va.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: TrendingUp,
              title: "Gastas mas de lo que crees",
              description:
                "Ese cafe diario de $3 son $90 al mes. Esa suscripcion que no usas, $15 mas. Los gastos pequenos son los mas peligrosos porque no los ves.",
            },
            {
              icon: Target,
              title: "No tienes un plan",
              description:
                'Sin presupuesto, cada mes es una ruleta. Fintrack te ayuda a definir limites por categoria y te avisa antes de que te pases.',
            },
            {
              icon: Brain,
              title: "Necesitas un asesor, no otra app",
              description:
                "No quieres solo graficos bonitos. Quieres que alguien te diga: 'estas gastando 40% en vivienda, deberia ser 30%'. Eso hace nuestra IA.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que necesitas para dominar tu dinero
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sin curva de aprendizaje. Registra un gasto en 5 segundos y deja que Fintrack haga el resto.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Wallet,
                title: "Transacciones",
                description: "Registra ingresos, gastos y transferencias. Categoriza, filtra y busca cualquier movimiento al instante.",
              },
              {
                icon: Target,
                title: "Presupuestos",
                description: "Define limites mensuales por categoria. Barra de progreso visual que cambia de color cuando te acercas al tope.",
              },
              {
                icon: BarChart3,
                title: "Reportes visuales",
                description: "Graficos de tendencia, distribucion por categoria y comparativas mensuales. Exporta a CSV cuando quieras.",
              },
              {
                icon: Globe,
                title: "Multi-moneda USD/COP",
                description: "Maneja dolares y pesos colombianos en la misma cuenta. Tasa de cambio automatica o manual.",
              },
              {
                icon: CreditCard,
                title: "Multiples cuentas",
                description: "Efectivo, banco, tarjeta de credito, ahorros. Ve el balance consolidado o por cuenta individual.",
              },
              {
                icon: PiggyBank,
                title: "Metas de ahorro",
                description: "Crea objetivos con fecha limite y monto meta. Deposita desde cualquier cuenta y ve tu progreso.",
              },
              {
                icon: DollarSign,
                title: "Items y precios",
                description: "Registra los productos de cada compra. Compara precios del mismo producto en distintos comercios.",
              },
              {
                icon: Smartphone,
                title: "PWA - Instala en tu celular",
                description: "Funciona como app nativa. Instalala desde el navegador y accede sin abrir Chrome.",
              },
              {
                icon: LineChart,
                title: "Lista de compras",
                description: "Planifica tus compras antes de ir al super. Marca items como comprados y controla el gasto.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <h3 className="mt-3 font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Insights Section */}
      <section id="ai-insights" className="relative overflow-hidden border-t border-border">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-0 top-1/3 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Nuevo
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Tu asesor financiero personal.{" "}
                <span className="text-primary">Potenciado por IA.</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                No es otro chatbot generico. Fintrack analiza TUS transacciones reales y te da recomendaciones
                que aplican a TU situacion financiera.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "Detecta gastos recurrentes y suscripciones ocultas",
                  "Compara precios del mismo producto en distintos comercios",
                  "Evalua si cumples la regla 50/30/20 y la regla del 30% en vivienda",
                  "Identifica gastos hormiga que suman cientos al mes",
                  "Puntuacion de salud financiera de 1 a 100",
                  "Recomendaciones personalizadas para ahorrar mas",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Score Card mockup */}
            <div className="flex justify-center">
              <div className="w-full max-w-md space-y-4">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                      <svg className="-rotate-90" width="96" height="96" viewBox="0 0 96 96">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <circle
                          cx="48" cy="48" r="40" fill="none"
                          stroke="hsl(158, 64%, 42%)" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - 0.74)}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-xl font-bold text-primary">74</span>
                        <span className="text-[9px] text-muted-foreground">/100</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">Salud Financiera: Bueno</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Tus ingresos superan tus gastos, pero hay oportunidades de ahorro por $180/mes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      Oportunidad
                    </div>
                    <p className="mt-2 text-sm font-medium">Vivienda al 35%</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Deberia ser max 30%</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <PiggyBank className="h-3.5 w-3.5 text-primary" />
                      Ahorro posible
                    </div>
                    <p className="mt-2 text-lg font-bold text-primary">$180</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">al mes</p>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs font-medium text-primary">Recomendacion IA</p>
                  <p className="mt-1 text-sm text-foreground">
                    &quot;Tienes 3 suscripciones que suman $45/mes. Cancela Spotify familiar si solo lo usas tu
                    y ahorra $10 mensuales.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Empieza en 2 minutos</h2>
            <p className="mt-4 text-muted-foreground">Sin configuracion complicada. Sin conectar tu banco. Tu decides que registrar.</p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Crea tu cuenta gratis",
                description: "Solo necesitas un email. Sin tarjeta de credito, sin periodo de prueba. Es gratis de verdad.",
              },
              {
                step: "02",
                title: "Registra tus movimientos",
                description: "Agrega ingresos y gastos en segundos. Categoriza, agrega notas y lleva el control de cada peso.",
              },
              {
                step: "03",
                title: "Recibe insights con IA",
                description: "Haz clic en 'Generar analisis' y obtiene recomendaciones personalizadas basadas en tus datos reales.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / Trust */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Construido para personas reales</h2>
            <p className="mt-4 text-muted-foreground">
              No para traders ni contadores. Para ti, que quiere saber a donde va su plata.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "Por fin una app que me dice la verdad sobre mis gastos. El analisis de IA me mostro que gastaba $120/mes en delivery sin darme cuenta.",
                name: "Carolina M.",
                role: "Freelancer",
              },
              {
                quote: "Lo uso todos los dias. Es rapido, simple y el soporte de USD y COP es exactamente lo que necesitaba viviendo entre dos paises.",
                name: "Andres R.",
                role: "Desarrollador remoto",
              },
              {
                quote: "Mi esposa y yo empezamos a registrar todo. En 2 meses ahorramos $300 solo eliminando gastos que no sabiamos que teniamos.",
                name: "Miguel T.",
                role: "Ingeniero",
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security / Trust badges */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Datos seguros",
                description: "Autenticacion con Supabase. Tus datos son tuyos y de nadie mas. Row Level Security en cada consulta.",
              },
              {
                icon: Lock,
                title: "Privacidad primero",
                description: "No vendemos tus datos. No conectamos con tu banco. Tu decides que registrar y que no.",
              },
              {
                icon: Smartphone,
                title: "Funciona en cualquier dispositivo",
                description: "Web responsive + PWA. Usa Fintrack desde tu celular, tablet o computador sin instalar nada.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Un precio simple: gratis</h2>
            <p className="mt-4 text-muted-foreground">
              Sin trucos, sin limites artificiales, sin &quot;upgrade para ver tus datos&quot;.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-md">
            <div className="rounded-2xl border-2 border-primary bg-card p-8 shadow-lg shadow-primary/10">
              <div className="text-center">
                <p className="text-sm font-medium text-primary">Plan actual</p>
                <div className="mt-2 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Para siempre. En serio.</p>
              </div>

              <ul className="mt-8 space-y-3">
                {[
                  "Transacciones ilimitadas",
                  "Presupuestos por categoria",
                  "Reportes y graficos",
                  "Multi-moneda USD/COP",
                  "Multiples cuentas",
                  "Items y comparacion de precios",
                  "Lista de compras",
                  "Metas de ahorro",
                  "Analisis con IA",
                  "Exportar a CSV",
                  "PWA - Instala en tu celular",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={isLoggedIn ? "/dashboard" : "/auth/sign-up"}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {isLoggedIn ? (
                  <>
                    <LayoutDashboard className="h-5 w-5" />
                    Ir al dashboard
                  </>
                ) : (
                  <>
                    Crear cuenta gratis
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Preguntas frecuentes</h2>

          <div className="mt-12 space-y-6">
            {[
              {
                q: "Es realmente gratis?",
                a: "Si. Todas las funciones estan disponibles sin costo. No hay version 'premium' oculta que te limite funciones basicas.",
              },
              {
                q: "Necesito conectar mi banco?",
                a: "No. Fintrack es 100% manual por diseno. Tu decides que registrar. Esto te da mas control y consciencia sobre cada gasto.",
              },
              {
                q: "Como funciona el analisis de IA?",
                a: "Analiza tus transacciones reales (categorias, montos, frecuencia) y genera recomendaciones personalizadas. Evalua reglas financieras como la 50/30/20 y te da una puntuacion de salud financiera.",
              },
              {
                q: "Puedo usarlo en mi celular?",
                a: "Si. Fintrack es una PWA (Progressive Web App). Puedes instalarla desde el navegador de tu celular y funciona como una app nativa, incluso con icono en tu pantalla de inicio.",
              },
              {
                q: "Mis datos estan seguros?",
                a: "Usamos Supabase con Row Level Security. Cada usuario solo puede ver sus propios datos. No compartimos ni vendemos informacion a terceros.",
              },
              {
                q: "Soporta dolares y pesos colombianos?",
                a: "Si. Puedes registrar transacciones en USD o COP, configurar tasa de cambio automatica o manual, y ver tus reportes en cualquier moneda.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute inset-0 -z-0">
              <div className="absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-white/10 blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-black/10 blur-[80px]" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
                Empieza hoy. Tu yo del futuro te lo va a agradecer.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
                Cada dia sin registrar tus gastos es un dia mas de descontrol.
                Toma 2 minutos crear tu cuenta y empieza a entender tu dinero.
              </p>
              <Link
                href={isLoggedIn ? "/dashboard" : "/auth/sign-up"}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
              >
                {isLoggedIn ? (
                  <>
                    <LayoutDashboard className="h-5 w-5" />
                    Ir al dashboard
                  </>
                ) : (
                  <>
                    Crear cuenta gratis
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Image src="/Logo.png" alt="Fintrack" width={24} height={24} />
              <span className="text-sm font-semibold">Fintrack</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Hecho con cafe y determinacion. Tu presupuesto bajo control.
            </p>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
                    Iniciar sesion
                  </Link>
                  <Link href="/auth/sign-up" className="text-sm text-muted-foreground hover:text-foreground">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

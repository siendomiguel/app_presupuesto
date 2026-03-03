"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Download from "lucide-react/dist/esm/icons/download"
import CheckCircle from "lucide-react/dist/esm/icons/check-circle"
import Smartphone from "lucide-react/dist/esm/icons/smartphone"
import Info from "lucide-react/dist/esm/icons/info"
import Globe from "lucide-react/dist/esm/icons/globe"
import Shield from "lucide-react/dist/esm/icons/shield"

import pkg from "@/package.json"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function HelpPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    // Detect iOS
    const ua = navigator.userAgent
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
      setIsIOS(true)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Ayuda</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Informacion sobre la aplicacion e instalacion
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* App Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" />
              Acerca de Fintrack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Image
                src="/icon-192x192.png"
                alt="Fintrack"
                width={64}
                height={64}
                className="rounded-xl"
              />
              <div>
                <h3 className="font-semibold text-foreground">Fintrack</h3>
                <p className="text-sm text-muted-foreground">Tu presupuesto bajo control</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm font-medium text-foreground">v{pkg.version}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Plataforma</span>
                <span className="text-sm font-medium text-foreground">Web App (PWA)</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Monedas</span>
                <span className="text-sm font-medium text-foreground">USD / COP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Install Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5 text-primary" />
              Instalar aplicacion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isInstalled ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle className="h-12 w-12 text-primary mb-3" />
                <p className="font-medium text-foreground">App instalada</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Fintrack ya esta instalada en tu dispositivo
                </p>
              </div>
            ) : deferredPrompt ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Instala Fintrack en tu dispositivo para acceder rapidamente sin abrir el navegador.
                </p>
                <Button onClick={handleInstall} className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Instalar Fintrack
                </Button>
              </div>
            ) : isIOS ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Para instalar Fintrack en tu iPhone o iPad:
                </p>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">1.</span>
                    Abre esta pagina en <strong className="text-foreground">Safari</strong>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">2.</span>
                    Toca el boton <strong className="text-foreground">Compartir</strong> (icono de cuadrado con flecha)
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">3.</span>
                    Selecciona <strong className="text-foreground">&quot;Agregar a pantalla de inicio&quot;</strong>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Para instalar Fintrack en tu dispositivo:
                </p>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">1.</span>
                    Abre el menu de tu navegador (tres puntos)
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">2.</span>
                    Selecciona <strong className="text-foreground">&quot;Instalar aplicacion&quot;</strong> o <strong className="text-foreground">&quot;Agregar a pantalla de inicio&quot;</strong>
                  </li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" />
              Caracteristicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Multi-moneda", desc: "Soporte para USD y COP con conversion automatica" },
                { title: "Presupuestos", desc: "Crea y monitorea presupuestos mensuales por categoria" },
                { title: "Reportes", desc: "Visualiza tus gastos con graficos interactivos" },
                { title: "Tarjetas", desc: "Administra tus tarjetas y fechas de corte" },
                { title: "Exportar CSV", desc: "Exporta tus transacciones para analisis externo" },
                { title: "Modo oscuro", desc: "Interfaz adaptable para uso diurno y nocturno" },
              ].map((feature) => (
                <div key={feature.title} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{feature.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

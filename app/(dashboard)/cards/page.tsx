import { Card, CardContent } from "@/components/ui/card"
import CreditCard from "lucide-react/dist/esm/icons/credit-card"

export default function CardsPage() {
    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Tarjetas</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Gestiona tus tarjetas de credito y debito
                </p>
            </div>

            <Card className="border-border/60">
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">Proximamente</h2>
                    <p className="text-sm text-muted-foreground text-center max-w-sm">
                        Estamos trabajando en la gestion de tarjetas. Pronto podras vincular tus tarjetas y ver sus movimientos aqui.
                    </p>
                </CardContent>
            </Card>
        </>
    )
}

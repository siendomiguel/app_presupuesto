import type { LucideIcon } from "lucide-react"

// Food & Dining
import UtensilsCrossed from "lucide-react/dist/esm/icons/utensils-crossed"
import Coffee from "lucide-react/dist/esm/icons/coffee"
import Wine from "lucide-react/dist/esm/icons/wine"
import Pizza from "lucide-react/dist/esm/icons/pizza"
import Apple from "lucide-react/dist/esm/icons/apple"
import IceCreamCone from "lucide-react/dist/esm/icons/ice-cream-cone"
import CookingPot from "lucide-react/dist/esm/icons/cooking-pot"

// Transport
import Car from "lucide-react/dist/esm/icons/car"
import Bus from "lucide-react/dist/esm/icons/bus"
import Plane from "lucide-react/dist/esm/icons/plane"
import Fuel from "lucide-react/dist/esm/icons/fuel"
import Bike from "lucide-react/dist/esm/icons/bike"

// Shopping
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart"
import ShoppingBag from "lucide-react/dist/esm/icons/shopping-bag"
import Shirt from "lucide-react/dist/esm/icons/shirt"
import Gift from "lucide-react/dist/esm/icons/gift"
import Tag from "lucide-react/dist/esm/icons/tag"

// Housing
import Home from "lucide-react/dist/esm/icons/home"
import Building2 from "lucide-react/dist/esm/icons/building-2"
import Key from "lucide-react/dist/esm/icons/key"
import Bed from "lucide-react/dist/esm/icons/bed"
import Sofa from "lucide-react/dist/esm/icons/sofa"

// Bills & Utilities
import Zap from "lucide-react/dist/esm/icons/zap"
import Wifi from "lucide-react/dist/esm/icons/wifi"
import Phone from "lucide-react/dist/esm/icons/phone"
import Receipt from "lucide-react/dist/esm/icons/receipt"
import FileText from "lucide-react/dist/esm/icons/file-text"
import Droplets from "lucide-react/dist/esm/icons/droplets"

// Health
import Heart from "lucide-react/dist/esm/icons/heart"
import HeartPulse from "lucide-react/dist/esm/icons/heart-pulse"
import Pill from "lucide-react/dist/esm/icons/pill"
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope"
import Activity from "lucide-react/dist/esm/icons/activity"

// Entertainment
import Gamepad2 from "lucide-react/dist/esm/icons/gamepad-2"
import Music from "lucide-react/dist/esm/icons/music"
import Film from "lucide-react/dist/esm/icons/film"
import Tv from "lucide-react/dist/esm/icons/tv"
import Ticket from "lucide-react/dist/esm/icons/ticket"

// Education
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap"
import BookOpen from "lucide-react/dist/esm/icons/book-open"
import PenTool from "lucide-react/dist/esm/icons/pen-tool"

// Finance
import Banknote from "lucide-react/dist/esm/icons/banknote"
import Wallet from "lucide-react/dist/esm/icons/wallet"
import CreditCard from "lucide-react/dist/esm/icons/credit-card"
import PiggyBank from "lucide-react/dist/esm/icons/piggy-bank"
import Coins from "lucide-react/dist/esm/icons/coins"
import Landmark from "lucide-react/dist/esm/icons/landmark"
import TrendingUp from "lucide-react/dist/esm/icons/trending-up"
import TrendingDown from "lucide-react/dist/esm/icons/trending-down"
import Calculator from "lucide-react/dist/esm/icons/calculator"

// Work
import Briefcase from "lucide-react/dist/esm/icons/briefcase"
import Laptop from "lucide-react/dist/esm/icons/laptop"
import Monitor from "lucide-react/dist/esm/icons/monitor"

// General
import Star from "lucide-react/dist/esm/icons/star"
import Flag from "lucide-react/dist/esm/icons/flag"
import CircleDot from "lucide-react/dist/esm/icons/circle-dot"
import Package from "lucide-react/dist/esm/icons/package"
import Scissors from "lucide-react/dist/esm/icons/scissors"
import Wrench from "lucide-react/dist/esm/icons/wrench"
import Shield from "lucide-react/dist/esm/icons/shield"
import Smile from "lucide-react/dist/esm/icons/smile"
import Dog from "lucide-react/dist/esm/icons/dog"
import Baby from "lucide-react/dist/esm/icons/baby"
import Dumbbell from "lucide-react/dist/esm/icons/dumbbell"

export interface IconEntry {
    name: string
    label: string
    component: LucideIcon
    keywords: string[]
}

export const ICON_REGISTRY: IconEntry[] = [
    // Food & Dining
    { name: "utensils-crossed", label: "Cubiertos", component: UtensilsCrossed, keywords: ["comida", "restaurante", "alimentación", "comer"] },
    { name: "coffee", label: "Café", component: Coffee, keywords: ["bebida", "cafetería"] },
    { name: "wine", label: "Vino", component: Wine, keywords: ["bebida", "alcohol", "bar"] },
    { name: "pizza", label: "Pizza", component: Pizza, keywords: ["comida", "rápida", "fast food"] },
    { name: "apple", label: "Manzana", component: Apple, keywords: ["fruta", "mercado", "supermercado"] },
    { name: "ice-cream-cone", label: "Helado", component: IceCreamCone, keywords: ["postre", "dulce"] },
    { name: "cooking-pot", label: "Olla", component: CookingPot, keywords: ["cocina", "cocinar", "hogar"] },

    // Transport
    { name: "car", label: "Auto", component: Car, keywords: ["carro", "vehículo", "transporte"] },
    { name: "bus", label: "Bus", component: Bus, keywords: ["transporte", "público", "transmilenio"] },
    { name: "plane", label: "Avión", component: Plane, keywords: ["viaje", "vuelo", "vacaciones"] },
    { name: "fuel", label: "Gasolina", component: Fuel, keywords: ["combustible", "tanquear", "gas"] },
    { name: "bike", label: "Bicicleta", component: Bike, keywords: ["transporte", "ejercicio", "ciclismo"] },

    // Shopping
    { name: "shopping-cart", label: "Carrito", component: ShoppingCart, keywords: ["compras", "tienda", "supermercado", "mercado"] },
    { name: "shopping-bag", label: "Bolsa", component: ShoppingBag, keywords: ["compras", "tienda", "ropa"] },
    { name: "shirt", label: "Ropa", component: Shirt, keywords: ["vestimenta", "camisa", "moda"] },
    { name: "gift", label: "Regalo", component: Gift, keywords: ["presente", "cumpleaños", "navidad"] },
    { name: "tag", label: "Etiqueta", component: Tag, keywords: ["precio", "oferta", "descuento"] },

    // Housing
    { name: "home", label: "Casa", component: Home, keywords: ["hogar", "vivienda", "arriendo", "alquiler"] },
    { name: "building-2", label: "Edificio", component: Building2, keywords: ["oficina", "empresa", "apartamento"] },
    { name: "key", label: "Llave", component: Key, keywords: ["arriendo", "alquiler", "propiedad"] },
    { name: "bed", label: "Cama", component: Bed, keywords: ["hotel", "hospedaje", "dormitorio"] },
    { name: "sofa", label: "Sofá", component: Sofa, keywords: ["mueble", "hogar", "sala"] },

    // Bills & Utilities
    { name: "zap", label: "Electricidad", component: Zap, keywords: ["luz", "energía", "servicio", "recibo"] },
    { name: "wifi", label: "Internet", component: Wifi, keywords: ["red", "servicio", "cable"] },
    { name: "phone", label: "Teléfono", component: Phone, keywords: ["celular", "móvil", "plan", "llamada"] },
    { name: "receipt", label: "Recibo", component: Receipt, keywords: ["factura", "cuenta", "pago"] },
    { name: "file-text", label: "Documento", component: FileText, keywords: ["factura", "contrato", "papel"] },
    { name: "droplets", label: "Agua", component: Droplets, keywords: ["servicio", "acueducto", "recibo"] },

    // Health
    { name: "heart", label: "Corazón", component: Heart, keywords: ["salud", "amor", "vida"] },
    { name: "heart-pulse", label: "Salud", component: HeartPulse, keywords: ["médico", "hospital", "doctor"] },
    { name: "pill", label: "Medicina", component: Pill, keywords: ["farmacia", "pastilla", "medicamento"] },
    { name: "stethoscope", label: "Estetoscopio", component: Stethoscope, keywords: ["doctor", "médico", "consulta"] },
    { name: "activity", label: "Actividad", component: Activity, keywords: ["ejercicio", "deporte", "fitness"] },

    // Entertainment
    { name: "gamepad-2", label: "Videojuego", component: Gamepad2, keywords: ["juego", "gaming", "consola", "entretenimiento"] },
    { name: "music", label: "Música", component: Music, keywords: ["spotify", "concierto", "entretenimiento"] },
    { name: "film", label: "Película", component: Film, keywords: ["cine", "netflix", "entretenimiento"] },
    { name: "tv", label: "Televisión", component: Tv, keywords: ["streaming", "series", "cable"] },
    { name: "ticket", label: "Ticket", component: Ticket, keywords: ["entrada", "evento", "concierto"] },

    // Education
    { name: "graduation-cap", label: "Graduación", component: GraduationCap, keywords: ["universidad", "educación", "estudio", "colegio"] },
    { name: "book-open", label: "Libro", component: BookOpen, keywords: ["lectura", "estudio", "educación", "curso"] },
    { name: "pen-tool", label: "Pluma", component: PenTool, keywords: ["escritura", "diseño", "arte"] },

    // Finance
    { name: "banknote", label: "Billete", component: Banknote, keywords: ["dinero", "efectivo", "plata", "salario"] },
    { name: "wallet", label: "Billetera", component: Wallet, keywords: ["dinero", "cartera", "pago"] },
    { name: "credit-card", label: "Tarjeta", component: CreditCard, keywords: ["crédito", "débito", "pago", "banco"] },
    { name: "piggy-bank", label: "Alcancía", component: PiggyBank, keywords: ["ahorro", "guardar", "savings"] },
    { name: "coins", label: "Monedas", component: Coins, keywords: ["dinero", "cambio", "suelto"] },
    { name: "landmark", label: "Banco", component: Landmark, keywords: ["institución", "financiera", "gobierno"] },
    { name: "trending-up", label: "Subida", component: TrendingUp, keywords: ["ingreso", "ganancia", "inversión", "positivo"] },
    { name: "trending-down", label: "Bajada", component: TrendingDown, keywords: ["gasto", "pérdida", "negativo"] },
    { name: "calculator", label: "Calculadora", component: Calculator, keywords: ["cálculo", "matemáticas", "contabilidad"] },

    // Work
    { name: "briefcase", label: "Maletín", component: Briefcase, keywords: ["trabajo", "oficina", "negocio", "empleo"] },
    { name: "laptop", label: "Laptop", component: Laptop, keywords: ["computador", "trabajo", "tecnología"] },
    { name: "monitor", label: "Monitor", component: Monitor, keywords: ["computador", "pantalla", "escritorio"] },

    // General
    { name: "star", label: "Estrella", component: Star, keywords: ["favorito", "importante", "especial"] },
    { name: "flag", label: "Bandera", component: Flag, keywords: ["meta", "objetivo", "prioridad"] },
    { name: "circle-dot", label: "Punto", component: CircleDot, keywords: ["otro", "general", "varios"] },
    { name: "package", label: "Paquete", component: Package, keywords: ["envío", "delivery", "domicilio"] },
    { name: "scissors", label: "Tijeras", component: Scissors, keywords: ["peluquería", "corte", "belleza"] },
    { name: "wrench", label: "Herramienta", component: Wrench, keywords: ["reparación", "mantenimiento", "arreglo"] },
    { name: "shield", label: "Escudo", component: Shield, keywords: ["seguro", "protección", "seguridad"] },
    { name: "smile", label: "Sonrisa", component: Smile, keywords: ["personal", "bienestar", "felicidad"] },
    { name: "dog", label: "Mascota", component: Dog, keywords: ["perro", "gato", "veterinario", "animal"] },
    { name: "baby", label: "Bebé", component: Baby, keywords: ["hijo", "niño", "familia", "pañales"] },
    { name: "dumbbell", label: "Pesas", component: Dumbbell, keywords: ["gimnasio", "gym", "ejercicio", "deporte"] },
]

export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
    ICON_REGISTRY.map(e => [e.name, e.component])
)

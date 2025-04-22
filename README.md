# 💸 Zenkoo - App de Ahorro Personal

Zenkoo es una aplicación web para gestionar tus finanzas personales, basada en el método **Kakeibo**. Permite registrar ingresos, gastos, metas de ahorro y reflexiones personales. Además, integra precios en tiempo real de criptomonedas populares (BTC, ETH, USDT) mediante CoinGecko y WebSockets.

🧠 Proyecto final del **Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Web (DAW)** – Ilerna.

🔗 Repositorio del backend: [zenkoo-backend](https://github.com/AlbertClemente/zenkoo-backend)

---

## 🧠 ¿Qué es el frontend de Zenkoo?

Esta es la interfaz de usuario desarrollada en **Next.js 15** con **TypeScript** y **Mantine 7**, diseñada para ofrecer una experiencia fluida y moderna. La app permite a los usuarios:

- Visualizar sus ingresos, gastos y metas de ahorro.
- Seguir el método Kakeibo con planificación mensual.
- Ver notificaciones en tiempo real y actualizaciones de criptomonedas.
- Gestionar su perfil, contraseña e imagen.
- Categorización de gastos mediante IA.
- Disfrutar de un diseño responsive y accesible.

---

## 🛠️ Tecnologías utilizadas

- **Next.js 15** (App Router)
- **TypeScript**
- **Mantine 7** (UI & Dates)
- **Recharts** (Gráficas)
- **Axios** (API requests)
- **JWT** (Autenticación)
- **WebSocket API** (cripto y notificaciones en tiempo real)
- **Docker** (imagen de producción)

---

## 🔧 Instalación en local

1. Clona el repositorio:

```bash
git clone https://github.com/AlbertClemente/zenkoo-frontend.git
cd zenkoo-frontend
```

2. Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_HOST=ws://localhost:8000
```

3. Instala dependencias y arranca el servidor de desarrollo:

```bash
npm install
npm run dev
```

La app se abrirá en [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker

Puedes generar una imagen optimizada para producción con:

```bash
docker build -t zenkoo-frontend .
docker run -p 3000:3000 zenkoo-frontend
```

> Asegúrate de que el backend está corriendo en `localhost:8000` o actualiza las variables de entorno de producción en el Dockerfile o con `ENV`.

---

## 🧪 Funcionalidades implementadas

- Login / registro con JWT
- Dashboard con resumen mensual Kakeibo
- Calendario con ingresos y gastos diarios
- Gestión de metas de ahorro con filtros y paginación
- Drawer de configuración de usuario (nombre, email, contraseña, avatar)
- Notificaciones y precios en tiempo real con WebSocket
- IA de categorización automática de gastos
- Panel de administración (solo para Admin)
- Responsive completo

---

## 📂 Estructura del proyecto

```bash
zenkoo-frontend/
├── public/                 # Archivos estáticos (favicon, logo, etc.)
├── src/
│   ├── app/                # Rutas (Next.js App Router)
│   ├── assets/             # Favicon
│   │   ├── (protected)/    # Páginas protegidas
│   │   ├── 403/            # Página de prohibido el acceso
│   ├── components/         # Componentes de interfaz reutilizables
│   ├── context/            # AuthContext
│   ├── hooks/              # Hooks personalizados (fetching, lógica)
│   ├── lib/                # Lógica de acceso a API (axios)
│   ├── theme/              # Tema personalizado (Mantine)
│   └── types/              # Tipos y modelos TS
├── Dockerfile              # Imagen Docker para producción
├── .env.local              # Variables de entorno locales (excluidas del repo)
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuración de TypeScript
└── README.md               # Este archivo
```

---

## 🧑‍💻 Autor

Desarrollado por [Albert Clemente](https://github.com/AlbertClemente) como proyecto final del CFGS DAW en [Ilerna](https://www.ilerna.es/).

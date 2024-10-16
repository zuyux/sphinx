# 👁️‍🗨️ Sphinx

_"¿Qué ser camina en cuatro patas por la mañana, en dos patas al mediodía y en tres patas por la tarde?"_

## Descripción

Sphinx es una aplicación descentralizada (dApp) que fomenta la participación intelectual de sus usuarios a través de preguntas generadas por inteligencia artificial. Cada día, semana o mes, la dApp propone una pregunta basada en eventos actuales, hechos históricos y tendencias globales. Los usuarios pueden participar pagando una pequeña cantidad de sBTC para responder, y la respuesta más votada se lleva la mayor parte del pool de recompensas.

La plataforma se basa en **Next.js** para la interfaz y utiliza **Clarity** como lenguaje de programación para los contratos inteligentes en la blockchain de Stacks. Los usuarios pueden autenticarse mediante **Xverse Wallet** y otras opciones de inicio de sesión con cuentas sociales.

## Características Principales

1. **Generación de Preguntas con IA**:
   - Una IA analiza noticias globales y datos históricos para generar preguntas relevantes cada semana o mes.
   - La pregunta se publica automáticamente a las 00:00 horas del domingo y se inicia el concurso.

2. **Participación y Apuestas**:
   - Los usuarios pagan mínimo $0.75 USD en sBTC para participar respondiendo la pregunta de la semana. Si paga más, ocupa mayor visibilidad su respuesta.
   - Las respuestas se almacenan en un contrato inteligente y se abren a votación por parte de la comunidad.

3. **Votación Ponderada**:
   - Los usuarios pueden votar por su respuesta favorita. Los votos pueden estar ponderados en función de la cantidad de tokens en juego o la reputación del votante.
   - Se implementa un sistema que permite a los usuarios incrementar el peso de sus votos usando tokens adicionales.

4. **Distribución de Recompensas**:
   - La respuesta con más votos recibe el 80% del pool total acumulado.
   - Un 10% del pool se distribuye entre los usuarios que votaron por la respuesta ganadora.
   - El 10% restante se destina a la dApp como fee por mantenimiento y operación.

## Tecnologías Utilizadas

- **Next.js**: Framework de React para construir interfaces rápidas y optimizadas.
- **Clarity**: Lenguaje de programación para contratos inteligentes en Stacks.
- **Xverse Wallet**: Autenticación con billeteras compatibles con Stacks y sBTC.
- **NextAuth.js**: Integración de autenticación con cuentas sociales (Google, Facebook, Twitter).
- **OpenAI GPT-4**: Modelo de lenguaje usado para la generación automática de preguntas basadas en datos contextuales.

## Arquitectura

### 1. Frontend: Next.js
- La interfaz de usuario se implementa en Next.js, proporcionando una experiencia fluida y optimizada.
- Autenticación con Xverse Wallet y NextAuth.js para cuentas sociales.

### 2. Backend: Contratos Inteligentes en Clarity
- Los contratos inteligentes manejan la lógica de participación, votación y distribución de recompensas.
- Clarity garantiza la seguridad y transparencia en las transacciones y gestión de fondos.

### 3. Generación de Preguntas: IA
- El backend interactúa con el modelo de lenguaje GPT-4 para generar preguntas de forma automática y contextual.

## Configuración del Proyecto

### Prerrequisitos
- Node.js v14 o superior.
- Next.js.
- Xverse Wallet (para autenticación).
- Clarity (para contratos inteligentes).

### Instalación
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/zuyux/sphinx.git
   cd sphinx
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
   ```
   NEXT_PUBLIC_API_KEY=your-openai-api-key
   NEXT_PUBLIC_STACKS_NETWORK=mainnet
   NEXT_PUBLIC_XVERSE_APP_KEY=xverse-wallet-app-key
   ```

4. Ejecutar la aplicación:
   ```bash
   npm run dev
   ```

5. Despliegue del contrato inteligente:
   - Asegúrate de tener Stacks CLI instalado y configurado.
   - Despliega el contrato en la red de pruebas o en la red principal de Stacks:
     ```bash
     clarinet deployment generate --testnet --low-cost
     ```
     ```bash
     clarinet deployment apply --testnet
     ```

## Licencia
Este proyecto se encuentra bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## Contacto
Para preguntas o sugerencias, contáctanos a: 40230@pm.me
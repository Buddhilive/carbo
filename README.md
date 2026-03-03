[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Activity](https://img.shields.io/github/commit-activity/m/Buddhilive/carbo)](https://github.com/Buddhilive/carbo/pulse)
![GitHub Release](https://img.shields.io/github/v/release/Buddhilive/carbo)
![GitHub package.json version](https://img.shields.io/github/package-json/v/Buddhilive/carbo)
![GitHub repo size](https://img.shields.io/github/repo-size/Buddhilive/carbo)

# cARBo: The AI-Augmented Architecture Review Board

**Carbo** is an intelligent architectural governance platform designed to turn the "bottleneck" of traditional Architecture Review Boards (ARBs) into a high-speed engine for better design.

![Carbo](public/images/carbo-board-room.png)

The name **cARBo** (aka Carbo) isn’t just a catchy tech label; it is a literal manifestation of the app’s DNA. By nesting "ARB" (Architecture Review Board) directly in the center, the branding mirrors the product's function: placing rigorous architectural governance at the heart of the development lifecycle. The surrounding "C" and "O" represent the Council and Orchestration that wrap around the process, transforming a historically slow "human-only" bottleneck into a lean, carbon-fast, and AI-augmented experience.

Instead of waiting weeks for a human committee to find a slot in their calendars, Carbo deploys a **Council of specialized AI Reviewers** to stress-test your proposals in seconds. Inspired by the "LLM Council" pattern, Carbo doesn't just give you a generic summary; it facilitates a rigorous, cross-functional debate between specialized agents to ensure every angle of your system—from security to cost—is interrogated.

### Why Carbo?

Traditional reviews often suffer from "groupthink" or missed details. Carbo solves this by assigning distinct, opinionated personas to every proposal:

- **The Specialists:** Five autonomous agents (Security, Scalability, Cost, Operability, and Domain Architecture) evaluate your plan through their specific lens, looking for the "rejection triggers" humans might overlook.
- **The Great Debate:** Carbo doesn't just aggregate notes. It forces the agents into a **Debate Round**, where they challenge each other's assumptions and refine their stances.
- **The Chairman’s Verdict:** A final synthesis agent weighs the consensus and dissent to produce a formal, actionable **Architectural Decision Record (ADR)**.

### The Tech Behind the Council

Built on the cutting edge of the 2026 AI stack, Carbo leverages:

- **LangGraph:** To orchestrate a complex state machine for parallel reasoning and agent communication.
- **Groq:** Delivering near-instant inference so your full council review finishes before you can finish a tweet.
- **Vercel AI SDK:** Providing a seamless, streaming UI experience that lets you watch the "thought process" of your reviewers in real-time.

---

**Carbo** takes the "rubber stamp" out of architecture reviews and replaces it with a rigorous, transparent, and lightning-fast council of experts.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- **Node.js**: Version 20.x or later.
- **pnpm**: Version 9.x or later (recommended).
- **Groq API Key**: You'll need an API key from [Groq](https://console.groq.com/) to power the AI reviewers.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Buddhilive/carbo.git
   cd carbo
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

### Configuration

Create a `.env` file in the root directory and add your environment variables:

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL="file:./dev.db"
```

### Database Setup

Carbo uses **Prisma** with **SQLite** for local data persistence (storing review sessions and ADRs).

1. **Generate the Prisma client:**

   ```bash
   pnpm db:generate
   ```

2. **Initialize the database:**
   ```bash
   pnpm db:push
   ```
   _Note: This will create a `dev.db` file in your project root._

### Running the Application

1. **Start the development server:**

   ```bash
   pnpm dev
   ```

2. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Key Scripts

- `pnpm dev`: Runs the app in development mode.
- `pnpm build`: Builds the app for production.
- `pnpm start`: Runs the built app in production mode.
- `pnpm db:studio`: Opens Prisma Studio to visualize and manage your local database.
- `pnpm lint`: Runs ESLint to check for code quality issues.

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/lib/arb`: The core logic for the AI Council, including LangGraph definitions and agent personas.
- `src/components/arb`: Specialized UI components for the ARB experience.
- `src/components/ai-elements`: High-fidelity AI UI components.
- `prisma/`: Database schema and migrations.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

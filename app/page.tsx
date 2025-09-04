import { Header } from "@/components/header"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex flex-col items-center justify-center p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
          <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
            Welcome to{" "}
            <span className="text-primary">ImaginAI</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Your AI-powered application is ready to go! Start building amazing experiences.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <div className="rounded-lg bg-muted px-3.5 py-2.5 text-sm font-semibold text-muted-foreground">
              Next.js 15 + React 19 + Tailwind CSS + shadcn/ui
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

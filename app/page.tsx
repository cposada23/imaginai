"use client"
import * as React from "react"
import { Header } from "@/components/header"
import { PromptForm } from "@/components/prompt-form"
import { FiltersBar, type Filters } from "@/components/filters-bar"

export default function Home() {
  const [filters, setFilters] = React.useState<Filters>({
    search: "",
    sortBy: "createdAt",
    sortDir: "desc",
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              <span className="text-primary">ImaginAI</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Describe your idea, generate images, and manage your gallery.
            </p>
          </div>

          <PromptForm />

          <FiltersBar value={filters} onChange={setFilters} />

          {/* Timeline grid will be implemented in Task 6 */}
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Timeline grid coming soon (Task 6)
          </div>
        </div>
      </main>
    </div>
  )
}

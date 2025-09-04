"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export type Filters = {
  search: string
  sortBy: "createdAt" | "size" | "count"
  sortDir: "desc" | "asc"
}

type FiltersBarProps = {
  value: Filters
  onChange: (next: Filters) => void
}

export function FiltersBar({ value, onChange }: FiltersBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, search: e.target.value })
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={value.search}
          onChange={handleSearchChange}
          placeholder="Search prompts or metadata..."
          className="max-w-md"
        />
        <div className="flex items-center gap-2">
          <Select
            defaultValue={value.sortBy}
            onValueChange={(v) => onChange({ ...value, sortBy: v as Filters["sortBy"] })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest</SelectItem>
              <SelectItem value="size">Size</SelectItem>
              <SelectItem value="count">Count</SelectItem>
            </SelectContent>
          </Select>
          <Separator orientation="vertical" className="h-6" />
          <Select
            defaultValue={value.sortDir}
            onValueChange={(v) => onChange({ ...value, sortDir: v as Filters["sortDir"] })}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Desc</SelectItem>
              <SelectItem value="asc">Asc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default FiltersBar



"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  prompt: z
    .string()
    .min(1, { message: "Prompt is required" })
    .max(4000, { message: "Prompt is too long" }),
  size: z.enum(["512", "1024"]).default("1024"),
  count: z.coerce
    .number()
    .int()
    .min(1, { message: "Minimum 1 image" })
    .max(4, { message: "Maximum 4 images" })
    .default(1),
})

export type PromptFormValues = z.input<typeof formSchema>
export type PromptFormResolvedValues = z.output<typeof formSchema>

type PromptFormProps = {
  onSubmit?: (values: PromptFormResolvedValues) => void
  isSubmitting?: boolean
}

export function PromptForm({ onSubmit, isSubmitting }: PromptFormProps) {
  const form = useForm<PromptFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      size: "1024",
      count: 1,
    },
    mode: "onChange",
  })

  const handleSubmit = (values: PromptFormValues) => {
    const parsed = formSchema.parse(values)
    if (onSubmit) {
      onSubmit(parsed)
    } else {
      // Placeholder until API integration task
      // eslint-disable-next-line no-console
      console.log("Prompt submitted", parsed)
    }
  }

  const isFormSubmitting = isSubmitting ?? form.formState.isSubmitting

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Images</CardTitle>
        <CardDescription>Describe your image and choose output options.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A surreal landscape with floating islands at golden hour"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="512">512 x 512</SelectItem>
                        <SelectItem value="1024">1024 x 1024</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={4}
                        value={String(field.value ?? "")}
                        onChange={(e) => field.onChange(e.target.value)}
                        name={field.name}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="hidden sm:block" />
            </div>

            <CardFooter className="px-0">
              <Button type="submit" disabled={!form.formState.isValid || isFormSubmitting}>
                {isFormSubmitting ? "Generating..." : "Generate"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default PromptForm



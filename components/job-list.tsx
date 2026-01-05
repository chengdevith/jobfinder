"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Building, TrendingUp, Trash2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Job {
  id: string
  title: string
  description: string
  company: string
  exp: number
  skills: string[]
  location: string
}

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("http://localhost:8080/api/v1/jobs")
        if (!response.ok) {
          throw new Error("Failed to fetch jobs")
        }
        const data = await response.json()
        setJobs(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`http://localhost:8081/api/v1/jobs/delete/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setJobs(jobs.filter((job) => job.id !== id))
      } else {
        console.error("Failed to delete job")
      }
    } catch (error) {
      console.error("Error deleting job:", error)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load jobs. Please make sure the API server is running on http://localhost:8080
        </AlertDescription>
      </Alert>
    )
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Building className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
        <p className="text-muted-foreground text-sm">Start by creating a new job posting</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <Card key={job.id} className="flex flex-col transition-all hover:shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg leading-tight text-balance line-clamp-2">{job.title}</CardTitle>
                <CardDescription className="mt-1.5 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  <span className="truncate">{job.company}</span>
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(job.id)}
                disabled={deletingId === job.id}
              >
                {deletingId === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground text-pretty line-clamp-3 leading-relaxed">{job.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills.length - 4}
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{job.exp}+ years</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

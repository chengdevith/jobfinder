"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Loader2, Trash2 } from "lucide-react"

interface Job {
  id: string
  title: string
  description: string
  company: string
  exp: number
  skills: string[]
  location: string
}

export function JobSearch() {
  const [keyword, setKeyword] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Job[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([])
      return
    }

    const fetchSearchResults = async () => {
      try {
        setIsLoading(true)
        setError("")
        console.log("[v0] Searching for:", searchTerm)
        const response = await fetch(
          `http://localhost:8080/api/v1/jobs/search?keyword=${encodeURIComponent(searchTerm)}`,
        )
        if (!response.ok) {
          throw new Error("Failed to search jobs")
        }
        const data = await response.json()
        console.log("[v0] Search results:", data)
        setSearchResults(data || [])
      } catch (error) {
        console.error("[v0] Error searching jobs:", error)
        setError("Failed to search jobs. Please try again.")
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSearchResults()
  }, [searchTerm])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (keyword.trim()) {
      setSearchTerm(keyword.trim())
    }
  }

  const handleClear = () => {
    setKeyword("")
    setSearchTerm("")
    setSearchResults([])
    setError("")
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8081/api/v1/jobs/delete/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete job")
      }
      setSearchResults(searchResults.filter((job) => job.id !== id))
    } catch (error) {
      console.error("Error deleting job:", error)
      alert("Failed to delete job")
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search jobs by keyword (e.g., Java, React, Python...)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={!keyword.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
            {searchTerm && (
              <Button type="button" variant="outline" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </form>
          {searchTerm && (
            <p className="mt-2 text-sm text-muted-foreground">
              Searching for: <span className="font-medium text-foreground">{searchTerm}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Search Results ({searchResults.length})</h3>
          </div>
          {searchResults.map((job) => (
            <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
                    <p className="text-sm text-foreground mt-2">{job.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills?.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                      <span>📍 {job.location}</span>
                      <span>⏱️ {job.exp} years exp</span>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(job.id)} className="mt-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchTerm && searchResults.length === 0 && !isLoading && !error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No jobs found for "{searchTerm}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

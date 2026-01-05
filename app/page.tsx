import { JobList } from "@/components/job-list"
import { JobSearch } from "@/components/job-search"
import { CreateJobDialog } from "@/components/create-job-dialog"
import { Briefcase } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Job Service Jenkins</h1>
                <p className="text-xs text-muted-foreground">Find your next opportunity</p>
              </div>
            </div>
            <CreateJobDialog />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-balance">Discover Opportunities</h2>
          <p className="text-muted-foreground text-pretty">Search and browse the latest tech job openings</p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <JobSearch />
        </div>

        {/* Job Listings */}
        <JobList />
      </main>
    </div>
  )
}

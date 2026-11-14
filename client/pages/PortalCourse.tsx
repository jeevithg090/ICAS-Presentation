import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { portalCourses, portalCourseDetails } from "@/data/sample";
import { saveSubmission, getSubmission } from "@/lib/localdb";
import { toast } from "sonner";
import { Link, useParams } from "react-router-dom";

export default function PortalCourse() {
  const { code = "" } = useParams();
  const course = portalCourses.find((c) => c.code === code);
  const title = course?.title ?? code;

  if (!course) {
    return (
      <main className="container flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <SEO title="Course not found — Portal" description="This course does not exist." />
        <h1 className="text-2xl font-bold tracking-tight">Course not found</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          There is no course with the code{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">{code}</code>.
        </p>
        <Button asChild className="mt-6">
          <Link to="/portal/courses">Back to all courses</Link>
        </Button>
      </main>
    );
  }

  const details = portalCourseDetails[code] ?? { syllabus: "", assignments: [] };

  return (
    <main>
      <SEO title={`${code} — Portal`} description={title} />
      <section className="container py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <div className="text-sm text-muted-foreground">{code}</div>
          </div>
          <Button asChild variant="outline">
            <Link to="/portal/courses">All courses</Link>
          </Button>
        </div>

        <Tabs defaultValue="assignments" className="mt-6">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="mt-4 grid gap-4">
            {details.assignments.map((a) => {
              const s = getSubmission(a.id);
              return (
                <Card key={a.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{a.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 pt-0">
                    <div className="text-xs text-muted-foreground">
                      Due {new Date(a.due).toLocaleString()} · Max {a.maxMarks} marks
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget as HTMLFormElement);
                        const url = String(fd.get("url") || "");
                        const notes = String(fd.get("notes") || "");
                        saveSubmission({
                          assignmentId: a.id,
                          url,
                          notes,
                          submittedAt: new Date().toISOString(),
                        });
                        toast.success("Submitted");
                        (e.currentTarget as HTMLFormElement).reset();
                      }}
                      className="grid gap-2"
                    >
                      <Input name="url" placeholder="Submission URL (GitHub/Drive/etc.)" required />
                      <Textarea name="notes" placeholder="Notes (optional)" />
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {s
                            ? `Last submitted ${new Date(s.submittedAt).toLocaleString()}`
                            : "Not submitted"}
                        </div>
                        <Button type="submit" size="sm">
                          Submit
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="syllabus" className="mt-4">
            <Card>
              <CardContent className="prose dark:prose-invert max-w-none p-4 text-sm">
                {details.syllabus || "Syllabus will be available soon."}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}

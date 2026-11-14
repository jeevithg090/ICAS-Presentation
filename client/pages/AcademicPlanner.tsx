import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, BookOpen, TrendingUp, Globe, Plus, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

// Sample data - in real app, this would come from your academic planner library
const sampleCourses = [
  {
    id: "CS101",
    code: "CS101",
    name: "Introduction to Computer Science",
    credits: 3,
    prerequisites: [],
    semester: 1,
    year: 1,
    difficulty: "easy" as const,
    category: "core" as const,
    description: "Fundamentals of programming and computer science concepts",
  },
  {
    id: "MATH201",
    code: "MATH201",
    name: "Calculus I",
    credits: 4,
    prerequisites: [],
    semester: 1,
    year: 1,
    difficulty: "medium" as const,
    category: "core" as const,
    description: "Differential calculus and applications",
  },
  {
    id: "PHY101",
    code: "PHY101",
    name: "Physics I",
    credits: 4,
    prerequisites: ["MATH201"],
    semester: 2,
    year: 1,
    difficulty: "medium" as const,
    category: "core" as const,
    description: "Mechanics, thermodynamics, and wave motion",
  },
];

const sampleAcademicPlan = {
  userId: "user123",
  currentSemester: 2,
  currentYear: 1,
  program: "Computer Science",
  targetGPA: 3.8,
  selectedCourses: ["CS101", "MATH201"],
  completedCourses: [
    {
      courseId: "CS101",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      grade: "A",
      gpa: 4.0,
      credits: 3,
      semester: 1,
      year: 1,
    },
  ],
  plannedCourses: [
    {
      courseId: "MATH201",
      semester: 1,
      year: 1,
      priority: "high" as const,
      reason: "Required for advanced courses",
    },
  ],
  transferCredits: [
    {
      originalCourse: "MATH101",
      transferredCourse: "MATH201",
      credits: 4,
      university: "University of California",
      verified: true,
    },
  ],
};

const transferUniversities = [
  { id: "uc", name: "University of California", country: "USA", creditsAccepted: 45 },
  { id: "mit", name: "MIT", country: "USA", creditsAccepted: 40 },
  { id: "oxford", name: "University of Oxford", country: "UK", creditsAccepted: 42 },
  { id: "toronto", name: "University of Toronto", country: "Canada", creditsAccepted: 38 },
];

export default function AcademicPlanner() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showGPAScenario, setShowGPAScenario] = useState(false);
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);

  const currentGPA = useMemo(() => {
    if (sampleAcademicPlan.completedCourses.length === 0) return 0;
    const totalPoints = sampleAcademicPlan.completedCourses.reduce(
      (sum, course) => sum + course.gpa * course.credits,
      0,
    );
    const totalCredits = sampleAcademicPlan.completedCourses.reduce(
      (sum, course) => sum + course.credits,
      0,
    );
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }, []);

  const creditsCompleted = useMemo(() => {
    return sampleAcademicPlan.completedCourses.reduce((sum, course) => sum + course.credits, 0);
  }, []);

  const transferCreditsTotal = useMemo(() => {
    return sampleAcademicPlan.transferCredits.reduce((sum, credit) => sum + credit.credits, 0);
  }, []);

  const progressToGraduation = useMemo(() => {
    const totalRequired = 120; // Standard for most engineering programs
    return ((creditsCompleted + transferCreditsTotal) / totalRequired) * 100;
  }, [creditsCompleted, transferCreditsTotal]);

  return (
    <main>
      <SEO
        title="Academic Planner — ICAS"
        description="Plan your academic journey, track GPA, and manage transfer credits for your 2+2 program."
      />

      <section className="container py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Academic Planner</h1>
            <p className="text-sm text-muted-foreground">
              Plan your academic journey and track progress toward graduation
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/student-life">Student Life</Link>
            </Button>
            <Button asChild>
              <Link to="/portal/study-centre">Study Centre</Link>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full justify-start overflow-x-auto sm:grid sm:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="planning">Course Planning</TabsTrigger>
            <TabsTrigger value="transfer">Transfer Credits</TabsTrigger>
            <TabsTrigger value="gpa">GPA Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentGPA.toFixed(2)}</div>
                  <Progress
                    value={(currentGPA / sampleAcademicPlan.targetGPA) * 100}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {sampleAcademicPlan.targetGPA}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credits Completed</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{creditsCompleted}</div>
                  <Progress value={progressToGraduation} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {progressToGraduation.toFixed(1)}% to graduation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transfer Credits</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{transferCreditsTotal}</div>
                  <p className="text-xs text-muted-foreground mt-1">International credits</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sampleAcademicPlan.currentSemester}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Year {sampleAcademicPlan.currentYear}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Program Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Program</span>
                    <span className="font-medium">{sampleAcademicPlan.program}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Current Year</span>
                    <span className="font-medium">{sampleAcademicPlan.currentYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Current Semester</span>
                    <span className="font-medium">{sampleAcademicPlan.currentSemester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Target GPA</span>
                    <span className="font-medium">{sampleAcademicPlan.targetGPA}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/portal/transfer">
                      <Globe className="mr-2 h-4 w-4" />
                      Transfer Portal
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/portal/study-centre">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Study Centre
                    </Link>
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setShowGPAScenario(true)}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    GPA Scenarios
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Course Planning Tab */}
          <TabsContent value="planning" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Course Planning</h3>
              <Button onClick={() => setShowAddCourse(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Current Semester Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sampleAcademicPlan.selectedCourses.map((courseId) => {
                      const course = sampleCourses.find((c) => c.id === courseId);
                      return course ? (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{course.code}</h4>
                            <p className="text-sm text-muted-foreground">{course.name}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{course.credits} credits</Badge>
                            <Badge variant="secondary" className="ml-2">
                              {course.category}
                            </Badge>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Planned Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sampleAcademicPlan.plannedCourses.map((planned) => {
                      const course = sampleCourses.find((c) => c.id === planned.courseId);
                      return course ? (
                        <div
                          key={planned.courseId}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{course.code}</h4>
                            <p className="text-sm text-muted-foreground">
                              {course.name} • Sem {planned.semester}, Year {planned.year}
                            </p>
                            <p className="text-xs text-muted-foreground">{planned.reason}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={planned.priority === "high" ? "default" : "secondary"}>
                              {planned.priority}
                            </Badge>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Course Catalog</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Prerequisites</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{course.difficulty}</Badge>
                        </TableCell>
                        <TableCell>
                          {course.prerequisites.length > 0 ? (
                            <div className="flex gap-1">
                              {course.prerequisites.map((prereq) => (
                                <Badge key={prereq} variant="outline" className="text-xs">
                                  {prereq}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfer Credits Tab */}
          <TabsContent value="transfer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Credit Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleAcademicPlan.transferCredits.map((credit, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {credit.verified ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                        <div>
                          <h4 className="font-medium">
                            {credit.originalCourse} → {credit.transferredCourse}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {credit.university} • {credit.credits} credits
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={credit.verified ? "default" : "secondary"}>
                          {credit.verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partner Universities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {transferUniversities.map((university) => (
                    <div key={university.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{university.name}</h4>
                        <Badge variant="outline">{university.country}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Credits accepted: {university.creditsAccepted}
                      </p>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GPA Analysis Tab */}
          <TabsContent value="gpa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>GPA Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Current GPA</span>
                      <span>{currentGPA.toFixed(2)}</span>
                    </div>
                    <Progress value={(currentGPA / 4.0) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Target GPA</span>
                      <span>{sampleAcademicPlan.targetGPA}</span>
                    </div>
                    <Progress value={(sampleAcademicPlan.targetGPA / 4.0) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completed Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Semester</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleAcademicPlan.completedCourses.map((course) => (
                      <TableRow key={course.courseId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{course.courseCode}</div>
                            <div className="text-sm text-muted-foreground">{course.courseName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.grade}</Badge>
                        </TableCell>
                        <TableCell>{course.gpa}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>
                          Sem {course.semester}, Year {course.year}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Add Course Dialog */}
      <Dialog open={showAddCourse} onOpenChange={setShowAddCourse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Course to Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="course">Course</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {sampleCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" placeholder="Why are you taking this course?" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowAddCourse(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddCourse(false)}>Add Course</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* GPA Scenario Dialog */}
      <Dialog open={showGPAScenario} onOpenChange={setShowGPAScenario}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>GPA Scenario Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current GPA: {currentGPA.toFixed(2)}</Label>
            </div>
            <div>
              <Label>Target GPA: {sampleAcademicPlan.targetGPA}</Label>
            </div>
            <div>
              <Label>Credits Completed: {creditsCompleted}</Label>
            </div>
            <div>
              <Label>Credits Remaining: {120 - creditsCompleted - transferCreditsTotal}</Label>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                To achieve your target GPA of {sampleAcademicPlan.targetGPA}, you need to maintain
                an average GPA of
                {(
                  (sampleAcademicPlan.targetGPA * 120 - currentGPA * creditsCompleted) /
                  (120 - creditsCompleted)
                ).toFixed(2)}
                in your remaining courses.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowGPAScenario(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

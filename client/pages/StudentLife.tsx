import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
import Timetable from "@/components/sections/Timetable";
import AlumniPortal from "@/components/sections/AlumniPortal";
import AlumniCountries from "@/components/sections/AlumniCountries";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Calendar,
  FileText,
  Globe,
  GraduationCap,
} from "lucide-react";

// Sample data for demonstration
const feed = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  author: `Student @${120 + i}`,
  time: `${1 + (i % 5)}h ago`,
  text: [
    "Prototype demo at the Innovation Hub!",
    "Volleyball finals this weekend — join in!",
    "Open mic night at the quad was amazing!",
    "Study group forming for BIO422.",
  ][i % 4],
}));

const academicStats = {
  currentGPA: 3.8,
  targetGPA: 4.0,
  creditsCompleted: 45,
  creditsRequired: 120,
  coursesThisSemester: 5,
  transferCredits: 15,
};

const buddyMatches = [
  {
    id: 1,
    name: "Alex Chen",
    program: "Computer Science",
    year: 3,
    targetCountry: "USA",
    matchScore: 95,
    status: "active",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    program: "Mechanical Engineering",
    year: 4,
    targetCountry: "Canada",
    matchScore: 88,
    status: "pending",
  },
];

const researchProjects = [
  {
    id: 1,
    title: "AI-Powered Campus Navigation",
    category: "development",
    difficulty: "intermediate",
    currentMembers: 3,
    maxMembers: 5,
    status: "open",
  },
  {
    id: 2,
    title: "Sustainable Energy Solutions",
    category: "research",
    difficulty: "advanced",
    currentMembers: 2,
    maxMembers: 4,
    status: "in_progress",
  },
];

const studyGroups = [
  {
    id: 1,
    subject: "Calculus II",
    members: 8,
    maxMembers: 12,
    meetingTime: "Mon, Wed 6-8 PM",
    location: "Library Study Room 3",
  },
  {
    id: 2,
    subject: "Data Structures",
    members: 6,
    maxMembers: 10,
    meetingTime: "Tue, Thu 7-9 PM",
    location: "Innovation Hub",
  },
];

export default function StudentLife() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinProject, setShowJoinProject] = useState(false);

  return (
    <main>
      <SEO
        title="Student Life — ICAS"
        description="Comprehensive student hub with academic planning, mentorship, and research opportunities."
      />

      <section className="container py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Life Hub</h1>
            <p className="text-sm text-muted-foreground">
              Your comprehensive dashboard for academic success and personal growth
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/portal">Portal Dashboard</Link>
            </Button>
            <Button asChild>
              <Link to="/portal/study-centre">Study Centre</Link>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full justify-start overflow-x-auto sm:grid sm:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
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
                  <div className="text-2xl font-bold">{academicStats.currentGPA}</div>
                  <Progress
                    value={(academicStats.currentGPA / academicStats.targetGPA) * 100}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {academicStats.targetGPA}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credits</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{academicStats.creditsCompleted}</div>
                  <Progress
                    value={(academicStats.creditsCompleted / academicStats.creditsRequired) * 100}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    of {academicStats.creditsRequired} required
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transfer Credits</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{academicStats.transferCredits}</div>
                  <p className="text-xs text-muted-foreground mt-1">International credits</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{academicStats.coursesThisSemester}</div>
                  <p className="text-xs text-muted-foreground mt-1">This semester</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recent Community Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feed.slice(0, 4).map((p) => (
                      <li key={p.id} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{p.author}</div>
                          <p className="text-xs text-muted-foreground">{p.text}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">{p.time}</div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
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
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/buddy-system">
                      <Users className="mr-2 h-4 w-4" />
                      Find Mentor
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/research">
                      <FileText className="mr-2 h-4 w-4" />
                      Research Projects
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Core Courses</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Electives</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Lab Requirements</span>
                      <span>90%</span>
                    </div>
                    <Progress value={90} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transfer Credit Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">USA Universities</span>
                      <Badge variant="secondary">15 credits</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">UK Universities</span>
                      <Badge variant="secondary">12 credits</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Canada Universities</span>
                      <Badge variant="secondary">18 credits</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Study Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {studyGroups.map((group) => (
                    <div key={group.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{group.subject}</h4>
                        <Badge variant="outline">
                          {group.members}/{group.maxMembers}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{group.meetingTime}</p>
                      <p className="text-sm text-muted-foreground mb-3">{group.location}</p>
                      <Button size="sm" variant="outline">
                        Join Group
                      </Button>
                    </div>
                  ))}
                </div>
                <Button className="mt-4" onClick={() => setShowCreateGroup(true)}>
                  Create New Study Group
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mentorship Tab */}
          <TabsContent value="mentorship" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Mentor Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {buddyMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                          <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-medium">{match.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {match.program} • Year {match.year} • {match.targetCountry}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={match.status === "active" ? "default" : "secondary"}>
                          {match.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Match: {match.matchScore}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-4" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Find More Mentors
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Research Tab */}
          <TabsContent value="research" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Research Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {researchProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{project.title}</h4>
                        <Badge variant={project.status === "open" ? "default" : "secondary"}>
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{project.category}</Badge>
                        <Badge variant="outline">{project.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {project.currentMembers}/{project.maxMembers} members
                      </p>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
                <Button className="mt-4" onClick={() => setShowJoinProject(true)}>
                  Browse All Projects
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Community Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {feed.map((p) => (
                      <li key={p.id} className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{p.author}</span>
                            <span className="text-xs text-muted-foreground">{p.time}</span>
                          </div>
                          <p className="text-sm">{p.text}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium text-sm">Innovation Hub Demo Day</h4>
                        <p className="text-xs text-muted-foreground">Tomorrow, 2:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium text-sm">Alumni Networking</h4>
                        <p className="text-xs text-muted-foreground">Friday, 6:00 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <AlumniCountries />
          </TabsContent>
        </Tabs>
      </section>

      <Timetable />
      <AlumniPortal />

      {/* Create Study Group Dialog */}
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Study Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="e.g., Calculus II" />
            </div>
            <div>
              <Label htmlFor="maxMembers">Maximum Members</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select max members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="meetingTime">Meeting Time</Label>
              <Input id="meetingTime" placeholder="e.g., Mon, Wed 6-8 PM" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., Library Study Room 3" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the study group goals..." />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateGroup(false)}>Create Group</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Research Project Dialog */}
      <Dialog open={showJoinProject} onOpenChange={setShowJoinProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Research Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectTitle">Project Title</Label>
              <Input id="projectTitle" placeholder="Enter project title" />
            </div>
            <div>
              <Label htmlFor="skills">Your Skills</Label>
              <Textarea id="skills" placeholder="List your relevant skills..." />
            </div>
            <div>
              <Label htmlFor="motivation">Why do you want to join?</Label>
              <Textarea id="motivation" placeholder="Explain your interest and motivation..." />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowJoinProject(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowJoinProject(false)}>Submit Application</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

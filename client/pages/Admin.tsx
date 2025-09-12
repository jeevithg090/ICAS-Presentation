import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, 
  GraduationCap, 
  Users, 
  Bot, 
  TrendingUp, 
  Settings,
  ArrowRight,
  Activity,
  CheckCircle,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import AlumniAutomation from "@/components/admin/AlumniAutomation";

export default function Admin() {
  const quickActions = [
    {
      title: "University Announcements",
      description: "Post campus-wide updates and alerts",
      icon: <Megaphone className="h-6 w-6" />,
      color: "bg-blue-600",
      href: "/administration",
      status: "active"
    },
    {
      title: "Courses & Faculty",
      description: "Create and update course listings, assign faculty",
      icon: <GraduationCap className="h-6 w-6" />,
      color: "bg-emerald-600",
      href: "/administration",
      status: "active"
    },
    {
      title: "Student Records",
      description: "View student profiles and academic progress",
      icon: <Users className="h-6 w-6" />,
      color: "bg-indigo-600",
      href: "/administration",
      status: "active"
    }
  ];

  const stats = [
    { label: "Active Tools", value: "7", icon: <Settings className="h-4 w-4" />, change: "+2 this week", color: "text-blue-600", bgColor: "bg-blue-100" },
    { label: "Recent Activity", value: "23", icon: <Activity className="h-4 w-4" />, change: "+12% from last week", color: "text-emerald-600", bgColor: "bg-emerald-100" },
    { label: "System Status", value: "Online", icon: <CheckCircle className="h-4 w-4" />, change: "99.9% uptime", color: "text-green-600", bgColor: "bg-green-100" }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <SEO
        title="Admin Dashboard — ICAS"
        description="University administrator console"
      />
      <section className="container py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Administrator Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Manage announcements, courses, student data, and alumni automation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                All Systems Operational
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                    <div className={stat.color}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {quickActions.map((action, index) => (
              <Card key={index} className="border shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900">
                        {action.title}
                      </CardTitle>
                      <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
                        {action.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {action.description}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={action.href} className="flex items-center justify-center gap-2">
                      Access Tool
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Alumni Automation Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Alumni Automation</h2>
              <p className="text-gray-600">Automated LinkedIn outreach and alumni engagement</p>
            </div>
          </div>
          <AlumniAutomation />
        </div>

        {/* Recent Activity */}
        <Card className="border shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Alumni automation completed</p>
                  <p className="text-xs text-gray-500">John Smith - 2 minutes ago</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Content management updated</p>
                  <p className="text-xs text-gray-500">University database - 1 hour ago</p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">In Progress</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Search,
  Building2,
  GraduationCap,
  Calendar,
  Users,
  Mail,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Send,
  Edit3,
  Copy,
  Download,
  FileText,
} from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";
import { toast } from "../ui/use-toast";
import { MCPSearchResult } from "../../lib/outreach-mcp-service";

interface OutreachData {
  id: string;
  category: "college" | "company" | "event" | "person";
  name: string;
  details: string;
  searchResults: any[];
  emailDraft: string;
  summary?: {
    content: string;
    generatedAt: string;
    model: string;
    searchResultsCount: number;
    wordCount: number;
  };
  status: "searching" | "found" | "drafting" | "ready" | "error";
  timestamp: string;
}

// Use the MCPSearchResult interface from the service
type SearchResult = MCPSearchResult;

const OutreachManagement: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [outreachData, setOutreachData] = useState<OutreachData[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<OutreachData>>({
    category: "college",
    name: "",
    details: "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<OutreachData | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const categories = [
    { value: "college", label: "College/University", icon: <GraduationCap className="h-4 w-4" /> },
    { value: "company", label: "Company/Organization", icon: <Building2 className="h-4 w-4" /> },
    { value: "event", label: "Event/Conference", icon: <Calendar className="h-4 w-4" /> },
    { value: "person", label: "Person/Contact", icon: <Users className="h-4 w-4" /> },
  ];

  const handleSearch = async () => {
    if (!currentEntry.name || !currentEntry.details) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and details for the search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    const entryId = Date.now().toString();

    const newEntry: OutreachData = {
      id: entryId,
      category: currentEntry.category as any,
      name: currentEntry.name,
      details: currentEntry.details,
      searchResults: [],
      emailDraft: "",
      status: "searching",
      timestamp: new Date().toISOString(),
    };

    setOutreachData((prev) => [newEntry, ...prev]);
    setSelectedEntry(newEntry);

    try {
      // Call server-side MCP search API
      const response = await fetch("/api/outreach/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: newEntry.category,
          name: newEntry.name,
          details: newEntry.details,
        }),
      });

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      const data = await response.json();
      const searchResults = data.results || [];
      const summary = data.summary || null;

      setOutreachData((prev) =>
        prev.map((entry) =>
          entry.id === entryId ? { ...entry, searchResults, summary, status: "found" } : entry,
        ),
      );

      setSelectedEntry((prev) =>
        prev ? { ...prev, searchResults, summary, status: "found" } : null,
      );

      toast({
        title: "Search Completed",
        description: `Found ${searchResults.length} comprehensive results for ${newEntry.name}`,
      });
    } catch (error) {
      console.error("Search error:", error);
      setOutreachData((prev) =>
        prev.map((entry) => (entry.id === entryId ? { ...entry, status: "error" } : entry)),
      );

      toast({
        title: "Search Failed",
        description: "Failed to gather information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleDraftEmail = async () => {
    if (!selectedEntry) return;

    setIsDrafting(true);
    setOutreachData((prev) =>
      prev.map((entry) =>
        entry.id === selectedEntry.id ? { ...entry, status: "drafting" } : entry,
      ),
    );

    try {
      // Call OpenRouter API to draft email
      const draft = await draftEmailWithOpenRouter(selectedEntry);

      setEmailDraft(draft);
      setOutreachData((prev) =>
        prev.map((entry) =>
          entry.id === selectedEntry.id ? { ...entry, emailDraft: draft, status: "ready" } : entry,
        ),
      );

      setSelectedEntry((prev) => (prev ? { ...prev, emailDraft: draft, status: "ready" } : null));

      toast({
        title: "Email Drafted",
        description: "AI has generated a professional collaboration email draft.",
      });
    } catch (error) {
      console.error("Email drafting error:", error);
      toast({
        title: "Drafting Failed",
        description: "Failed to generate email draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDrafting(false);
    }
  };

  const draftEmailWithOpenRouter = async (entry: OutreachData): Promise<string> => {
    // Call OpenRouter API to generate email draft
    const response = await fetch("/api/outreach/draft-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: entry.category,
        name: entry.name,
        details: entry.details,
        searchResults: entry.searchResults,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to draft email");
    }

    const data = await response.json();
    return data.emailDraft;
  };

  const handleSendEmail = () => {
    toast({
      title: "Email Sent",
      description: "Collaboration email has been sent successfully.",
    });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailDraft);
    toast({
      title: "Copied",
      description: "Email draft copied to clipboard.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "searching":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "found":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "drafting":
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "searching":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "found":
        return "bg-green-100 text-green-800 border-green-200";
      case "drafting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Outreach Management
              </h1>
              <p className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Research and connect with colleges, companies, events, and people for collaboration
                opportunities
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Search Form */}
          <div className="lg:col-span-1">
            <Card
              className={`border shadow-sm ${isDark ? "bg-gray-800 border-gray-700" : "bg-white"}`}
            >
              <CardHeader>
                <CardTitle
                  className={`flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  <Search className="h-5 w-5 text-blue-600" />
                  New Outreach Search
                </CardTitle>
                <CardDescription className={isDark ? "text-gray-300" : "text-gray-600"}>
                  Enter details to research and connect with potential partners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label className={isDark ? "text-gray-300" : "text-gray-700"}>Category</Label>
                  <Select
                    value={currentEntry.category}
                    onValueChange={(value) =>
                      setCurrentEntry((prev) => ({ ...prev, category: value as any }))
                    }
                  >
                    <SelectTrigger className={isDark ? "bg-gray-700 border-gray-600" : "bg-white"}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            {category.icon}
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <Label className={isDark ? "text-gray-300" : "text-gray-700"}>Name</Label>
                  <Input
                    placeholder={`Enter ${currentEntry.category} name`}
                    value={currentEntry.name}
                    onChange={(e) => setCurrentEntry((prev) => ({ ...prev, name: e.target.value }))}
                    className={isDark ? "bg-gray-700 border-gray-600" : "bg-white"}
                  />
                </div>

                {/* Details Input */}
                <div className="space-y-2">
                  <Label className={isDark ? "text-gray-300" : "text-gray-700"}>Details</Label>
                  <Textarea
                    placeholder={`Provide additional details about ${currentEntry.category}`}
                    value={currentEntry.details}
                    onChange={(e) =>
                      setCurrentEntry((prev) => ({ ...prev, details: e.target.value }))
                    }
                    className={isDark ? "bg-gray-700 border-gray-600" : "bg-white"}
                    rows={4}
                  />
                </div>

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !currentEntry.name || !currentEntry.details}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search & Research
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Searches */}
            <Card
              className={`border shadow-sm mt-6 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white"}`}
            >
              <CardHeader>
                <CardTitle className={`text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {outreachData.slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedEntry?.id === entry.id
                          ? isDark
                            ? "bg-blue-900/20 border-blue-700"
                            : "bg-blue-50 border-blue-200"
                          : isDark
                            ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {categories.find((c) => c.value === entry.category)?.icon}
                          <span
                            className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                          >
                            {entry.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(entry.status)}
                          <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                        </div>
                      </div>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Results and Email */}
          <div className="lg:col-span-2">
            {selectedEntry ? (
              <Tabs defaultValue="summary" className="space-y-6">
                <TabsList
                  className={`grid w-full grid-cols-3 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                >
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="results">Search Results</TabsTrigger>
                  <TabsTrigger value="email">Email Draft</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-6">
                  <Card
                    className={`border shadow-sm ${isDark ? "bg-gray-800 border-gray-700" : "bg-white"}`}
                  >
                    <CardHeader>
                      <CardTitle
                        className={`flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        <FileText className="h-5 w-5" />
                        Comprehensive Summary
                      </CardTitle>
                      <CardDescription className={isDark ? "text-gray-300" : "text-gray-600"}>
                        AI-generated summary based on {selectedEntry.searchResults.length} search
                        results
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedEntry.summary ? (
                        <div className="space-y-4">
                          <div
                            className={`p-6 rounded-lg border shadow-sm ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                                >
                                  {selectedEntry.summary.model}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200"
                                >
                                  {selectedEntry.summary.wordCount} words
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  {selectedEntry.summary.searchResultsCount} sources
                                </Badge>
                              </div>
                              <p
                                className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                              >
                                Generated:{" "}
                                {new Date(selectedEntry.summary.generatedAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                              <div
                                className={`prose prose-sm max-w-none ${isDark ? "prose-invert" : ""}`}
                              >
                                <div
                                  className={`${isDark ? "text-gray-200" : "text-gray-800"} leading-relaxed`}
                                  dangerouslySetInnerHTML={{
                                    __html: selectedEntry.summary.content
                                      .replace(
                                        /\*\*(.*?)\*\*/g,
                                        '<strong class="font-semibold text-orange-600">$1</strong>',
                                      )
                                      .replace(
                                        /\*(.*?)\*/g,
                                        '<em class="italic text-orange-500">$1</em>',
                                      )
                                      .replace(
                                        /### (.*?)(?=\n|$)/g,
                                        '<h3 class="text-lg font-semibold mt-6 mb-3 text-orange-700 border-l-4 border-orange-500 pl-3">$1</h3>',
                                      )
                                      .replace(
                                        /## (.*?)(?=\n|$)/g,
                                        '<h2 class="text-xl font-bold mt-8 mb-4 text-orange-800 border-b border-orange-300 pb-2">$1</h2>',
                                      )
                                      .replace(
                                        /# (.*?)(?=\n|$)/g,
                                        '<h1 class="text-2xl font-bold mt-8 mb-6 text-orange-900">$1</h1>',
                                      )
                                      .replace(/---/g, '<hr class="my-6 border-orange-300">')
                                      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">')
                                      .replace(/\n/g, "<br>")
                                      .replace(/^/, '<p class="mb-4 leading-relaxed">')
                                      .replace(/$/, "</p>")
                                      .replace(
                                        /\[([^\]]+)\]\(([^)]+)\)/g,
                                        '<a href="$2" class="text-orange-600 hover:text-orange-800 underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>',
                                      ),
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`text-center py-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>
                            No summary available. Run a search to generate a comprehensive summary.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="results" className="space-y-6">
                  <Card
                    className={`border shadow-sm ${isDark ? "bg-gray-800 border-gray-700" : "bg-white"}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle
                            className={`flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}
                          >
                            {categories.find((c) => c.value === selectedEntry.category)?.icon}
                            {selectedEntry.name}
                          </CardTitle>
                          <CardDescription className={isDark ? "text-gray-300" : "text-gray-600"}>
                            {selectedEntry.details}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedEntry.status)}
                          <Badge className={getStatusColor(selectedEntry.status)}>
                            {selectedEntry.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedEntry.searchResults.length > 0 ? (
                        <div className="space-y-4">
                          {selectedEntry.searchResults.map((result) => (
                            <div
                              key={result.id}
                              className={`p-4 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3
                                    className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                                  >
                                    {result.title}
                                  </h3>
                                  <p
                                    className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                                  >
                                    {result.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <Badge variant="outline" className="text-xs">
                                    {result.source}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span className="text-xs text-yellow-600">
                                      {result.relevance}%
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {result.url && (
                                <div className="flex items-center gap-2 mb-3">
                                  <ExternalLink className="h-4 w-4 text-blue-500" />
                                  <a
                                    href={result.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    Visit Source
                                  </a>
                                </div>
                              )}

                              <div
                                className={`text-sm p-3 rounded ${isDark ? "bg-gray-600" : "bg-gray-100"}`}
                              >
                                <div className="space-y-2">
                                  {result.data.type === "brave_search_result" && (
                                    <div>
                                      <strong className="text-blue-600">
                                        Brave Search Result:
                                      </strong>
                                      <p className="mt-1">{result.data.description}</p>
                                      {result.data.publishedDate && (
                                        <div className="mt-2 text-xs text-gray-500">
                                          <strong>Published:</strong>{" "}
                                          {new Date(result.data.publishedDate).toLocaleDateString()}
                                        </div>
                                      )}
                                      {result.data.extraSnippets &&
                                        result.data.extraSnippets.length > 0 && (
                                          <div className="mt-2">
                                            <strong className="text-blue-600">
                                              Additional Information:
                                            </strong>
                                            <ul className="list-disc list-inside mt-1">
                                              {result.data.extraSnippets
                                                .slice(0, 2)
                                                .map((snippet: string, idx: number) => (
                                                  <li key={idx} className="text-xs">
                                                    {snippet}
                                                  </li>
                                                ))}
                                            </ul>
                                          </div>
                                        )}
                                      {result.data.language && (
                                        <div className="mt-1 text-xs text-gray-500">
                                          <strong>Language:</strong> {result.data.language}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {result.data.type === "knowledge_graph" && (
                                    <div>
                                      <strong className="text-green-600">
                                        Google Knowledge Graph:
                                      </strong>
                                      <p className="mt-1">{result.data.description}</p>
                                      {result.data.entityType && (
                                        <div className="mt-2 text-xs text-gray-500">
                                          <strong>Type:</strong> {result.data.entityType}
                                        </div>
                                      )}
                                      {result.data.website && (
                                        <div className="mt-1 text-xs text-gray-500">
                                          <strong>Website:</strong> {result.data.website}
                                        </div>
                                      )}
                                      {result.data.attributes &&
                                        Object.keys(result.data.attributes).length > 0 && (
                                          <div className="mt-2">
                                            <strong className="text-green-600">
                                              Key Attributes:
                                            </strong>
                                            <ul className="list-disc list-inside mt-1">
                                              {Object.entries(result.data.attributes)
                                                .slice(0, 3)
                                                .map(([key, value]: [string, any], idx: number) => (
                                                  <li key={idx} className="text-xs">
                                                    <strong>{key}:</strong> {value}
                                                  </li>
                                                ))}
                                            </ul>
                                          </div>
                                        )}
                                    </div>
                                  )}

                                  {result.data.type === "serp_search_result" && (
                                    <div>
                                      <strong className="text-blue-600">
                                        Google Search Result:
                                      </strong>
                                      <p className="mt-1">{result.data.snippet}</p>
                                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                        {result.data.date && (
                                          <div>
                                            <strong>Date:</strong> {result.data.date}
                                          </div>
                                        )}
                                        {result.data.position && (
                                          <div>
                                            <strong>Position:</strong> #{result.data.position}
                                          </div>
                                        )}
                                        {result.data.displayedLink && (
                                          <div>
                                            <strong>Source:</strong> {result.data.displayedLink}
                                          </div>
                                        )}
                                        {result.data.source && (
                                          <div>
                                            <strong>Publisher:</strong> {result.data.source}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {result.data.type === "wikipedia_article" && (
                                    <div>
                                      <strong className="text-blue-600">Wikipedia Article:</strong>
                                      <p className="mt-1">{result.data.extract}</p>
                                      {result.data.description && (
                                        <div className="mt-2">
                                          <strong className="text-blue-600">Description:</strong>
                                          <p className="text-xs mt-1">{result.data.description}</p>
                                        </div>
                                      )}
                                      {result.data.thumbnail && (
                                        <div className="mt-2">
                                          <img
                                            src={result.data.thumbnail}
                                            alt={result.data.title}
                                            className="w-20 h-20 object-cover rounded"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {result.data.type === "arxiv_paper" && (
                                    <div>
                                      <strong className="text-blue-600">Academic Paper:</strong>
                                      <p className="mt-1">{result.data.summary}</p>
                                      <div className="mt-2 text-xs text-gray-500">
                                        <strong>Source:</strong> ArXiv Academic Database
                                      </div>
                                    </div>
                                  )}

                                  {result.data.type === "news_article" && (
                                    <div>
                                      <strong className="text-blue-600">News Article:</strong>
                                      <p className="mt-1">{result.data.description}</p>
                                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                        {result.data.publishedAt && (
                                          <div>
                                            <strong>Published:</strong>{" "}
                                            {new Date(result.data.publishedAt).toLocaleDateString()}
                                          </div>
                                        )}
                                        {result.data.source && (
                                          <div>
                                            <strong>Source:</strong> {result.data.source}
                                          </div>
                                        )}
                                        {result.data.author && (
                                          <div>
                                            <strong>Author:</strong> {result.data.author}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {result.data.type === "comprehensive_overview" && (
                                    <div>
                                      <strong className="text-blue-600">Summary:</strong>
                                      <p className="mt-1">{result.data.summary}</p>
                                      {result.data.relatedTopics &&
                                        result.data.relatedTopics.length > 0 && (
                                          <div className="mt-2">
                                            <strong className="text-blue-600">
                                              Related Topics:
                                            </strong>
                                            <ul className="list-disc list-inside mt-1">
                                              {result.data.relatedTopics
                                                .slice(0, 3)
                                                .map((topic: any, idx: number) => (
                                                  <li key={idx} className="text-xs">
                                                    {topic.Text}
                                                  </li>
                                                ))}
                                            </ul>
                                          </div>
                                        )}
                                    </div>
                                  )}

                                  {result.data.type === "comprehensive_info" && (
                                    <div>
                                      <strong className="text-blue-600">Key Information:</strong>
                                      <p className="mt-1">{result.data.summary}</p>
                                      {result.data.keyPoints && (
                                        <div className="mt-2">
                                          <strong className="text-blue-600">Key Points:</strong>
                                          <ul className="list-disc list-inside mt-1">
                                            {result.data.keyPoints.map(
                                              (point: string, idx: number) => (
                                                <li key={idx} className="text-xs">
                                                  {point}
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                      {result.data.collaborationOpportunities && (
                                        <div className="mt-2">
                                          <strong className="text-green-600">
                                            Collaboration Opportunities:
                                          </strong>
                                          <ul className="list-disc list-inside mt-1">
                                            {result.data.collaborationOpportunities.map(
                                              (opp: string, idx: number) => (
                                                <li key={idx} className="text-xs">
                                                  {opp}
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {result.data.type === "academic_profile" && (
                                    <div>
                                      <strong className="text-blue-600">
                                        Academic Information:
                                      </strong>
                                      <p className="mt-1">{result.data.overview}</p>
                                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                        <div>
                                          <strong>Faculty:</strong> {result.data.faculty}
                                        </div>
                                        <div>
                                          <strong>Students:</strong> {result.data.students}
                                        </div>
                                        <div>
                                          <strong>Programs:</strong>{" "}
                                          {result.data.programs?.length || 0} programs
                                        </div>
                                        <div>
                                          <strong>Research Areas:</strong>{" "}
                                          {result.data.researchAreas?.length || 0} areas
                                        </div>
                                      </div>
                                      {result.data.collaborationOpportunities && (
                                        <div className="mt-2">
                                          <strong className="text-green-600">
                                            Academic Collaboration:
                                          </strong>
                                          <ul className="list-disc list-inside mt-1">
                                            {result.data.collaborationOpportunities.map(
                                              (opp: string, idx: number) => (
                                                <li key={idx} className="text-xs">
                                                  {opp}
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {result.data.type === "company_profile" && (
                                    <div>
                                      <strong className="text-blue-600">
                                        Business Information:
                                      </strong>
                                      <p className="mt-1">{result.data.overview}</p>
                                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                        <div>
                                          <strong>Industry:</strong> {result.data.industry}
                                        </div>
                                        <div>
                                          <strong>Size:</strong> {result.data.size}
                                        </div>
                                        <div>
                                          <strong>Website:</strong>{" "}
                                          <a
                                            href={result.data.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                          >
                                            {result.data.website}
                                          </a>
                                        </div>
                                        <div>
                                          <strong>Email:</strong> {result.data.contact?.email}
                                        </div>
                                      </div>
                                      {result.data.collaborationOpportunities && (
                                        <div className="mt-2">
                                          <strong className="text-green-600">
                                            Business Collaboration:
                                          </strong>
                                          <ul className="list-disc list-inside mt-1">
                                            {result.data.collaborationOpportunities.map(
                                              (opp: string, idx: number) => (
                                                <li key={idx} className="text-xs">
                                                  {opp}
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {result.data.type === "event_profile" && (
                                    <div>
                                      <strong className="text-blue-600">Event Information:</strong>
                                      <p className="mt-1">{result.data.overview}</p>
                                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                        <div>
                                          <strong>Format:</strong> {result.data.format}
                                        </div>
                                        <div>
                                          <strong>Registration:</strong> {result.data.registration}
                                        </div>
                                        <div>
                                          <strong>Speakers:</strong>{" "}
                                          {result.data.speakers?.length || 0} speakers
                                        </div>
                                        <div>
                                          <strong>Topics:</strong> {result.data.topics?.length || 0}{" "}
                                          topics
                                        </div>
                                      </div>
                                      {result.data.collaborationOpportunities && (
                                        <div className="mt-2">
                                          <strong className="text-green-600">
                                            Event Collaboration:
                                          </strong>
                                          <ul className="list-disc list-inside mt-1">
                                            {result.data.collaborationOpportunities.map(
                                              (opp: string, idx: number) => (
                                                <li key={idx} className="text-xs">
                                                  {opp}
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {result.data.type === "professional_profile" && (
                                    <div>
                                      <strong className="text-blue-600">
                                        Professional Information:
                                      </strong>
                                      <p className="mt-1">{result.data.overview}</p>
                                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                        <div>
                                          <strong>Title:</strong> {result.data.title}
                                        </div>
                                        <div>
                                          <strong>Organization:</strong> {result.data.organization}
                                        </div>
                                        <div>
                                          <strong>Education:</strong> {result.data.education}
                                        </div>
                                        <div>
                                          <strong>Experience:</strong> {result.data.experience}
                                        </div>
                                      </div>
                                      {result.data.collaborationOpportunities && (
                                        <div className="mt-2">
                                          <strong className="text-green-600">
                                            Professional Collaboration:
                                          </strong>
                                          <ul className="list-disc list-inside mt-1">
                                            {result.data.collaborationOpportunities.map(
                                              (opp: string, idx: number) => (
                                                <li key={idx} className="text-xs">
                                                  {opp}
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {![
                                    "comprehensive_overview",
                                    "comprehensive_info",
                                    "academic_profile",
                                    "company_profile",
                                    "event_profile",
                                    "professional_profile",
                                  ].includes(result.data.type) && (
                                    <div>
                                      <strong className="text-blue-600">
                                        Additional Information:
                                      </strong>
                                      <pre className="text-xs mt-1 whitespace-pre-wrap">
                                        {JSON.stringify(result.data, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                            No search results available yet
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="email" className="space-y-6">
                  <Card
                    className={`border shadow-sm ${isDark ? "bg-gray-800 border-gray-700" : "bg-white"}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle
                          className={`flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          <Mail className="h-5 w-5 text-blue-600" />
                          Collaboration Email Draft
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {selectedEntry.status === "ready" ? (
                            <Button
                              onClick={handleDraftEmail}
                              disabled={isDrafting}
                              variant="outline"
                              size="sm"
                            >
                              {isDrafting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Edit3 className="h-4 w-4" />
                              )}
                              Regenerate
                            </Button>
                          ) : (
                            <Button
                              onClick={handleDraftEmail}
                              disabled={isDrafting || selectedEntry.status !== "found"}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {isDrafting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Drafting...
                                </>
                              ) : (
                                <>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Draft Email
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {emailDraft ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className={isDark ? "text-gray-300" : "text-gray-700"}>
                              Email Content
                            </Label>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => setIsEditingEmail(!isEditingEmail)}
                                variant="outline"
                                size="sm"
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                {isEditingEmail ? "Preview" : "Edit"}
                              </Button>
                              <Button onClick={handleCopyEmail} variant="outline" size="sm">
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </Button>
                            </div>
                          </div>

                          {isEditingEmail ? (
                            <Textarea
                              value={emailDraft}
                              onChange={(e) => setEmailDraft(e.target.value)}
                              className={`min-h-[300px] ${isDark ? "bg-gray-700 border-gray-600" : "bg-white"}`}
                            />
                          ) : (
                            <div
                              className={`p-4 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                            >
                              <pre
                                className={`whitespace-pre-wrap text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                              >
                                {emailDraft}
                              </pre>
                            </div>
                          )}

                          <div className="flex items-center gap-3 pt-4">
                            <Button
                              onClick={handleSendEmail}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send Email
                            </Button>
                            <Button variant="outline" onClick={() => window.print()}>
                              <Download className="h-4 w-4 mr-2" />
                              Save Draft
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                            {selectedEntry.status === "found"
                              ? 'Click "Draft Email" to generate a collaboration email'
                              : "Complete the search first to generate an email draft"}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card
                className={`border shadow-sm ${isDark ? "bg-gray-800 border-gray-700" : "bg-white"}`}
              >
                <CardContent className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3
                      className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Start Your Outreach Research
                    </h3>
                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                      Enter details in the form to begin researching and connecting with potential
                      partners
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutreachManagement;

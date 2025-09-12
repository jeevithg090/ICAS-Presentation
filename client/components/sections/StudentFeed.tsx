import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Calendar,
  MapPin,
  Users,
  BookOpen,
  Trophy,
  Lightbulb
} from "lucide-react";

export interface StudentPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    program: string;
    year: number;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  type: 'academic' | 'social' | 'research' | 'event' | 'achievement';
  tags: string[];
  location?: string;
  eventTime?: string;
  participants?: number;
}

interface StudentFeedProps {
  posts: StudentPost[];
  onLike?: (postId: string) => void;
  onComment?: (postId: string, comment: string) => void;
  onShare?: (postId: string) => void;
  onCreatePost?: (content: string, type: StudentPost['type'], tags: string[]) => void;
}

export default function StudentFeed({ 
  posts, 
  onLike, 
  onComment, 
  onShare, 
  onCreatePost 
}: StudentFeedProps) {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState<StudentPost['type']>('social');
  const [newPostTags, setNewPostTags] = useState("");

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    
    const tags = newPostTags.split(',').map(tag => tag.trim()).filter(Boolean);
    onCreatePost?.(newPostContent, newPostType, tags);
    
    setNewPostContent("");
    setNewPostTags("");
    setNewPostType('social');
    setShowCreatePost(false);
  };

  const getTypeIcon = (type: StudentPost['type']) => {
    switch (type) {
      case 'academic': return <BookOpen className="h-4 w-4" />;
      case 'research': return <Lightbulb className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'achievement': return <Trophy className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: StudentPost['type']) => {
    switch (type) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'research': return 'bg-purple-100 text-purple-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'achievement': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                <DialogTrigger asChild>
                  <Input 
                    placeholder="What's happening in your academic life?" 
                    className="cursor-pointer"
                    readOnly
                  />
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create a Post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {(['social', 'academic', 'research', 'event', 'achievement'] as const).map(type => (
                        <Button
                          key={type}
                          variant={newPostType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewPostType(type)}
                          className="capitalize"
                        >
                          {getTypeIcon(type)}
                          {type}
                        </Button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Share your thoughts, achievements, or upcoming events..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      rows={4}
                    />
                    <Input
                      placeholder="Tags (comma separated)"
                      value={newPostTags}
                      onChange={(e) => setNewPostTags(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePost}>
                        Post
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>
                      {post.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{post.author.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {post.author.program} • Year {post.author.year}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(post.type)}>
                    {getTypeIcon(post.type)}
                    {post.type}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{post.content}</p>
              
              {post.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {post.location}
                </div>
              )}
              
              {post.eventTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {post.eventTime}
                </div>
              )}
              
              {post.participants && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {post.participants} participants
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLike?.(post.id)}
                    className="flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    {post.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onComment?.(post.id, "")}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {post.comments}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onShare?.(post.id)}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    {post.shares}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {post.timestamp}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
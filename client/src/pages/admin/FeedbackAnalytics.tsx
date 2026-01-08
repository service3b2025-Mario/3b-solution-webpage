import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Star, TrendingUp, ThumbsUp, Users, Calendar, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function FeedbackAnalytics() {
  const { data: allFeedback, isLoading } = trpc.feedback.all.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!allFeedback || allFeedback.length === 0) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tour Feedback Analytics</h1>
          <p className="text-muted-foreground">
            Insights from virtual property tour feedback
          </p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Feedback Yet</h3>
            <p className="text-muted-foreground">
              Feedback will appear here after users complete virtual tours
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate analytics
  const totalFeedback = allFeedback.length;
  const averageRating = allFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / totalFeedback;
  const averageTourQuality = allFeedback.filter(f => f.tourQuality).reduce((sum, f) => sum + (f.tourQuality || 0), 0) / allFeedback.filter(f => f.tourQuality).length || 0;
  const recommendationRate = (allFeedback.filter(f => f.wouldRecommend).length / totalFeedback) * 100;

  // Interest distribution
  const interestCounts = {
    very_interested: allFeedback.filter(f => f.propertyInterest === 'very_interested').length,
    interested: allFeedback.filter(f => f.propertyInterest === 'interested').length,
    neutral: allFeedback.filter(f => f.propertyInterest === 'neutral').length,
    not_interested: allFeedback.filter(f => f.propertyInterest === 'not_interested').length,
  };

  // Next steps distribution
  const nextStepsCounts = {
    schedule_visit: allFeedback.filter(f => f.nextSteps === 'schedule_visit').length,
    request_info: allFeedback.filter(f => f.nextSteps === 'request_info').length,
    make_offer: allFeedback.filter(f => f.nextSteps === 'make_offer').length,
    not_ready: allFeedback.filter(f => f.nextSteps === 'not_ready').length,
    other: allFeedback.filter(f => f.nextSteps === 'other').length,
  };

  // Property ratings
  const propertyRatings = allFeedback.reduce((acc, f) => {
    const key = f.propertyId;
    if (!acc[key]) {
      acc[key] = {
        propertyId: f.propertyId,
        propertyTitle: f.propertyTitle || 'Unknown Property',
        ratings: [],
        count: 0
      };
    }
    acc[key].ratings.push(f.rating || 0);
    acc[key].count++;
    return acc;
  }, {} as Record<number, { propertyId: number; propertyTitle: string; ratings: number[]; count: number }>);

  const propertyAverages = Object.values(propertyRatings).map(p => ({
    ...p,
    average: p.ratings.reduce((sum, r) => sum + r, 0) / p.count
  })).sort((a, b) => b.average - a.average);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getInterestBadge = (interest: string | null) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      very_interested: { variant: "default", label: "Very Interested" },
      interested: { variant: "secondary", label: "Interested" },
      neutral: { variant: "outline", label: "Neutral" },
      not_interested: { variant: "destructive", label: "Not Interested" },
    };
    const config = variants[interest || ''] || { variant: "outline" as const, label: "N/A" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getNextStepsBadge = (nextSteps: string | null) => {
    const labels: Record<string, string> = {
      schedule_visit: "Schedule Visit",
      request_info: "Request Info",
      make_offer: "Make Offer",
      not_ready: "Not Ready",
      other: "Other",
    };
    return <Badge variant="outline">{labels[nextSteps || ''] || 'N/A'}</Badge>;
  };

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tour Feedback Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive insights from {totalFeedback} virtual property tour{totalFeedback !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex items-center mt-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall experience rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tour Quality</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageTourQuality.toFixed(1)}</div>
            <div className="flex items-center mt-1">
              {renderStars(Math.round(averageTourQuality))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Virtual tour presentation quality
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendation Rate</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendationRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Would recommend to others
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFeedback}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed tour reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interest & Next Steps Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Property Interest Distribution</CardTitle>
            <CardDescription>How interested are users in properties after tours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Very Interested</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(interestCounts.very_interested / totalFeedback) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {interestCounts.very_interested} ({((interestCounts.very_interested / totalFeedback) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Interested</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(interestCounts.interested / totalFeedback) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {interestCounts.interested} ({((interestCounts.interested / totalFeedback) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Neutral</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-gray-400 h-2 rounded-full" 
                      style={{ width: `${(interestCounts.neutral / totalFeedback) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {interestCounts.neutral} ({((interestCounts.neutral / totalFeedback) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Not Interested</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(interestCounts.not_interested / totalFeedback) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {interestCounts.not_interested} ({((interestCounts.not_interested / totalFeedback) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps Distribution</CardTitle>
            <CardDescription>What users want to do after the tour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Schedule Visit</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(nextStepsCounts.schedule_visit / totalFeedback) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {nextStepsCounts.schedule_visit} ({((nextStepsCounts.schedule_visit / totalFeedback) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Request Info</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(nextStepsCounts.request_info / totalFeedback) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {nextStepsCounts.request_info} ({((nextStepsCounts.request_info / totalFeedback) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Make Offer</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(nextStepsCounts.make_offer / totalFeedback) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {nextStepsCounts.make_offer} ({((nextStepsCounts.make_offer / totalFeedback) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Not Ready</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-gray-400 h-2 rounded-full" 
                      style={{ width: `${(nextStepsCounts.not_ready / totalFeedback) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {nextStepsCounts.not_ready} ({((nextStepsCounts.not_ready / totalFeedback) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Other</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${(nextStepsCounts.other / totalFeedback) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {nextStepsCounts.other} ({((nextStepsCounts.other / totalFeedback) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Rankings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Property Rankings</CardTitle>
          <CardDescription>Properties ranked by average tour feedback rating</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Average Rating</TableHead>
                <TableHead>Reviews</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertyAverages.map((property, index) => (
                <TableRow key={property.propertyId}>
                  <TableCell className="font-medium">#{index + 1}</TableCell>
                  <TableCell>{property.propertyTitle}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(property.average))}
                      <span className="text-sm text-muted-foreground">
                        {property.average.toFixed(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{property.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Latest tour feedback from users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Next Steps</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allFeedback.slice(0, 10).map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{feedback.userName}</div>
                      <div className="text-xs text-muted-foreground">{feedback.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{feedback.propertyTitle}</TableCell>
                  <TableCell>{renderStars(feedback.rating || 0)}</TableCell>
                  <TableCell>{getInterestBadge(feedback.propertyInterest)}</TableCell>
                  <TableCell>{getNextStepsBadge(feedback.nextSteps)}</TableCell>
                  <TableCell className="max-w-md">
                    {feedback.comments ? (
                      <div className="text-sm text-muted-foreground truncate">
                        {feedback.comments}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No comments</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

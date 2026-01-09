import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Quote, TrendingUp, MapPin, Calendar, ArrowRight, Star, Building2 } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SuccessStoryDetailModal } from "@/components/SuccessStoryDetailModal";

export default function SuccessStories() {
  const { data: stories } = trpc.stories.list.useQuery({});
  const { data: featuredStory } = trpc.stories.featured.useQuery();
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStoryClick = (story: any) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStory(null);
  };

  const storyItems = stories && 'items' in stories ? stories.items : (stories || []);
  const filteredStories = (storyItems as any[]).filter((story: any) => {
    if (selectedType !== "all" && story.clientType !== selectedType) return false;
    return true;
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 py-20">
        <div className="container">
          <Breadcrumb items={[{ label: "Stories" }]} />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Success Stories
            </h1>
            <p className="text-xl text-white/80">
              Real results from real investors. Discover how our clients have achieved exceptional returns.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Story */}
      {featuredStory && (
        <section className="py-16 bg-background">
          <div className="container">
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium">
                <Star className="w-4 h-4" />
                Featured Story of the Month
              </span>
            </div>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-64 lg:h-auto bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                  {featuredStory.image ? (
                    <img src={featuredStory.image} alt={featuredStory.title} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-24 h-24 text-primary/30" />
                  )}
                </div>
                <CardContent className="p-8 lg:p-12">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Quote className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold">{featuredStory.clientName}</p>
                      <p className="text-sm text-muted-foreground">{featuredStory.clientType}</p>
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{featuredStory.title}</h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{featuredStory.challenge}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-5 bg-secondary/10 border-2 border-secondary/20 rounded-xl">
                      <div className="text-sm font-medium text-secondary/70 mb-1">Investment</div>
                      <div className="text-2xl md:text-3xl font-bold text-secondary">{featuredStory.investmentAmount || 'Confidential'}</div>
                    </div>
                    {featuredStory.returnAchieved && featuredStory.returnAchieved !== 'N/A' && (
                      <div className="text-center p-5 bg-secondary/10 border-2 border-secondary/20 rounded-xl">
                        <div className="text-sm font-medium text-secondary/70 mb-1">Return</div>
                        <div className="text-2xl md:text-3xl font-bold text-secondary">{featuredStory.returnAchieved}%</div>
                      </div>
                    )}
                    <div className="text-center p-5 bg-secondary/10 border-2 border-secondary/20 rounded-xl">
                      <div className="text-sm font-medium text-secondary/70 mb-1">Timeframe</div>
                      <div className="text-2xl md:text-3xl font-bold text-secondary">{featuredStory.timeline}</div>
                    </div>
                  </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-secondary">{featuredStory.timeline}</div>
                      <div className="text-xs text-muted-foreground">Timeframe</div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleStoryClick(featuredStory)}
                    className="bg-secondary hover:bg-secondary/90 text-white"
                  >
                    Read Full Story
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* All Stories */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          {/* Filter */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold">All Success Stories</h2>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Client Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Family Office">Family Office</SelectItem>
                <SelectItem value="Institutional">Institutional</SelectItem>
                <SelectItem value="Developer">Developer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStories.map((story: any) => (
              <Card 
                key={story.id} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => handleStoryClick(story)}
              >
                <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                  {story.image ? (
                    <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-16 h-16 text-primary/30" />
                  )}
                  {story.featured && (
                    <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <span className="px-2 py-0.5 bg-muted rounded text-xs">{story.clientType}</span>
                    {story.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {story.location}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{story.shortDescription}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    {story.returnAchieved && story.returnAchieved !== 'N/A' && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-secondary" />
                        <span className="font-bold text-secondary">{story.returnAchieved}% Return</span>
                      </div>
                    )}
                    {story.timeframe && (
                      <span className="text-xs text-muted-foreground">{story.timeframe}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto">
              Hear directly from investors who have partnered with 3B Solution
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "3B Solution's expertise in the Philippine market helped us achieve returns we never thought possible. Their team's dedication is unmatched.",
                author: "Michael Chen",
                role: "Family Office Principal",
              },
              {
                quote: "The level of due diligence and market analysis provided by 3B Solution gave us complete confidence in our investment decisions.",
                author: "Sarah Williams",
                role: "Private Investor",
              },
              {
                quote: "From property selection to ongoing management, 3B Solution has been an exceptional partner in our real estate portfolio expansion.",
                author: "David Park",
                role: "Institutional Investor",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-0">
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-secondary mb-4" />
                  <p className="text-primary-foreground/90 mb-6 leading-relaxed">{testimonial.quote}</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-primary-foreground/70">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Story Detail Modal */}
      <SuccessStoryDetailModal
        story={selectedStory}
        open={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our growing community of successful investors and start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-medium px-8">
                Schedule Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/properties">
              <Button size="lg" variant="outline" className="font-medium px-8">
                Explore Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

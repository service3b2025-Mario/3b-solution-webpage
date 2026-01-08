import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Search, Eye, Mail, Heart, Bookmark, Calendar, TrendingUp, Building2 } from "lucide-react";
import { useLocation } from "wouter";

export function LeadsSection() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1]);
  const userIdParam = params.get('user');
  const filterParam = params.get('filter');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const { data: allUsers } = trpc.analytics.recentUsers.useQuery({ limit: 1000 });
  const { data: userDetails } = trpc.analytics.userEngagement.useQuery(
    { userId: String(selectedUser?.id || userIdParam || "") },
    { enabled: !!(selectedUser?.id || userIdParam) }
  );

  // Filter users based on search and filter params
  const filteredUsers = allUsers?.filter((user: any) => {
    const matchesSearch = !searchQuery || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = !filterParam || 
      (filterParam === 'engaged' && (user.wishlistCount > 0 || user.savedSearchCount > 0)) ||
      (filterParam === 'inquiries' && user.inquiryCount > 0);
    
    return matchesSearch && matchesFilter;
  }) || [];

  // Auto-open user detail if userIdParam exists
  if (userIdParam && !selectedUser && allUsers) {
    const user = allUsers.find((u: any) => u.id === userIdParam);
    if (user) setSelectedUser(user);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Leads</h1>
          <p className="text-muted-foreground">Track user engagement and conversion</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.href = '/admin/leads'}>
            All Users
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/admin/leads?filter=engaged'}>
            Engaged Users
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>
            {filterParam === 'engaged' ? 'Engaged Users' : 
             filterParam === 'inquiries' ? 'Users with Inquiries' : 
             'All Registered Users'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user: any) => (
                <TableRow key={user.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell className="font-medium">{user.name || 'Anonymous'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.wishlistCount > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <Heart className="w-3 h-3" />
                          {user.wishlistCount}
                        </Badge>
                      )}
                      {user.savedSearchCount > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <Bookmark className="w-3 h-3" />
                          {user.savedSearchCount}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{selectedUser?.name || 'Anonymous User'}</p>
                <p className="text-sm text-muted-foreground font-normal">{selectedUser?.email}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {userDetails && (
            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="wishlist">Wishlist ({userDetails.wishlist?.length || 0})</TabsTrigger>
                <TabsTrigger value="searches">Saved Searches ({userDetails.savedSearches?.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-pink-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Wishlist</p>
                          <p className="text-2xl font-bold">{userDetails.wishlist?.length || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Bookmark className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Searches</p>
                          <p className="text-2xl font-bold">{userDetails.savedSearches?.length || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Views</p>
                          <p className="text-2xl font-bold">{userDetails.propertyViews || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Member Since</p>
                          <p className="text-sm font-medium">
                            {new Date(selectedUser?.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Engagement Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userDetails.timeline?.map((event: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            {event.type === 'wishlist' && <Heart className="w-4 h-4 text-pink-600" />}
                            {event.type === 'search' && <Bookmark className="w-4 h-4 text-blue-600" />}
                            {event.type === 'view' && <Eye className="w-4 h-4 text-purple-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{event.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )) || (
                        <p className="text-center text-muted-foreground py-8">No activity yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wishlist" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userDetails.wishlist?.map((item: any) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.property?.mainImage ? (
                              <img 
                                src={item.property.mainImage} 
                                alt={item.property.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Building2 className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.property?.title}</p>
                            <p className="text-sm text-muted-foreground">{item.property?.location}</p>
                            <p className="text-sm font-semibold text-primary mt-1">
                              ${item.property?.price?.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Added {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) || (
                    <p className="col-span-2 text-center text-muted-foreground py-8">No wishlist items</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="searches" className="space-y-4">
                {userDetails.savedSearches?.map((search: any) => (
                  <Card key={search.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{search.name}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {search.criteria?.type && (
                              <Badge variant="outline">{search.criteria.type}</Badge>
                            )}
                            {search.criteria?.minPrice && (
                              <Badge variant="outline">
                                ${search.criteria.minPrice.toLocaleString()}+
                              </Badge>
                            )}
                            {search.criteria?.bedrooms && (
                              <Badge variant="outline">{search.criteria.bedrooms} bed</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(search.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )) || (
                  <p className="text-center text-muted-foreground py-8">No saved searches</p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Save, Eye, EyeOff, Key, Video, Calendar, Info } from "lucide-react";

export default function APICredentials() {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  
  // Fetch current settings
  const { data: googleMeetJson } = trpc.settings.get.useQuery("GOOGLE_MEET_SERVICE_ACCOUNT_JSON");
  const { data: googleCalendarId } = trpc.settings.get.useQuery("GOOGLE_MEET_CALENDAR_ID");
  const { data: zoomAccountId } = trpc.settings.get.useQuery("ZOOM_ACCOUNT_ID");
  const { data: zoomClientId } = trpc.settings.get.useQuery("ZOOM_CLIENT_ID");
  const { data: zoomClientSecret } = trpc.settings.get.useQuery("ZOOM_CLIENT_SECRET");
  const { data: teamsTenantId } = trpc.settings.get.useQuery("TEAMS_TENANT_ID");
  const { data: teamsClientId } = trpc.settings.get.useQuery("TEAMS_CLIENT_ID");
  const { data: teamsClientSecret } = trpc.settings.get.useQuery("TEAMS_CLIENT_SECRET");

  // Form state
  const [googleServiceAccount, setGoogleServiceAccount] = useState("");
  const [googleCalendar, setGoogleCalendar] = useState("");
  const [zoomAccount, setZoomAccount] = useState("");
  const [zoomClient, setZoomClient] = useState("");
  const [zoomSecret, setZoomSecret] = useState("");
  const [teamsTenant, setTeamsTenant] = useState("");
  const [teamsClient, setTeamsClient] = useState("");
  const [teamsSecret, setTeamsSecret] = useState("");

  const utils = trpc.useUtils();
  const upsertSetting = trpc.settings.upsert.useMutation({
    onSuccess: () => {
      utils.settings.invalidate();
      toast.success("API credentials saved successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to save: ${error.message}`);
    }
  });

  const handleSaveGoogleMeet = async () => {
    try {
      // Validate JSON if provided
      if (googleServiceAccount) {
        JSON.parse(googleServiceAccount);
      }
      
      await Promise.all([
        upsertSetting.mutateAsync({
          key: "GOOGLE_MEET_SERVICE_ACCOUNT_JSON",
          value: googleServiceAccount,
          type: "json",
          category: "api_credentials"
        }),
        upsertSetting.mutateAsync({
          key: "GOOGLE_MEET_CALENDAR_ID",
          value: googleCalendar,
          type: "text",
          category: "api_credentials"
        })
      ]);
      
      setGoogleServiceAccount("");
      setGoogleCalendar("");
    } catch (error: any) {
      toast.error(`Invalid JSON format: ${error.message}`);
    }
  };

  const handleSaveZoom = async () => {
    await Promise.all([
      upsertSetting.mutateAsync({
        key: "ZOOM_ACCOUNT_ID",
        value: zoomAccount,
        type: "text",
        category: "api_credentials"
      }),
      upsertSetting.mutateAsync({
        key: "ZOOM_CLIENT_ID",
        value: zoomClient,
        type: "text",
        category: "api_credentials"
      }),
      upsertSetting.mutateAsync({
        key: "ZOOM_CLIENT_SECRET",
        value: zoomSecret,
        type: "text",
        category: "api_credentials"
      })
    ]);
    
    setZoomAccount("");
    setZoomClient("");
    setZoomSecret("");
  };

  const handleSaveTeams = async () => {
    await Promise.all([
      upsertSetting.mutateAsync({
        key: "TEAMS_TENANT_ID",
        value: teamsTenant,
        type: "text",
        category: "api_credentials"
      }),
      upsertSetting.mutateAsync({
        key: "TEAMS_CLIENT_ID",
        value: teamsClient,
        type: "text",
        category: "api_credentials"
      }),
      upsertSetting.mutateAsync({
        key: "TEAMS_CLIENT_SECRET",
        value: teamsSecret,
        type: "text",
        category: "api_credentials"
      })
    ]);
    
    setTeamsTenant("");
    setTeamsClient("");
    setTeamsSecret("");
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskValue = (value: string | null | undefined) => {
    if (!value) return "Not configured";
    return "••••••••••••••••";
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Credentials</h1>
        <p className="text-muted-foreground">
          Configure third-party API credentials for video conferencing integrations
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          These credentials are stored securely in the database and used to automatically generate meeting links for virtual property tours.
          Leave fields empty to continue using placeholder links.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="google-meet" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="google-meet" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Google Meet
          </TabsTrigger>
          <TabsTrigger value="zoom" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Zoom
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            MS Teams
          </TabsTrigger>
        </TabsList>

        {/* Google Meet Tab */}
        <TabsContent value="google-meet">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Google Meet Configuration
              </CardTitle>
              <CardDescription>
                Configure Google Calendar API to automatically create Google Meet links for virtual tours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Setup Instructions */}
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <h4 className="font-semibold flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Setup Instructions
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
                  <li>Create a new project or select an existing one</li>
                  <li>Enable the <strong>Google Calendar API</strong></li>
                  <li>Create credentials → Service Account</li>
                  <li>Download the JSON key file</li>
                  <li>Share your calendar with the service account email</li>
                </ol>
              </div>

              {/* Current Status */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Current Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${googleMeetJson ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-muted-foreground">
                      {googleMeetJson ? 'Configured' : 'Not configured'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Account JSON */}
              <div className="space-y-2">
                <Label htmlFor="google-service-account">
                  Service Account JSON Key *
                </Label>
                <Textarea
                  id="google-service-account"
                  value={googleServiceAccount}
                  onChange={(e) => setGoogleServiceAccount(e.target.value)}
                  placeholder='Paste the entire JSON key file content here...'
                  rows={8}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Paste the complete JSON content from your downloaded service account key file
                </p>
              </div>

              {/* Calendar ID */}
              <div className="space-y-2">
                <Label htmlFor="google-calendar-id">
                  Calendar ID *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="google-calendar-id"
                    type={showSecrets['google-calendar'] ? 'text' : 'password'}
                    value={googleCalendar || googleCalendarId || ''}
                    onChange={(e) => setGoogleCalendar(e.target.value)}
                    placeholder="your-calendar@gmail.com or calendar-id@group.calendar.google.com"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => toggleShowSecret('google-calendar')}
                  >
                    {showSecrets['google-calendar'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Usually your Gmail address or a shared calendar ID. Find it in Google Calendar settings.
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveGoogleMeet}
                  disabled={upsertSetting.isPending || (!googleServiceAccount && !googleCalendar)}
                >
                  {upsertSetting.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Google Meet Credentials
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zoom Tab */}
        <TabsContent value="zoom">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Zoom Configuration
              </CardTitle>
              <CardDescription>
                Configure Zoom Server-to-Server OAuth to automatically create Zoom meetings for virtual tours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Setup Instructions */}
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <h4 className="font-semibold flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Setup Instructions
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Go to <a href="https://marketplace.zoom.us/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Zoom App Marketplace</a></li>
                  <li>Click "Develop" → "Build App"</li>
                  <li>Choose <strong>"Server-to-Server OAuth"</strong> app type</li>
                  <li>Fill in app information and activate</li>
                  <li>Add <strong>meeting:write</strong> scope permission</li>
                  <li>Copy Account ID, Client ID, and Client Secret</li>
                </ol>
              </div>

              {/* Current Status */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Current Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${zoomAccountId && zoomClientId && zoomClientSecret ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-muted-foreground">
                      {zoomAccountId && zoomClientId && zoomClientSecret ? 'Configured' : 'Not configured'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account ID */}
              <div className="space-y-2">
                <Label htmlFor="zoom-account-id">
                  Account ID *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="zoom-account-id"
                    type={showSecrets['zoom-account'] ? 'text' : 'password'}
                    value={zoomAccount || zoomAccountId || ''}
                    onChange={(e) => setZoomAccount(e.target.value)}
                    placeholder="Enter Zoom Account ID"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => toggleShowSecret('zoom-account')}
                  >
                    {showSecrets['zoom-account'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Client ID */}
              <div className="space-y-2">
                <Label htmlFor="zoom-client-id">
                  Client ID *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="zoom-client-id"
                    type={showSecrets['zoom-client'] ? 'text' : 'password'}
                    value={zoomClient || zoomClientId || ''}
                    onChange={(e) => setZoomClient(e.target.value)}
                    placeholder="Enter Zoom Client ID"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => toggleShowSecret('zoom-client')}
                  >
                    {showSecrets['zoom-client'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Client Secret */}
              <div className="space-y-2">
                <Label htmlFor="zoom-client-secret">
                  Client Secret *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="zoom-client-secret"
                    type={showSecrets['zoom-secret'] ? 'text' : 'password'}
                    value={zoomSecret || zoomClientSecret || ''}
                    onChange={(e) => setZoomSecret(e.target.value)}
                    placeholder="Enter Zoom Client Secret"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => toggleShowSecret('zoom-secret')}
                  >
                    {showSecrets['zoom-secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveZoom}
                  disabled={upsertSetting.isPending || (!zoomAccount && !zoomClient && !zoomSecret)}
                >
                  {upsertSetting.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Zoom Credentials
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MS Teams Tab */}
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Microsoft Teams Configuration
              </CardTitle>
              <CardDescription>
                Configure Microsoft Graph API to automatically create Teams meetings for virtual tours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Setup Instructions */}
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <h4 className="font-semibold flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Setup Instructions
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Go to <a href="https://portal.azure.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Azure Portal</a></li>
                  <li>Navigate to <strong>Azure Active Directory</strong> → <strong>App registrations</strong></li>
                  <li>Click <strong>"New registration"</strong> and create an app</li>
                  <li>Go to <strong>"Certificates & secrets"</strong> → Create a new client secret</li>
                  <li>Go to <strong>"API permissions"</strong> → Add permissions:</li>
                  <li className="ml-6">• <strong>Calendars.ReadWrite</strong> (Application permission)</li>
                  <li className="ml-6">• <strong>OnlineMeetings.ReadWrite.All</strong> (Application permission)</li>
                  <li>Click <strong>"Grant admin consent"</strong> for your organization</li>
                  <li>Copy <strong>Tenant ID</strong>, <strong>Client ID</strong>, and <strong>Client Secret</strong></li>
                </ol>
              </div>

              {/* Current Status */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Current Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${teamsTenantId && teamsClientId && teamsClientSecret ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-muted-foreground">
                      {teamsTenantId && teamsClientId && teamsClientSecret ? 'Configured' : 'Not configured'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tenant ID */}
              <div className="space-y-2">
                <Label htmlFor="teams-tenant-id">
                  Tenant ID (Directory ID) *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="teams-tenant-id"
                    type={showSecrets['teams-tenant'] ? 'text' : 'password'}
                    value={teamsTenant || teamsTenantId || ''}
                    onChange={(e) => setTeamsTenant(e.target.value)}
                    placeholder="Enter Azure AD Tenant ID"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => toggleShowSecret('teams-tenant')}
                  >
                    {showSecrets['teams-tenant'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Found in Azure Portal → Azure Active Directory → Overview
                </p>
              </div>

              {/* Client ID */}
              <div className="space-y-2">
                <Label htmlFor="teams-client-id">
                  Client ID (Application ID) *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="teams-client-id"
                    type={showSecrets['teams-client'] ? 'text' : 'password'}
                    value={teamsClient || teamsClientId || ''}
                    onChange={(e) => setTeamsClient(e.target.value)}
                    placeholder="Enter Application (client) ID"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => toggleShowSecret('teams-client')}
                  >
                    {showSecrets['teams-client'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Found in your app registration → Overview → Application (client) ID
                </p>
              </div>

              {/* Client Secret */}
              <div className="space-y-2">
                <Label htmlFor="teams-client-secret">
                  Client Secret *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="teams-client-secret"
                    type={showSecrets['teams-secret'] ? 'text' : 'password'}
                    value={teamsSecret || teamsClientSecret || ''}
                    onChange={(e) => setTeamsSecret(e.target.value)}
                    placeholder="Enter Client Secret Value"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => toggleShowSecret('teams-secret')}
                  >
                    {showSecrets['teams-secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Found in your app registration → Certificates & secrets → Client secrets (copy the Value, not the Secret ID)
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveTeams}
                  disabled={upsertSetting.isPending || (!teamsTenant && !teamsClient && !teamsSecret)}
                >
                  {upsertSetting.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Teams Credentials
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

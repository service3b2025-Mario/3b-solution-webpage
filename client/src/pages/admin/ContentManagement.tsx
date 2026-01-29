// Legal Pages Tab - UPDATED VERSION
// Replace the existing LegalPagesTab function in ContentManagement.tsx with this code

function LegalPagesTab() {
  const [activeTab, setActiveTab] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);

  const utils = trpc.useUtils();
  const { data: pages, isLoading } = trpc.legalPages.listAll.useQuery(undefined, {
    enabled: activeTab,
  });

  const createPage = trpc.legalPages.create.useMutation({
    onSuccess: () => {
      setIsAdding(false);
      setEditingId(null);
      setEditData({});
      utils.legalPages.listAll.invalidate();
      toast.success("Legal page created successfully");
    },
    onError: () => {
      toast.error("Failed to create legal page");
    },
  });

  const updatePage = trpc.legalPages.update.useMutation({
    onMutate: async (newData) => {
      await utils.legalPages.listAll.cancel();
      const previousPages = utils.legalPages.listAll.getData();
      utils.legalPages.listAll.setData(undefined, (old: any) =>
        old ? old.map((page: any) =>
          page.id === newData.id ? { ...page, ...newData } : page
        ) : old
      );
      return { previousPages };
    },
    onError: (err, newData, context) => {
      utils.legalPages.listAll.setData(undefined, context?.previousPages);
      toast.error("Failed to update legal page");
    },
    onSettled: () => {
      utils.legalPages.listAll.invalidate();
      setEditingId(null);
      setEditData({});
      toast.success("Legal page updated successfully");
    },
  });

  const deletePage = trpc.legalPages.delete.useMutation({
    onSuccess: () => {
      utils.legalPages.listAll.invalidate();
      toast.success("Legal page deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete legal page");
    },
  });

  useEffect(() => {
    setActiveTab(true);
  }, []);

  const handleEdit = (page: any) => {
    setEditingId(page.id);
    setEditData(page);
  };

  const handleSave = () => {
    if (isAdding) {
      createPage.mutate(editData);
    } else if (editingId) {
      updatePage.mutate({ id: editingId, ...editData });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setEditData({});
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(-1);
    setEditData({
      title: "",
      slug: "",
      content: "",
      contentDe: "",
      contentZh: "",
      metaTitle: "",
      metaDescription: "",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this legal page?")) {
      deletePage.mutate(id);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Legal Pages</span>
          <Button 
            className="bg-secondary hover:bg-secondary/90 text-white" 
            size="sm"
            onClick={handleAdd}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Legal Page
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={3} />
        ) : (
          <div className="space-y-6">
            {/* Add new page form */}
            {isAdding && editingId === -1 && (
              <Card className="border-2 border-secondary/50 bg-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>New Legal Page</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSave}
                        disabled={createPage.isPending || !editData.title || !editData.slug}
                      >
                        {createPage.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleCancel}>
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Title *</label>
                        <Input
                          value={editData.title || ""}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          placeholder="Cookie Policy"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Slug *</label>
                        <Input
                          value={editData.slug || ""}
                          onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                          placeholder="cookie-policy"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content (English)</label>
                      <div className="min-h-[400px] border rounded-md">
                        <RichTextEditor
                          content={editData.content || ""}
                          onChange={(content) => setEditData({ ...editData, content })}
                          placeholder="Enter legal page content in English..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content (German / Deutsch)</label>
                      <div className="min-h-[400px] border rounded-md">
                        <RichTextEditor
                          content={editData.contentDe || ""}
                          onChange={(contentDe) => setEditData({ ...editData, contentDe })}
                          placeholder="Enter legal page content in German..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content (Chinese / 中文)</label>
                      <div className="min-h-[400px] border rounded-md">
                        <RichTextEditor
                          content={editData.contentZh || ""}
                          onChange={(contentZh) => setEditData({ ...editData, contentZh })}
                          placeholder="Enter legal page content in Chinese..."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Meta Title</label>
                        <Input
                          value={editData.metaTitle || ""}
                          onChange={(e) => setEditData({ ...editData, metaTitle: e.target.value })}
                          placeholder="SEO title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Meta Description</label>
                        <Textarea
                          value={editData.metaDescription || ""}
                          onChange={(e) => setEditData({ ...editData, metaDescription: e.target.value })}
                          placeholder="SEO description"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Existing pages */}
            {pages && pages.length > 0 ? (
              pages.map((page: any) => (
                <Card key={page.id} className="border">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      {editingId === page.id ? (
                        <Input
                          value={editData.title || ""}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          className="max-w-md"
                        />
                      ) : (
                        <span>{page.title}</span>
                      )}
                      <div className="flex gap-2">
                        {editingId === page.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSave}
                              disabled={updatePage.isPending}
                            >
                              {updatePage.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleCancel}>
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(page)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(page.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingId === page.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Slug</label>
                          <Input
                            value={editData.slug || ""}
                            onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                            placeholder="privacy-policy"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Content (English)</label>
                          <div className="min-h-[500px] border rounded-md">
                            <RichTextEditor
                              content={editData.content || ""}
                              onChange={(content) => setEditData({ ...editData, content })}
                              placeholder="Enter legal page content in English..."
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Content (German / Deutsch)</label>
                          <div className="min-h-[500px] border rounded-md">
                            <RichTextEditor
                              content={editData.contentDe || ""}
                              onChange={(contentDe) => setEditData({ ...editData, contentDe })}
                              placeholder="Enter legal page content in German..."
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Content (Chinese / 中文)</label>
                          <div className="min-h-[500px] border rounded-md">
                            <RichTextEditor
                              content={editData.contentZh || ""}
                              onChange={(contentZh) => setEditData({ ...editData, contentZh })}
                              placeholder="Enter legal page content in Chinese..."
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Meta Title</label>
                            <Input
                              value={editData.metaTitle || ""}
                              onChange={(e) => setEditData({ ...editData, metaTitle: e.target.value })}
                              placeholder="SEO title"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Meta Description</label>
                            <Textarea
                              value={editData.metaDescription || ""}
                              onChange={(e) => setEditData({ ...editData, metaDescription: e.target.value })}
                              placeholder="SEO description"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none max-h-[300px] overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: page.content || "<p class='text-muted-foreground'>No content yet</p>" }} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : !isAdding && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No legal pages found.</p>
                <Button 
                  className="bg-secondary hover:bg-secondary/90 text-white"
                  onClick={handleAdd}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Legal Page
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

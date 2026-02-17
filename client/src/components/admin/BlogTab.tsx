import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Eye, Sparkles, Send, Loader2 } from "lucide-react";
import { PAGE_SIZE } from "./types";
import { TableSkeleton } from "./AdminSkeleton";
import { Pagination } from "./Pagination";
import { MarkdownEditor } from "./MarkdownEditor";
import { GenerateArticleDialog } from "./GenerateArticleDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { BlogPost } from "../../../../drizzle/schema";

export function BlogTab() {
  const [blogPage, setBlogPage] = useState(1);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    titleHe: "",
    slug: "",
    excerpt: "",
    excerptHe: "",
    content: "",
    contentHe: "",
    coverImage: "",
    category: "",
    tags: "",
    isPublished: false,
    author: "WIRO 4x4",
  });

  const resetBlogForm = () => {
    setBlogForm({
      title: "",
      titleHe: "",
      slug: "",
      excerpt: "",
      excerptHe: "",
      content: "",
      contentHe: "",
      coverImage: "",
      category: "",
      tags: "",
      isPublished: false,
      author: "WIRO 4x4",
    });
    setEditingBlog(null);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const {
    data: blogData,
    isLoading: blogLoading,
    refetch: refetchBlog,
  } = trpc.blog.listAllPaginated.useQuery({
    page: blogPage,
    pageSize: PAGE_SIZE,
  });
  const allBlogPosts = blogData?.items;
  const blogTotal = blogData?.total ?? 0;
  const blogTotalPages = blogData?.totalPages ?? 1;

  const createBlogMut = trpc.blog.create.useMutation({
    onSuccess: () => {
      refetchBlog();
      setBlogDialogOpen(false);
      resetBlogForm();
      toast.success("Blog post created!");
    },
    onError: error => {
      console.error("Failed to create blog post:", error);
      toast.error("Failed to create blog post.");
    },
  });
  const updateBlogMut = trpc.blog.update.useMutation({
    onSuccess: () => {
      refetchBlog();
      setBlogDialogOpen(false);
      resetBlogForm();
      toast.success("Blog post updated!");
    },
    onError: error => {
      console.error("Failed to update blog post:", error);
      toast.error("Failed to update blog post.");
    },
  });
  const deleteBlogMut = trpc.blog.delete.useMutation({
    onSuccess: () => {
      refetchBlog();
      toast.success("Blog post deleted!");
    },
    onError: error => {
      console.error("Failed to delete blog post:", error);
      toast.error("Failed to delete blog post.");
    },
  });

  const sendNewsletterMut = trpc.newsletter.send.useMutation({
    onSuccess: data => {
      toast.success(`Newsletter sent to ${data.sent} subscribers!`);
    },
    onError: error => {
      toast.error(`Failed to send newsletter: ${error.message}`);
    },
  });

  const uploadImageMut = trpc.blog.uploadImage.useMutation();

  const handleImageUpload = async (file: File): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1];
          const result = await uploadImageMut.mutateAsync({
            fileName: file.name,
            fileData: base64,
            contentType: file.type,
          });
          resolve(result.url);
        } catch (err) {
          toast.error("Image upload failed");
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Blog Management</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setGenerateDialogOpen(true)}
            className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#D4AF37]/90 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate Article
          </button>
          <button
            onClick={() => {
              resetBlogForm();
              setBlogDialogOpen(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            + New Post
          </button>
        </div>
      </div>

      {blogLoading ? (
        <TableSkeleton />
      ) : !allBlogPosts?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          No blog posts yet. Create your first post.
        </div>
      ) : (
        <div className="space-y-4">
          {allBlogPosts.map(post => (
            <div
              key={post.id}
              className="border border-border rounded-lg overflow-hidden"
            >
              <div className="p-3 md:p-4">
                <div className="flex items-start gap-3 md:gap-4">
                  {post.coverImage && (
                    <div className="w-16 h-14 md:w-20 md:h-16 rounded overflow-hidden shrink-0">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm md:text-base truncate">
                      {post.title}
                    </h4>
                    {post.titleHe && (
                      <p
                        className="text-xs text-muted-foreground truncate"
                        dir="rtl"
                      >
                        {post.titleHe}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mt-1">
                      <span className="font-mono text-xs">/{post.slug}</span>
                      {post.category && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {post.category}
                        </span>
                      )}
                      <span>{post.author || "WIRO 4x4"}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${post.isPublished === 1 ? "bg-green-100 text-green-800" : "bg-muted text-foreground"}`}
                      >
                        {post.isPublished === 1 ? "Published" : "Draft"}
                      </span>
                      {post.publishedAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {post.excerpt && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                  <button
                    onClick={() =>
                      updateBlogMut.mutate({
                        id: post.id,
                        data: { isPublished: post.isPublished !== 1 },
                      })
                    }
                    className="px-3 py-1.5 bg-yellow-100 text-yellow-600 rounded text-xs hover:bg-yellow-200 min-h-[36px]"
                  >
                    {post.isPublished === 1 ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingBlog(post);
                      setBlogForm({
                        title: post.title,
                        titleHe: post.titleHe || "",
                        slug: post.slug,
                        excerpt: post.excerpt || "",
                        excerptHe: post.excerptHe || "",
                        content: post.content,
                        contentHe: post.contentHe || "",
                        coverImage: post.coverImage || "",
                        category: post.category || "",
                        tags: post.tags || "",
                        isPublished: post.isPublished === 1,
                        author: post.author || "WIRO 4x4",
                      });
                      setBlogDialogOpen(true);
                    }}
                    className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200 min-h-[36px]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this blog post?"))
                        deleteBlogMut.mutate({ id: post.id });
                    }}
                    className="px-3 py-1.5 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 min-h-[36px]"
                  >
                    Delete
                  </button>
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-muted text-muted-foreground rounded text-xs hover:bg-muted/80 min-h-[36px] flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> View
                  </a>
                  {post.isPublished === 1 && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Send "${post.title}" to all newsletter subscribers?`
                          )
                        )
                          sendNewsletterMut.mutate({ blogPostId: post.id });
                      }}
                      disabled={sendNewsletterMut.isPending}
                      className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded text-xs hover:bg-purple-200 min-h-[36px] flex items-center gap-1"
                    >
                      {sendNewsletterMut.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      Send to Subscribers
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={blogPage}
        totalPages={blogTotalPages}
        total={blogTotal}
        onPageChange={setBlogPage}
      />

      {/* Blog Post Dialog */}
      <Dialog
        open={blogDialogOpen}
        onOpenChange={open => {
          if (!open) {
            setBlogDialogOpen(false);
            resetBlogForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBlog ? "Edit Blog Post" : "New Blog Post"}
            </DialogTitle>
            <DialogDescription>
              Fill in the blog post details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title (English) *
                </label>
                <input
                  type="text"
                  value={blogForm.title}
                  onChange={e => {
                    const newTitle = e.target.value;
                    setBlogForm(p => ({
                      ...p,
                      title: newTitle,
                      slug: !editingBlog ? generateSlug(newTitle) : p.slug,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title (Hebrew)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={blogForm.titleHe}
                  onChange={e =>
                    setBlogForm(p => ({ ...p, titleHe: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                type="text"
                value={blogForm.slug}
                onChange={e =>
                  setBlogForm(p => ({ ...p, slug: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono"
                placeholder="my-blog-post"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Excerpt (English)
                </label>
                <textarea
                  value={blogForm.excerpt}
                  onChange={e =>
                    setBlogForm(p => ({ ...p, excerpt: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Excerpt (Hebrew)
                </label>
                <textarea
                  dir="rtl"
                  value={blogForm.excerptHe}
                  onChange={e =>
                    setBlogForm(p => ({ ...p, excerptHe: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  rows={2}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Content (English) *
              </label>
              <MarkdownEditor
                value={blogForm.content}
                onChange={val => setBlogForm(p => ({ ...p, content: val }))}
                placeholder="Write your article in Markdown..."
                onImageUpload={handleImageUpload}
                storageKey={
                  editingBlog
                    ? `blog-draft-${editingBlog.id}`
                    : "blog-draft-new"
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Content (Hebrew)
              </label>
              <MarkdownEditor
                value={blogForm.contentHe}
                onChange={val => setBlogForm(p => ({ ...p, contentHe: val }))}
                placeholder="..."
                dir="rtl"
                storageKey={
                  editingBlog
                    ? `blog-draft-he-${editingBlog.id}`
                    : "blog-draft-new-he"
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={blogForm.coverImage}
                  onChange={e =>
                    setBlogForm(p => ({ ...p, coverImage: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  placeholder="/images/blog.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={blogForm.category}
                  onChange={e =>
                    setBlogForm(p => ({ ...p, category: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  placeholder="Travel Tips"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Author</label>
                <input
                  type="text"
                  value={blogForm.author}
                  onChange={e =>
                    setBlogForm(p => ({ ...p, author: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Tags (JSON array)
              </label>
              <input
                type="text"
                value={blogForm.tags}
                onChange={e =>
                  setBlogForm(p => ({ ...p, tags: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder='["travel", "kosher", "thailand"]'
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="blogIsPublished"
                checked={blogForm.isPublished}
                onChange={e =>
                  setBlogForm(p => ({ ...p, isPublished: e.target.checked }))
                }
                className="w-4 h-4"
              />
              <label htmlFor="blogIsPublished" className="text-sm font-medium">
                Publish immediately
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setBlogDialogOpen(false);
                resetBlogForm();
              }}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const data = {
                  ...blogForm,
                  titleHe: blogForm.titleHe || undefined,
                  excerptHe: blogForm.excerptHe || undefined,
                  contentHe: blogForm.contentHe || undefined,
                  coverImage: blogForm.coverImage || undefined,
                  category: blogForm.category || undefined,
                  tags: blogForm.tags || undefined,
                  author: blogForm.author || undefined,
                };
                if (editingBlog) {
                  updateBlogMut.mutate({ id: editingBlog.id, data });
                } else {
                  createBlogMut.mutate(data);
                }
              }}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
            >
              {editingBlog ? "Save Changes" : "Create Post"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <GenerateArticleDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        onGenerated={draft => {
          setBlogForm(p => ({
            ...p,
            title: draft.title,
            titleHe: draft.titleHe,
            slug: draft.slug,
            excerpt: draft.excerpt,
            excerptHe: draft.excerptHe,
            content: draft.content,
            contentHe: draft.contentHe,
            category: draft.category,
            tags: draft.tags,
          }));
          setBlogDialogOpen(true);
        }}
      />
    </div>
  );
}

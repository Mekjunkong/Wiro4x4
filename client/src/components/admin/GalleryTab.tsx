import { useState, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, Star, Users, Mail, Calendar } from "lucide-react";
import { PAGE_SIZE } from "./types";
import { GalleryGridSkeleton } from "./AdminSkeleton";
import { Pagination } from "./Pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { GalleryPhoto } from "../../../../drizzle/schema";

type GalleryCategory =
  | "tours"
  | "vehicles"
  | "destinations"
  | "activities"
  | "food"
  | "accommodation"
  | "other";

type GalleryPhotoWithUrl = GalleryPhoto & { imageUrl: string };

export function GalleryTab() {
  const [galleryPage, setGalleryPage] = useState(1);
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhotoWithUrl | null>(
    null
  );
  const [showUserSubmissionsOnly, setShowUserSubmissionsOnly] = useState(false);
  const [photoForm, setPhotoForm] = useState<{
    title: string;
    imageUrl: string;
    description: string;
    category: GalleryCategory;
    sortOrder: number;
    isPublished: boolean;
  }>({
    title: "",
    imageUrl: "",
    description: "",
    category: "other",
    sortOrder: 0,
    isPublished: true,
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetPhotoForm = () => {
    setPhotoForm({
      title: "",
      imageUrl: "",
      description: "",
      category: "other" as const,
      sortOrder: 0,
      isPublished: true,
    });
    setEditingPhoto(null);
  };

  const {
    data: galleryData,
    isLoading: galleryLoading,
    refetch: refetchGallery,
  } = trpc.gallery.listAllPaginated.useQuery({
    page: galleryPage,
    pageSize: PAGE_SIZE,
  });
  const allPhotos = galleryData?.items;
  const galleryTotal = galleryData?.total ?? 0;
  const galleryTotalPages = galleryData?.totalPages ?? 1;

  // Filter photos based on user submissions toggle
  const galleryPhotos = useMemo(() => {
    if (!allPhotos) return undefined;
    if (!showUserSubmissionsOnly) return allPhotos;
    return allPhotos.filter((p: any) => p.isUserSubmitted);
  }, [allPhotos, showUserSubmissionsOnly]);

  // Count user submissions in current page
  const userSubmissionCount = useMemo(() => {
    if (!allPhotos) return 0;
    return allPhotos.filter((p: any) => p.isUserSubmitted).length;
  }, [allPhotos]);

  const createPhoto = trpc.gallery.create.useMutation({
    onSuccess: () => {
      void refetchGallery();
      setGalleryDialogOpen(false);
      resetPhotoForm();
      toast.success("Photo added!");
    },
    onError: () => toast.error("Failed to add photo."),
  });
  const updatePhotoMut = trpc.gallery.update.useMutation({
    onSuccess: () => {
      void refetchGallery();
      setGalleryDialogOpen(false);
      resetPhotoForm();
      toast.success("Photo updated!");
    },
    onError: () => toast.error("Failed to update photo."),
  });
  const deletePhotoMut = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      void refetchGallery();
      toast.success("Photo deleted!");
    },
    onError: () => toast.error("Failed to delete photo."),
  });
  const uploadPhoto = trpc.gallery.upload.useMutation();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Gallery Management</h3>
        <div className="flex items-center gap-3">
          {/* User submissions filter */}
          <button
            onClick={() => {
              setShowUserSubmissionsOnly(!showUserSubmissionsOnly);
              setGalleryPage(1);
            }}
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
              showUserSubmissionsOnly
                ? "bg-purple-100 text-purple-700 border border-purple-300"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            User Submissions
            {userSubmissionCount > 0 && (
              <span className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                {userSubmissionCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              resetPhotoForm();
              setGalleryDialogOpen(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            + Add Photo
          </button>
        </div>
      </div>

      {galleryLoading ? (
        <GalleryGridSkeleton />
      ) : !galleryPhotos?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          {showUserSubmissionsOnly
            ? "No user-submitted photos."
            : "No gallery photos yet."}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryPhotos.map((photo: any) => (
            <div
              key={photo.id}
              className={`border rounded-lg overflow-hidden ${
                photo.isUserSubmitted
                  ? "border-purple-300 bg-purple-50/30 dark:bg-purple-900/10"
                  : "border-border"
              }`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm truncate">
                    {photo.title}
                  </h4>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {photo.isUserSubmitted ? (
                      <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700 font-medium">
                        User Submitted
                      </span>
                    ) : null}
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${photo.isPublished ? "bg-green-100 text-green-800" : "bg-muted text-foreground"}`}
                    >
                      {photo.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {photo.category} | Order: {photo.sortOrder}
                </p>

                {/* User submission details */}
                {photo.isUserSubmitted && (
                  <div className="mb-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs space-y-1">
                    {photo.uploadedBy && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{photo.uploadedBy}</span>
                      </div>
                    )}
                    {photo.uploadedByEmail && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span>{photo.uploadedByEmail}</span>
                      </div>
                    )}
                    {photo.tourDate && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{photo.tourDate}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() =>
                      updatePhotoMut.mutate({
                        id: photo.id,
                        data: { isFeatured: !photo.isFeatured },
                      })
                    }
                    className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                      photo.isFeatured
                        ? "bg-accent/20 text-accent hover:bg-accent/30"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    title={
                      photo.isFeatured
                        ? "Remove from featured"
                        : "Add to featured carousel"
                    }
                  >
                    <Star
                      className={`w-3 h-3 ${photo.isFeatured ? "fill-accent" : ""}`}
                    />
                    {photo.isFeatured ? "Featured" : "Feature"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingPhoto(photo);
                      setPhotoForm({
                        title: photo.title,
                        imageUrl: photo.imageUrl,
                        description: photo.description || "",
                        category: photo.category || "other",
                        sortOrder: photo.sortOrder || 0,
                        isPublished: !!photo.isPublished,
                      });
                      setGalleryDialogOpen(true);
                    }}
                    className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      updatePhotoMut.mutate({
                        id: photo.id,
                        data: { isPublished: !photo.isPublished },
                      })
                    }
                    className={`px-2 py-1 rounded text-xs hover:opacity-80 ${
                      photo.isPublished
                        ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        : "bg-green-100 text-green-600 hover:bg-green-200"
                    }`}
                  >
                    {photo.isPublished ? "Unpublish" : "Approve & Publish"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this photo?"))
                        deletePhotoMut.mutate({ id: photo.id });
                    }}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={galleryPage}
        totalPages={galleryTotalPages}
        total={galleryTotal}
        onPageChange={setGalleryPage}
      />

      {/* Gallery Dialog */}
      <Dialog
        open={galleryDialogOpen}
        onOpenChange={open => {
          if (!open) {
            setGalleryDialogOpen(false);
            resetPhotoForm();
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPhoto ? "Edit Photo" : "Add Photo"}
            </DialogTitle>
            <DialogDescription>
              Upload or link a gallery photo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={photoForm.title}
                onChange={e =>
                  setPhotoForm(p => ({ ...p, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Upload Image
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-border rounded-2xl p-4 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                      <span className="text-sm text-muted-foreground">
                        Uploading...
                      </span>
                    </div>
                  ) : photoForm.imageUrl ? (
                    <div>
                      <img
                        src={photoForm.imageUrl}
                        alt="Preview"
                        className="max-h-32 mx-auto rounded mb-2"
                        loading="lazy"
                      />
                      <p className="text-xs text-muted-foreground">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload an image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, WebP
                      </p>
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading(true);
                    try {
                      const reader = new FileReader();
                      const base64 = await new Promise<string>(
                        (resolve, reject) => {
                          reader.onload = () => {
                            const result = reader.result as string;
                            resolve(result.split(",")[1]);
                          };
                          reader.onerror = reject;
                          reader.readAsDataURL(file);
                        }
                      );
                      const result = await uploadPhoto.mutateAsync({
                        filename: file.name,
                        contentType: file.type,
                        base64Data: base64,
                      });
                      setPhotoForm(p => ({ ...p, imageUrl: result.url }));
                    } catch (err) {
                      console.error("Upload failed:", err);
                      toast.error(
                        "Failed to upload image. Please try again or paste a URL."
                      );
                    } finally {
                      setIsUploading(false);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }
                  }}
                />
                <div className="text-center text-xs text-muted-foreground">
                  or
                </div>
                <input
                  type="text"
                  placeholder="Paste image URL"
                  value={photoForm.imageUrl}
                  onChange={e =>
                    setPhotoForm(p => ({ ...p, imageUrl: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={photoForm.description}
                onChange={e =>
                  setPhotoForm(p => ({ ...p, description: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={photoForm.category}
                onChange={e =>
                  setPhotoForm(p => ({
                    ...p,
                    category: e.target.value as GalleryCategory,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                <option value="tours">Tours</option>
                <option value="vehicles">Vehicles</option>
                <option value="destinations">Destinations</option>
                <option value="activities">Activities</option>
                <option value="food">Food</option>
                <option value="accommodation">Accommodation</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={photoForm.sortOrder}
                onChange={e =>
                  setPhotoForm(p => ({
                    ...p,
                    sortOrder: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={photoForm.isPublished}
                onChange={e =>
                  setPhotoForm(p => ({ ...p, isPublished: e.target.checked }))
                }
                className="w-4 h-4"
              />
              <label htmlFor="isPublished" className="text-sm font-medium">
                Published
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setGalleryDialogOpen(false);
                resetPhotoForm();
              }}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
            >
              Cancel
            </button>
            <button
              disabled={isUploading}
              onClick={() => {
                if (editingPhoto) {
                  updatePhotoMut.mutate({
                    id: editingPhoto.id,
                    data: photoForm,
                  });
                } else {
                  createPhoto.mutate(photoForm);
                }
              }}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingPhoto ? "Save Changes" : "Add Photo"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

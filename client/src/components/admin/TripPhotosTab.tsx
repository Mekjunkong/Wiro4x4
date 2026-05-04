import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Camera,
  Upload,
  Trash2,
  Send,
  Eye,
  Plus,
  Image,
  Link2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function TripPhotosTab() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedAlbumId, setExpandedAlbumId] = useState<number | null>(null);

  // Create album form state
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  );
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumMessage, setAlbumMessage] = useState("");

  const utils = trpc.useUtils();

  // Fetch data
  const { data: albums, isLoading: albumsLoading } =
    trpc.tripPhotos.listAlbums.useQuery();
  const { data: bookings } = trpc.booking.listPaginated.useQuery({
    page: 1,
    pageSize: 200,
  });

  // Mutations
  const createAlbumMutation = trpc.tripPhotos.createAlbum.useMutation({
    onSuccess: _data => {
      toast.success("Album created successfully!");
      setShowCreateForm(false);
      setAlbumTitle("");
      setAlbumMessage("");
      setSelectedBookingId(null);
      void utils.tripPhotos.listAlbums.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const deleteAlbumMutation = trpc.tripPhotos.deleteAlbum.useMutation({
    onSuccess: () => {
      toast.success("Album deleted");
      void utils.tripPhotos.listAlbums.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const updateAlbumMutation = trpc.tripPhotos.updateAlbum.useMutation({
    onSuccess: () => {
      toast.success("Album updated");
      void utils.tripPhotos.listAlbums.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const sendEmailMutation = trpc.tripPhotos.sendAlbumEmail.useMutation({
    onSuccess: () => toast.success("Email sent to customer!"),
    onError: err => toast.error(err.message),
  });

  const handleCreateAlbum = () => {
    if (!selectedBookingId || !albumTitle.trim()) {
      toast.error("Please select a booking and enter a title");
      return;
    }
    createAlbumMutation.mutate({
      bookingId: selectedBookingId,
      title: albumTitle.trim(),
      message: albumMessage.trim() || undefined,
    });
  };

  // Filter to completed bookings for album creation
  const completedBookings =
    bookings?.items?.filter(
      b => b.status === "completed" || b.status === "confirmed"
    ) ?? [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Trip Photo Albums
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create photo albums for customers after their tours
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Album
        </button>
      </div>

      {/* Create Album Form */}
      {showCreateForm && (
        <div className="bg-muted/50 border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">Create New Album</h3>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Select Booking
            </label>
            <select
              value={selectedBookingId ?? ""}
              onChange={e =>
                setSelectedBookingId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
            >
              <option value="">Choose a booking...</option>
              {completedBookings.map(b => (
                <option key={b.id} value={b.id}>
                  #{b.id} - {b.contactName} ({b.contactEmail || "no email"})
                  {b.arrivalDate
                    ? ` - ${new Date(b.arrivalDate).toLocaleDateString()}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Album Title
            </label>
            <input
              type="text"
              value={albumTitle}
              onChange={e => setAlbumTitle(e.target.value)}
              placeholder="e.g., Doi Inthanon Adventure - March 15, 2024"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Personal Message (optional)
            </label>
            <textarea
              value={albumMessage}
              onChange={e => setAlbumMessage(e.target.value)}
              placeholder="Add a personal note for the customer..."
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateAlbum}
              disabled={createAlbumMutation.isPending}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
            >
              {createAlbumMutation.isPending ? "Creating..." : "Create Album"}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 rounded-lg text-sm border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Albums List */}
      {albumsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : !albums || albums.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No albums yet. Create one for a completed booking!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {albums.map(album => (
            <AlbumCard
              key={album.id}
              album={album}
              isExpanded={expandedAlbumId === album.id}
              onToggleExpand={() =>
                setExpandedAlbumId(
                  expandedAlbumId === album.id ? null : album.id
                )
              }
              onDelete={() => {
                if (confirm("Delete this album and all its photos?")) {
                  deleteAlbumMutation.mutate({ id: album.id });
                }
              }}
              onToggleActive={() => {
                updateAlbumMutation.mutate({
                  id: album.id,
                  data: { isActive: !album.isActive },
                });
              }}
              onSendEmail={() => {
                if (
                  confirm(
                    `Send photo album email to ${album.bookingContactEmail}?`
                  )
                ) {
                  sendEmailMutation.mutate({ albumId: album.id });
                }
              }}
              sendingEmail={sendEmailMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Album Card Component ─────────────────────────────────────────────

interface AlbumCardProps {
  album: {
    id: number;
    bookingId: number;
    accessToken: string;
    title: string;
    message: string | null;
    isActive: number;
    expiresAt: string | Date | null;
    viewCount: number;
    photoCount: number;
    bookingContactName: string | null;
    bookingContactEmail: string | null;
    createdAt: string | Date;
  };
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onSendEmail: () => void;
  sendingEmail: boolean;
}

function AlbumCard({
  album,
  isExpanded,
  onToggleExpand,
  onDelete,
  onToggleActive,
  onSendEmail,
  sendingEmail,
}: AlbumCardProps) {
  const albumUrl = `${window.location.origin}/album/${album.accessToken}`;

  const copyLink = () => {
    void navigator.clipboard.writeText(albumUrl);
    toast.success("Album link copied!");
  };

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{album.title}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                album.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {album.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span>{album.bookingContactName || "Unknown"}</span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Image className="w-3 h-3" />
              {album.photoCount} photos
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {album.viewCount} views
            </span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t px-4 pb-4 space-y-4">
          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-3">
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border hover:bg-muted transition-colors"
            >
              <Link2 className="w-3 h-3" />
              Copy Link
            </button>
            <button
              onClick={onSendEmail}
              disabled={sendingEmail || !album.bookingContactEmail}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              {sendingEmail ? "Sending..." : "Send to Customer"}
            </button>
            <button
              onClick={onToggleActive}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border hover:bg-muted transition-colors"
            >
              {album.isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>

          {/* Album Info */}
          <div className="text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Customer:</span>{" "}
              {album.bookingContactName} (
              {album.bookingContactEmail || "no email"})
            </p>
            <p>
              <span className="text-muted-foreground">Created:</span>{" "}
              {new Date(album.createdAt).toLocaleDateString()}
            </p>
            {album.message && (
              <p>
                <span className="text-muted-foreground">Message:</span>{" "}
                {album.message}
              </p>
            )}
          </div>

          {/* Photo Upload & Management */}
          <AlbumPhotosSection albumId={album.id} />
        </div>
      )}
    </div>
  );
}

// ── Photo Upload & Management Section ────────────────────────────────

function AlbumPhotosSection({ albumId }: { albumId: number }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const { data: photos, isLoading } = trpc.tripPhotos.getAlbumPhotos.useQuery({
    albumId,
  });

  const uploadMutation = trpc.tripPhotos.uploadPhoto.useMutation({
    onSuccess: () => {
      void utils.tripPhotos.getAlbumPhotos.invalidate({ albumId });
      void utils.tripPhotos.listAlbums.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const deleteMutation = trpc.tripPhotos.deletePhoto.useMutation({
    onSuccess: () => {
      toast.success("Photo deleted");
      void utils.tripPhotos.getAlbumPhotos.invalidate({ albumId });
      void utils.tripPhotos.listAlbums.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 15MB)`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        await uploadMutation.mutateAsync({
          albumId,
          filename: file.name,
          contentType: file.type,
          base64Data: base64,
          sortOrder: (photos?.length ?? 0) + i,
        });
        successCount++;
      } catch {
        // Error already handled by mutation onError
      }
    }

    if (successCount > 0) {
      toast.success(
        `${successCount} photo${successCount > 1 ? "s" : ""} uploaded`
      );
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Photos</h4>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Upload className="w-3 h-3" />
            {uploading ? "Uploading..." : "Upload Photos"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading photos...</div>
      ) : !photos || photos.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
          No photos yet. Click "Upload Photos" to add some.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {photos.map(photo => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded overflow-hidden bg-muted"
            >
              <img
                src={photo.s3Url}
                alt={photo.caption || "Trip photo"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <button
                onClick={() => {
                  if (confirm("Delete this photo?")) {
                    deleteMutation.mutate({ id: photo.id });
                  }
                }}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete photo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

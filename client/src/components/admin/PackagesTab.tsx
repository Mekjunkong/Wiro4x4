import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  calculatePackageDiscount,
  formatUSD,
} from "../../../../shared/pricing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface PackageForm {
  name: string;
  nameHe: string;
  slug: string;
  description: string;
  descriptionHe: string;
  tourSlugs: string[];
  discountPercent: number | null;
  coverImage: string;
  isPublished: boolean;
}

const emptyForm: PackageForm = {
  name: "",
  nameHe: "",
  slug: "",
  description: "",
  descriptionHe: "",
  tourSlugs: [],
  discountPercent: null,
  coverImage: "",
  isPublished: false,
};

export function PackagesTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PackageForm>({ ...emptyForm });

  const {
    data: packages = [],
    isLoading,
    refetch,
  } = trpc.package.listAll.useQuery();
  const { data: tours = [] } = trpc.tour.list.useQuery();

  const createMut = trpc.package.create.useMutation({
    onSuccess: () => {
      void refetch();
      setDialogOpen(false);
      resetForm();
      toast.success("Package created!");
    },
    onError: () => toast.error("Failed to create package."),
  });

  const updateMut = trpc.package.update.useMutation({
    onSuccess: () => {
      void refetch();
      setDialogOpen(false);
      resetForm();
      toast.success("Package updated!");
    },
    onError: () => toast.error("Failed to update package."),
  });

  const deleteMut = trpc.package.delete.useMutation({
    onSuccess: () => {
      void refetch();
      toast.success("Package deleted!");
    },
    onError: () => toast.error("Failed to delete package."),
  });

  const togglePublishMut = trpc.package.update.useMutation({
    onSuccess: () => {
      void refetch();
      toast.success("Publish status updated!");
    },
    onError: () => toast.error("Failed to update publish status."),
  });

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setDialogOpen(true);
  }

  function openEdit(pkg: (typeof packages)[number]) {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name,
      nameHe: pkg.nameHe,
      slug: pkg.slug,
      description: pkg.description ?? "",
      descriptionHe: pkg.descriptionHe ?? "",
      tourSlugs: pkg.tourSlugs,
      discountPercent: pkg.discountPercent ?? null,
      coverImage: pkg.coverImage ?? "",
      isPublished: pkg.isPublished === 1,
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slug = form.slug || generateSlug(form.name);

    if (form.tourSlugs.length < 2) {
      toast.error("Select at least 2 tours.");
      return;
    }

    const payload = {
      name: form.name,
      nameHe: form.nameHe,
      slug,
      description: form.description || undefined,
      descriptionHe: form.descriptionHe || undefined,
      tourSlugs: form.tourSlugs,
      discountPercent: form.discountPercent,
      coverImage: form.coverImage || undefined,
      isPublished: form.isPublished,
    };

    if (editingId) {
      updateMut.mutate({ id: editingId, data: payload });
    } else {
      createMut.mutate(payload);
    }
  }

  function toggleTourSlug(slug: string) {
    setForm(prev => ({
      ...prev,
      tourSlugs: prev.tourSlugs.includes(slug)
        ? prev.tourSlugs.filter(s => s !== slug)
        : prev.tourSlugs.length >= 5
          ? prev.tourSlugs
          : [...prev.tourSlugs, slug],
    }));
  }

  function moveTour(index: number, direction: -1 | 1) {
    const newSlugs = [...form.tourSlugs];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newSlugs.length) return;
    [newSlugs[index], newSlugs[newIndex]] = [
      newSlugs[newIndex],
      newSlugs[index],
    ];
    setForm(prev => ({ ...prev, tourSlugs: newSlugs }));
  }

  // Live price preview
  const selectedTours = tours.filter(t => form.tourSlugs.includes(t.slug));
  const totalPrice = selectedTours.reduce((sum, t) => sum + t.price, 0);
  const liveDiscount =
    selectedTours.length >= 2
      ? calculatePackageDiscount(
          selectedTours.length,
          totalPrice,
          form.discountPercent ?? undefined
        )
      : null;

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Tour Packages ({packages.length})</h2>
        <button
          onClick={openCreate}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          + New Package
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading packages...
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No packages yet. Create your first one!
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border rounded-lg p-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{pkg.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      pkg.isPublished === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {pkg.isPublished === 1 ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {pkg.tourSlugs.length} tours &middot;{" "}
                  {formatUSD(pkg.discountedPrice)} (
                  {pkg.discountPercent > 0
                    ? `-${pkg.discountPercent}%`
                    : "no discount"}
                  )
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    togglePublishMut.mutate({
                      id: pkg.id,
                      data: { isPublished: pkg.isPublished !== 1 },
                    })
                  }
                  className="text-xs px-3 py-1.5 rounded border hover:bg-muted transition-colors"
                >
                  {pkg.isPublished === 1 ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => openEdit(pkg)}
                  className="text-xs px-3 py-1.5 rounded border hover:bg-muted transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this package?"))
                      deleteMut.mutate({ id: pkg.id });
                  }}
                  className="text-xs px-3 py-1.5 rounded border text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Package" : "Create Package"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the package details below."
                : "Fill in the details to create a new tour package."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Name EN / HE */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Name (EN) *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="Weekend Adventure"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Name (HE) *
                </label>
                <input
                  required
                  value={form.nameHe}
                  onChange={e =>
                    setForm(f => ({ ...f, nameHe: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="הרפתקת סוף שבוע"
                />
              </div>
            </div>

            {/* Description EN / HE */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Description (EN)
                </label>
                <textarea
                  value={form.description}
                  onChange={e =>
                    setForm(f => ({ ...f, description: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Description (HE)
                </label>
                <textarea
                  value={form.descriptionHe}
                  onChange={e =>
                    setForm(f => ({ ...f, descriptionHe: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
            </div>

            {/* Tour Picker */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Tours (select 2-5) *
              </label>
              <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
                {tours.map(tour => {
                  const isSelected = form.tourSlugs.includes(tour.slug);
                  return (
                    <button
                      key={tour.slug}
                      type="button"
                      onClick={() => toggleTourSlug(tour.slug)}
                      className={`text-left text-sm px-3 py-2 rounded-md transition-colors ${
                        isSelected
                          ? "bg-primary/10 text-primary font-medium ring-1 ring-primary/30"
                          : form.tourSlugs.length >= 5
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-muted"
                      }`}
                    >
                      {tour.name} — {formatUSD(tour.price)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected tours order */}
            {form.tourSlugs.length > 0 && (
              <div>
                <label className="text-sm font-medium block mb-1">
                  Tour Order (drag to reorder)
                </label>
                <div className="space-y-1">
                  {form.tourSlugs.map((slug, idx) => {
                    const tour = tours.find(t => t.slug === slug);
                    return (
                      <div
                        key={slug}
                        className="flex items-center gap-2 text-sm bg-muted rounded px-3 py-1.5"
                      >
                        <span className="text-muted-foreground w-5 text-center">
                          {idx + 1}
                        </span>
                        <span className="flex-1 truncate">
                          {tour?.name ?? slug}
                        </span>
                        <button
                          type="button"
                          onClick={() => moveTour(idx, -1)}
                          disabled={idx === 0}
                          className="text-xs px-1 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTour(idx, 1)}
                          disabled={idx === form.tourSlugs.length - 1}
                          className="text-xs px-1 disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live Price Preview */}
            {liveDiscount && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                <div className="flex justify-between mb-1">
                  <span>Original</span>
                  <span className="line-through text-muted-foreground">
                    {formatUSD(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-green-700 font-medium">
                  <span>After {liveDiscount.discountPercent}% discount</span>
                  <span>{formatUSD(liveDiscount.discountedPrice)}</span>
                </div>
                <div className="flex justify-between text-green-600 text-xs mt-1">
                  <span>Savings</span>
                  <span>{formatUSD(liveDiscount.savings)}</span>
                </div>
              </div>
            )}

            {/* Discount Override + Cover Image */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Discount Override (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={form.discountPercent ?? ""}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      discountPercent: e.target.value
                        ? Number(e.target.value)
                        : null,
                    }))
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="Leave empty for auto"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Cover Image URL
                </label>
                <input
                  value={form.coverImage}
                  onChange={e =>
                    setForm(f => ({ ...f, coverImage: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Publish Toggle */}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={e =>
                  setForm(f => ({ ...f, isPublished: e.target.checked }))
                }
                className="rounded"
              />
              Publish immediately
            </label>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMut.isPending || updateMut.isPending}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50"
              >
                {createMut.isPending || updateMut.isPending
                  ? "Saving..."
                  : editingId
                    ? "Update Package"
                    : "Create Package"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

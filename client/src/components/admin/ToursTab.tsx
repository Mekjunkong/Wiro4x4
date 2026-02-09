import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { PAGE_SIZE } from "./types";
import { Pagination } from "./Pagination";
import { CardGridSkeleton } from "./AdminSkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Tour } from "../../../../drizzle/schema";

type TourDifficulty = "easy" | "moderate" | "challenging";

export function ToursTab() {
  const [toursPage, setToursPage] = useState(1);
  const [tourDialogOpen, setTourDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [tourForm, setTourForm] = useState({
    name: "",
    nameHe: "",
    description: "",
    descriptionHe: "",
    duration: "",
    difficulty: "moderate" as "easy" | "moderate" | "challenging",
    price: 0,
    groupMinSize: 1,
    groupMaxSize: 10,
    imageUrl: "",
    highlights: "",
    highlightsHe: "",
    isKosher: true,
    isPrivate: true,
    isShabbatOk: true,
    isActive: true,
    sortOrder: 0,
  });

  const resetTourForm = () => {
    setTourForm({
      name: "",
      nameHe: "",
      description: "",
      descriptionHe: "",
      duration: "",
      difficulty: "moderate",
      price: 0,
      groupMinSize: 1,
      groupMaxSize: 10,
      imageUrl: "",
      highlights: "",
      highlightsHe: "",
      isKosher: true,
      isPrivate: true,
      isShabbatOk: true,
      isActive: true,
      sortOrder: 0,
    });
    setEditingTour(null);
  };

  const {
    data: toursData,
    isLoading: toursLoading,
    refetch: refetchTours,
  } = trpc.tour.listAllPaginated.useQuery({
    page: toursPage,
    pageSize: PAGE_SIZE,
  });
  const allTours = toursData?.items;
  const toursTotal = toursData?.total ?? 0;
  const toursTotalPages = toursData?.totalPages ?? 1;

  const createTourMut = trpc.tour.create.useMutation({
    onSuccess: () => {
      refetchTours();
      setTourDialogOpen(false);
      resetTourForm();
      toast.success("Tour created!");
    },
    onError: error => {
      console.error("Failed to create tour:", error);
      toast.error("Failed to create tour.");
    },
  });
  const updateTourMut = trpc.tour.update.useMutation({
    onSuccess: () => {
      refetchTours();
      setTourDialogOpen(false);
      resetTourForm();
      toast.success("Tour updated!");
    },
    onError: error => {
      console.error("Failed to update tour:", error);
      toast.error("Failed to update tour.");
    },
  });
  const deleteTourMut = trpc.tour.delete.useMutation({
    onSuccess: () => {
      refetchTours();
      toast.success("Tour deleted!");
    },
    onError: error => {
      console.error("Failed to delete tour:", error);
      toast.error("Failed to delete tour.");
    },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Tour Management</h3>
        <button
          onClick={() => {
            resetTourForm();
            setTourDialogOpen(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Add Tour
        </button>
      </div>

      {toursLoading ? (
        <CardGridSkeleton />
      ) : !allTours?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          No tours yet. Add your first tour.
        </div>
      ) : (
        <div className="space-y-4">
          {allTours.map(tour => (
            <div
              key={tour.id}
              className="border border-border rounded-lg overflow-hidden"
            >
              <div className="p-3 md:p-4">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-16 h-14 md:w-20 md:h-16 rounded overflow-hidden shrink-0">
                    <img
                      src={tour.imageUrl}
                      alt={tour.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm md:text-base truncate">
                      {tour.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mt-1">
                      <span>{tour.duration}</span>
                      <span className="capitalize">{tour.difficulty}</span>
                      <span className="font-semibold text-primary">
                        &#3647;{tour.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {tour.isKosher === 1 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          Kosher
                        </span>
                      )}
                      {tour.isPrivate === 1 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          Private
                        </span>
                      )}
                      {tour.isShabbatOk === 1 && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                          Shabbat OK
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${tour.isActive === 1 ? "bg-green-100 text-green-800" : "bg-muted text-foreground"}`}
                      >
                        {tour.isActive === 1 ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                  <button
                    onClick={() =>
                      updateTourMut.mutate({
                        id: tour.id,
                        data: { isActive: tour.isActive !== 1 },
                      })
                    }
                    className="px-3 py-1.5 bg-yellow-100 text-yellow-600 rounded text-xs hover:bg-yellow-200 min-h-[36px]"
                  >
                    {tour.isActive === 1 ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingTour(tour);
                      setTourForm({
                        name: tour.name,
                        nameHe: tour.nameHe,
                        description: tour.description,
                        descriptionHe: tour.descriptionHe,
                        duration: tour.duration,
                        difficulty: tour.difficulty,
                        price: tour.price,
                        groupMinSize: tour.groupMinSize ?? 1,
                        groupMaxSize: tour.groupMaxSize ?? 10,
                        imageUrl: tour.imageUrl,
                        highlights: tour.highlights || "",
                        highlightsHe: tour.highlightsHe || "",
                        isKosher: tour.isKosher === 1,
                        isPrivate: tour.isPrivate === 1,
                        isShabbatOk: tour.isShabbatOk === 1,
                        isActive: tour.isActive === 1,
                        sortOrder: tour.sortOrder ?? 0,
                      });
                      setTourDialogOpen(true);
                    }}
                    className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200 min-h-[36px]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this tour?"))
                        deleteTourMut.mutate({ id: tour.id });
                    }}
                    className="px-3 py-1.5 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 min-h-[36px]"
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
        page={toursPage}
        totalPages={toursTotalPages}
        total={toursTotal}
        onPageChange={setToursPage}
      />

      {/* Tour Dialog */}
      <Dialog
        open={tourDialogOpen}
        onOpenChange={open => {
          if (!open) {
            setTourDialogOpen(false);
            resetTourForm();
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTour ? "Edit Tour" : "Add Tour"}</DialogTitle>
            <DialogDescription>
              Fill in the tour details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={tourForm.name}
                  onChange={e =>
                    setTourForm(p => ({ ...p, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name (Hebrew) *
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={tourForm.nameHe}
                  onChange={e =>
                    setTourForm(p => ({ ...p, nameHe: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description (English) *
              </label>
              <textarea
                value={tourForm.description}
                onChange={e =>
                  setTourForm(p => ({ ...p, description: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description (Hebrew) *
              </label>
              <textarea
                dir="rtl"
                value={tourForm.descriptionHe}
                onChange={e =>
                  setTourForm(p => ({ ...p, descriptionHe: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Duration *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6-8 hours"
                  value={tourForm.duration}
                  onChange={e =>
                    setTourForm(p => ({ ...p, duration: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Difficulty
                </label>
                <select
                  value={tourForm.difficulty}
                  onChange={e =>
                    setTourForm(p => ({
                      ...p,
                      difficulty: e.target.value as TourDifficulty,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (THB) *
                </label>
                <input
                  type="number"
                  value={tourForm.price}
                  onChange={e =>
                    setTourForm(p => ({
                      ...p,
                      price: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Min Group Size
                </label>
                <input
                  type="number"
                  value={tourForm.groupMinSize}
                  onChange={e =>
                    setTourForm(p => ({
                      ...p,
                      groupMinSize: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Max Group Size
                </label>
                <input
                  type="number"
                  value={tourForm.groupMaxSize}
                  onChange={e =>
                    setTourForm(p => ({
                      ...p,
                      groupMaxSize: parseInt(e.target.value) || 10,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Image URL *
              </label>
              <input
                type="text"
                value={tourForm.imageUrl}
                onChange={e =>
                  setTourForm(p => ({ ...p, imageUrl: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="/images/tour.jpg or https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Highlights (JSON array, English)
              </label>
              <textarea
                value={tourForm.highlights}
                onChange={e =>
                  setTourForm(p => ({ ...p, highlights: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                rows={2}
                placeholder='["Private 4x4 vehicle", "Kosher lunch", ...]'
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Highlights (JSON array, Hebrew)
              </label>
              <textarea
                dir="rtl"
                value={tourForm.highlightsHe}
                onChange={e =>
                  setTourForm(p => ({ ...p, highlightsHe: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                rows={2}
                placeholder='["&#1512;&#1499;&#1489; 4x4 &#1508;&#1512;&#1496;&#1497;", "&#1488;&#1512;&#1493;&#1495;&#1514; &#1510;&#1492;&#1512;&#1497;&#1497;&#1501; &#1499;&#1513;&#1512;&#1492;", ...]'
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={tourForm.sortOrder}
                  onChange={e =>
                    setTourForm(p => ({
                      ...p,
                      sortOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={tourForm.isKosher}
                  onChange={e =>
                    setTourForm(p => ({ ...p, isKosher: e.target.checked }))
                  }
                  className="w-4 h-4"
                />
                Kosher
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={tourForm.isPrivate}
                  onChange={e =>
                    setTourForm(p => ({ ...p, isPrivate: e.target.checked }))
                  }
                  className="w-4 h-4"
                />
                Private
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={tourForm.isShabbatOk}
                  onChange={e =>
                    setTourForm(p => ({ ...p, isShabbatOk: e.target.checked }))
                  }
                  className="w-4 h-4"
                />
                Shabbat OK
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={tourForm.isActive}
                  onChange={e =>
                    setTourForm(p => ({ ...p, isActive: e.target.checked }))
                  }
                  className="w-4 h-4"
                />
                Active
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setTourDialogOpen(false);
                resetTourForm();
              }}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const data = {
                  ...tourForm,
                  highlights: tourForm.highlights || undefined,
                  highlightsHe: tourForm.highlightsHe || undefined,
                };
                if (editingTour) {
                  updateTourMut.mutate({ id: editingTour.id, data });
                } else {
                  createTourMut.mutate(data);
                }
              }}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
            >
              {editingTour ? "Save Changes" : "Add Tour"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

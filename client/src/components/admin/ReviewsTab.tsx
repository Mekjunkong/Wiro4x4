import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Trash2, CheckCircle } from "lucide-react";
import { PAGE_SIZE } from "./types";
import { Pagination } from "./Pagination";

export function ReviewsTab() {
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewFilter, setReviewFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [respondingReview, setRespondingReview] = useState<number | null>(null);
  const [adminResponseText, setAdminResponseText] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    refetch: refetchReviews,
  } = trpc.review.listAllPaginated.useQuery({
    page: reviewsPage,
    pageSize: PAGE_SIZE,
  });
  const allReviews = reviewsData?.items;
  const reviewsTotal = reviewsData?.total ?? 0;
  const reviewsTotalPages = reviewsData?.totalPages ?? 1;

  const { data: reviewStats } = trpc.review.stats.useQuery();

  const updateReviewMut = trpc.review.update.useMutation({
    onSuccess: () => refetchReviews(),
  });
  const deleteReviewMut = trpc.review.delete.useMutation({
    onSuccess: () => refetchReviews(),
  });
  const bulkApproveMut = trpc.review.bulkApprove.useMutation({
    onSuccess: data => {
      refetchReviews();
      setSelectedIds(new Set());
      toast.success(`${data.approved} review(s) approved!`);
    },
    onError: () => toast.error("Failed to approve selected reviews."),
  });
  const bulkDeleteMut = trpc.review.bulkDelete.useMutation({
    onSuccess: data => {
      refetchReviews();
      setSelectedIds(new Set());
      toast.success(`${data.deleted} review(s) deleted!`);
    },
    onError: () => toast.error("Failed to delete selected reviews."),
  });

  const filteredReviews =
    allReviews?.filter(
      r => reviewFilter === "all" || r.status === reviewFilter
    ) || [];

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredReviews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredReviews.map(r => r.id)));
    }
  };

  const handleBulkApprove = () => {
    if (selectedIds.size === 0) return;
    bulkApproveMut.mutate({ ids: Array.from(selectedIds) });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Delete ${selectedIds.size} selected review(s)?`)) {
      bulkDeleteMut.mutate({ ids: Array.from(selectedIds) });
    }
  };

  return (
    <div className="p-6">
      {/* Stats */}
      {reviewStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">
              {reviewStats.totalReviews}
            </p>
            <p className="text-sm text-blue-600">Total</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">
              {reviewStats.averageRating}
            </p>
            <p className="text-sm text-yellow-600">Avg Rating</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-700">
              {reviewStats.approvedCount}
            </p>
            <p className="text-sm text-green-600">Approved</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-700">
              {reviewStats.totalReviews - reviewStats.approvedCount}
            </p>
            <p className="text-sm text-orange-600">Pending/Rejected</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "approved", "rejected"] as const).map(f => (
          <button
            key={f}
            onClick={() => setReviewFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${reviewFilter === f ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.size} selected
          </span>
          <button
            onClick={handleBulkApprove}
            disabled={bulkApproveMut.isPending}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
          >
            <CheckCircle className="w-3 h-3" />
            Approve Selected
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleteMut.isPending}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear Selection
          </button>
        </div>
      )}

      {reviewsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select all */}
          {filteredReviews.length > 0 && (
            <div className="flex items-center gap-2 px-1">
              <input
                type="checkbox"
                checked={
                  filteredReviews.length > 0 &&
                  selectedIds.size === filteredReviews.length
                }
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm text-muted-foreground">Select all</span>
            </div>
          )}

          {filteredReviews.map(review => (
            <div
              key={review.id}
              className="border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(review.id)}
                    onChange={() => toggleSelect(review.id)}
                    className="w-4 h-4 rounded border-border mt-1 shrink-0"
                  />
                  <div>
                    <h4 className="font-semibold">{review.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {review.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(s => (
                          <span
                            key={s}
                            className={
                              s <= review.rating
                                ? "text-yellow-400"
                                : "text-muted-foreground/50"
                            }
                          >
                            &#9733;
                          </span>
                        ))}
                      </div>
                      {review.tourType && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {review.tourType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${review.status === "approved" ? "bg-green-100 text-green-800" : review.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                  >
                    {review.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </div>
              <p className="text-sm text-foreground mb-3 ml-7">{review.text}</p>

              {review.adminResponse && (
                <div className="mb-3 ml-7 pl-3 border-l-4 border-primary bg-primary/5 rounded-r p-2">
                  <p className="text-xs font-semibold text-primary">
                    Admin Response:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {review.adminResponse}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 ml-7">
                {review.status !== "approved" && (
                  <button
                    onClick={() =>
                      updateReviewMut.mutate({
                        id: review.id,
                        data: { status: "approved" },
                      })
                    }
                    className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                  >
                    Approve
                  </button>
                )}
                {review.status !== "rejected" && (
                  <button
                    onClick={() =>
                      updateReviewMut.mutate({
                        id: review.id,
                        data: { status: "rejected" },
                      })
                    }
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => {
                    setRespondingReview(
                      respondingReview === review.id ? null : review.id
                    );
                    setAdminResponseText(review.adminResponse || "");
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                >
                  {respondingReview === review.id ? "Cancel" : "Respond"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this review?"))
                      deleteReviewMut.mutate({ id: review.id });
                  }}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                >
                  Delete
                </button>
              </div>

              {respondingReview === review.id && (
                <div className="mt-3 ml-7 flex gap-2">
                  <textarea
                    value={adminResponseText}
                    onChange={e => setAdminResponseText(e.target.value)}
                    placeholder="Write admin response..."
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm"
                    rows={2}
                  />
                  <button
                    onClick={() => {
                      updateReviewMut.mutate({
                        id: review.id,
                        data: { adminResponse: adminResponseText },
                      });
                      setRespondingReview(null);
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={reviewsPage}
        totalPages={reviewsTotalPages}
        total={reviewsTotal}
        onPageChange={setReviewsPage}
      />
    </div>
  );
}

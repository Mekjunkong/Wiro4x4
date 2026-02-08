import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Trash2, ArrowRightLeft } from 'lucide-react';
import { PAGE_SIZE } from './types';
import { Pagination } from './Pagination';

export function LeadsTab() {
  const [leadsPage, setLeadsPage] = useState(1);

  const { data: leadsData, isLoading: leadsLoading, refetch: refetchLeads } = trpc.lead.listPaginated.useQuery({ page: leadsPage, pageSize: PAGE_SIZE });
  const leads = leadsData?.items;
  const leadsTotal = leadsData?.total ?? 0;
  const leadsTotalPages = leadsData?.totalPages ?? 1;

  const updateLeadMut = trpc.lead.update.useMutation({
    onSuccess: () => {
      refetchLeads();
      toast.success('Lead updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update lead:', error);
      toast.error('Failed to update lead. Please try again.');
    },
  });
  const deleteLeadMut = trpc.lead.delete.useMutation({
    onSuccess: () => {
      refetchLeads();
      toast.success('Lead deleted successfully!');
    },
    onError: (error) => {
      console.error('Failed to delete lead:', error);
      toast.error('Failed to delete lead. Please try again.');
    },
  });

  const handleLeadStatusChange = (leadId: number, newStatus: string) => {
    updateLeadMut.mutate({ id: leadId, data: { status: newStatus as 'new' | 'contacted' | 'quoted' | 'converted' | 'lost' } });
  };

  const handleConvertLead = (leadId: number) => {
    updateLeadMut.mutate({ id: leadId, data: { status: 'converted' } });
  };

  return (
    <div className="p-6">
      {leadsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : leads?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No leads captured yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs md:text-sm">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs md:text-sm hidden sm:table-cell">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs md:text-sm hidden md:table-cell">Source</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs md:text-sm">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs md:text-sm hidden md:table-cell">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs md:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads?.map(lead => (
                <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{lead.name}</td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <p className="text-sm">{lead.email}</p>
                    {lead.phone && <p className="text-sm text-gray-500">{lead.phone}</p>}
                  </td>
                  <td className="py-3 px-4 text-sm hidden md:table-cell">{lead.source}</td>
                  <td className="py-3 px-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs md:text-sm min-h-[44px]"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="quoted">Quoted</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 hidden md:table-cell">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {lead.status !== 'converted' && (
                        <button
                          onClick={() => handleConvertLead(lead.id)}
                          className="px-2 md:px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors min-h-[36px] flex items-center gap-1"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span className="hidden sm:inline">Convert</span>
                        </button>
                      )}
                      <button
                        onClick={() => { if (confirm('Delete this lead?')) deleteLeadMut.mutate({ id: lead.id }); }}
                        className="px-2 py-1.5 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition-colors min-h-[36px] flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={leadsPage}
        totalPages={leadsTotalPages}
        total={leadsTotal}
        onPageChange={setLeadsPage}
      />
    </div>
  );
}

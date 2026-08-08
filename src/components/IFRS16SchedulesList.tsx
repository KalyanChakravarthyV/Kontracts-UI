import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/lease-dashboard/ui/table';
import { Button } from '@/components/lease-dashboard/ui/button';
import { Download, ChevronRight, Loader2 } from 'lucide-react';
import { useAuthToken } from '@/hooks/use-auth-token';
import { API_BASE_URL } from '@/config/api';

export function IFRS16SchedulesList() {
  const [page, setPage] = useState(1);
  const { getHeaders } = useAuthToken();
  const itemsPerPage = 10;
  const skip = (page - 1) * itemsPerPage;

  const { data: leases = [], isLoading } = useQuery({
    queryKey: [`${API_BASE_URL}/leases/`],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/leases/`, {
        headers: await getHeaders(),
      });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
  });

  const paginatedLeases = leases.slice(skip, skip + itemsPerPage);
  const totalPages = Math.ceil(leases.length / itemsPerPage);

  const handleExport = async (leaseId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/schedules/ifrs16/${leaseId}?format=excel`,
        {
          headers: await getHeaders(),
          method: 'GET',
        }
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `IFRS16_Schedule_${leaseId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting schedule:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin mr-2" />
        <p className="text-muted-foreground">Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>IFRS 16 Compliance Schedules</CardTitle>
          <CardDescription>
            View and manage IFRS 16 lease schedules for international accounting standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lease Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLeases && paginatedLeases.length > 0 ? (
                  paginatedLeases.map((lease: any) => (
                    <TableRow key={lease.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{lease.lease_name}</TableCell>
                      <TableCell>
                        <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {lease.region || 'International'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lease.status?.toLowerCase() === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lease.status || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExport(lease.id)}
                          >
                            <Download size={16} className="mr-1" />
                            Export
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <ChevronRight size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No leases found. Create a lease to generate IFRS 16 schedules.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {leases.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {skip + 1} to {Math.min(skip + itemsPerPage, leases.length)} of {leases.length} schedules
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

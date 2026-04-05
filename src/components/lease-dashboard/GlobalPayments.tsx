import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/lease-dashboard/ui/table';
import { Button } from '@/components/lease-dashboard/ui/button';
import { DollarSign, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useAuthToken } from '@/hooks/use-auth-token';
import { API_BASE_URL } from '@/config/api';

const PAGE_SIZE = 50;

const STATUS_CLASSES: Record<string, string> = {
  Paid: 'bg-green-100 text-green-800',
  Scheduled: 'bg-blue-100 text-blue-800',
  Due: 'bg-red-100 text-red-800',
  Overdue: 'bg-red-200 text-red-900',
};

type SortField = 'lease_id' | 'payment_type_id' | 'due_date' | 'amount' | 'status';
type SortOrder = 'asc' | 'desc';
type GroupField = SortField | null;

interface GlobalPaymentsProps {
  totalCount?: number;
  contracts?: Array<{ id: string | number; lease_name: string }>;
}

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: SortOrder }) {
  if (field !== sortBy) return <ChevronsUpDown className="size-3 ml-1 opacity-40" />;
  return sortOrder === 'asc'
    ? <ChevronUp className="size-3 ml-1" />
    : <ChevronDown className="size-3 ml-1" />;
}

const GROUP_OPTIONS: { value: GroupField; label: string }[] = [
  { value: null, label: 'None' },
  { value: 'lease_id', label: 'Contract' },
  { value: 'status', label: 'Status' },
  { value: 'payment_type_id', label: 'Payment Type' },
];

export function GlobalPayments({ totalCount, contracts = [] }: GlobalPaymentsProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>('lease_id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [groupBy, setGroupBy] = useState<GroupField>(null);
  const { getToken } = useAuthToken();

  const skip = (page - 1) * PAGE_SIZE;
  const totalPages = totalCount ? Math.ceil(totalCount / PAGE_SIZE) : 1;

  const { data: payments = [], isLoading } = useQuery<any[]>({
    queryKey: [`${API_BASE_URL}/payments/`, page, sortBy, sortOrder],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(
        `${API_BASE_URL}/payments/?skip=${skip}&limit=${PAGE_SIZE}&sort_by=${sortBy}&sort_order=${sortOrder}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
  });

  const contractName = (leaseId: string | number) => {
    const contractsList = Array.isArray(contracts) ? contracts : [];
    const match = contractsList.find((c) => String(c.id) === String(leaseId));
    return match?.lease_name ?? `Lease ${leaseId}`;
  };

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num || 0);
  };

  const handleSort = (field: SortField) => {
    if (field === sortBy) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const getGroupKey = (payment: any): string => {
    if (!groupBy) return '';
    if (groupBy === 'lease_id') return contractName(payment.lease_id);
    return String(payment[groupBy] ?? '—');
  };

  // Group payments into ordered sections
  const grouped: { key: string; rows: any[] }[] = [];
  if (groupBy) {
    const map = new Map<string, any[]>();
    for (const p of payments) {
      const key = getGroupKey(p);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    map.forEach((rows, key) => grouped.push({ key, rows }));
    grouped.sort((a, b) => a.key.localeCompare(b.key));
  }

  const thClass = 'cursor-pointer select-none hover:text-foreground';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payments</CardTitle>
            <CardDescription>All payments across leases</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Group by</span>
            <select
              value={groupBy ?? ''}
              onChange={(e) => setGroupBy((e.target.value || null) as GroupField)}
              className="text-sm border border-border rounded-md px-2 py-1 bg-background"
            >
              {GROUP_OPTIONS.map((o) => (
                <option key={String(o.value)} value={o.value ?? ''}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <DollarSign className="size-10 mx-auto mb-3 opacity-30" />
            <p>No payments found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={thClass} onClick={() => handleSort('lease_id')}>
                      <span className="flex items-center">Contract <SortIcon field="lease_id" sortBy={sortBy} sortOrder={sortOrder} /></span>
                    </TableHead>
                    <TableHead className={thClass} onClick={() => handleSort('payment_type_id')}>
                      <span className="flex items-center">Payment Type <SortIcon field="payment_type_id" sortBy={sortBy} sortOrder={sortOrder} /></span>
                    </TableHead>
                    <TableHead className={thClass} onClick={() => handleSort('due_date')}>
                      <span className="flex items-center">Due Date <SortIcon field="due_date" sortBy={sortBy} sortOrder={sortOrder} /></span>
                    </TableHead>
                    <TableHead className={`${thClass} text-right`} onClick={() => handleSort('amount')}>
                      <span className="flex items-center justify-end">Amount <SortIcon field="amount" sortBy={sortBy} sortOrder={sortOrder} /></span>
                    </TableHead>
                    <TableHead className={thClass} onClick={() => handleSort('status')}>
                      <span className="flex items-center">Status <SortIcon field="status" sortBy={sortBy} sortOrder={sortOrder} /></span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupBy ? (
                    grouped.map(({ key, rows }) => (
                      <>
                        <TableRow key={`group-${key}`} className="bg-muted/40">
                          <TableCell colSpan={5} className="py-2 px-4 text-sm font-semibold text-muted-foreground">
                            {key} <span className="font-normal">({rows.length})</span>
                          </TableCell>
                        </TableRow>
                        {rows.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium whitespace-nowrap">{contractName(payment.lease_id)}</TableCell>
                            <TableCell className="text-muted-foreground">{payment.payment_type_id || '—'}</TableCell>
                            <TableCell className="whitespace-nowrap">{payment.due_date ? new Date(payment.due_date).toLocaleDateString() : '—'}</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CLASSES[payment.status] ?? 'bg-gray-100 text-gray-800'}`}>
                                {payment.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ))
                  ) : (
                    payments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium whitespace-nowrap">{contractName(payment.lease_id)}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.payment_type_id || '—'}</TableCell>
                        <TableCell className="whitespace-nowrap">{payment.due_date ? new Date(payment.due_date).toLocaleDateString() : '—'}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CLASSES[payment.status] ?? 'bg-gray-100 text-gray-800'}`}>
                            {payment.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {totalCount != null
                  ? `Showing ${skip + 1}–${Math.min(skip + PAGE_SIZE, totalCount)} of ${totalCount.toLocaleString()} payments`
                  : `Page ${page}`}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="size-4" />Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page}{totalPages > 1 ? ` of ${totalPages}` : ''}
                </span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={payments.length < PAGE_SIZE || page >= totalPages}>
                  Next<ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

import { useState, useEffect, Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/lease-dashboard/ui/table';
import { Button } from '@/components/lease-dashboard/ui/button';
import { DollarSign, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config/api';
import { ChevronDown as ChevronDownIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PaymentDetail } from '@/components/PaymentDetail';
import LeaseModal from '@/components/LeaseModal';
import LeaseDetails from '@/components/LeaseDetails';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearExistingLease, setExistingLease } from '@/store/slices/existingLeaseSlice';
import axios from 'axios';

const PAGE_SIZE = 500;

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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [paymentTypeMap, setPaymentTypeMap] = useState<Record<string, string>>({});
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showPaymentDetail, setShowPaymentDetail] = useState(false);
  const [openLeaseModal, setOpenLeaseModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [isLoadingContract, setIsLoadingContract] = useState(false);
  const { getHeaders } = useAuthToken();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { createdLeaseId } = useAppSelector((state) => state.newLease);

  const skip = (page - 1) * PAGE_SIZE;
  const totalPages = totalCount ? Math.ceil(totalCount / PAGE_SIZE) : 1;

  // Fetch payment type options on mount
  const { data: paymentTypeOptions = [] } = useQuery<any[]>({
    queryKey: [`${API_BASE_URL}/payments/dropdown-options`],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/payments/dropdown-options`, {
        headers: await getHeaders(),
      });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      const data = await res.json();
      return data.payment_types || [];
    },
  });

  // Create a mapping of payment_type_id to name
  useEffect(() => {
    if (paymentTypeOptions && paymentTypeOptions.length > 0) {
      const map = paymentTypeOptions.reduce((acc: Record<string, string>, option: any) => {
        acc[option.id] = option.name;
        return acc;
      }, {});
      setPaymentTypeMap(map);
    }
  }, [paymentTypeOptions]);

  const { data: payments = [], isLoading } = useQuery<any[]>({
    queryKey: [`${API_BASE_URL}/payments/`, page, sortBy, sortOrder],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE_URL}/payments/?skip=${skip}&limit=${PAGE_SIZE}&sort_by=${sortBy}&sort_order=${sortOrder}`,
        { headers: await getHeaders() }
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

  const handlePaymentClick = (payment: any) => {
    setSelectedPayment(payment);
    setShowPaymentDetail(true);
  };

  const handleViewContract = async (contractId: string) => {
    try {
      setIsLoadingContract(true);
      dispatch(clearExistingLease());
      setSelectedContractId(contractId);
      setShowPaymentDetail(false);

      // Fetch the lease details before opening the modal
      const response = await axios.get(`${API_BASE_URL}/leases/${contractId}`, {
        headers: await getHeaders(),
      });

      if (response?.data) {
        // Dispatch the lease data to Redux so it's available in LeaseDetails
        dispatch(setExistingLease(response.data));

        // Only open modal after data is fully loaded
        setOpenLeaseModal(true);
      }
    } catch (error) {
      console.error('Error fetching contract details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contract details',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingContract(false);
    }
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

  const toggleGroup = (key: string) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedGroups(newSet);
  };

  const toggleAllGroups = (show: boolean) => {
    if (show) {
      setExpandedGroups(new Set(grouped.map(g => g.key)));
    } else {
      setExpandedGroups(new Set());
    }
  };

  const getGroupKey = (payment: any): string => {
    if (!groupBy) return '';
    if (groupBy === 'lease_id') return contractName(payment.lease_id);
    if (groupBy === 'payment_type_id') return paymentTypeMap[payment.payment_type_id] || payment.payment_type_id || '—';
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
          <div className="flex items-center gap-3">
            {groupBy && grouped.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllGroups(true)}
                >
                  <ChevronDownIcon className="size-4 mr-1.5" />
                  Expand All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllGroups(false)}
                >
                  <ChevronRightIcon className="size-4 mr-1.5" />
                  Collapse All
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Group by</span>
              <select
                value={groupBy ?? ''}
                onChange={(e) => {
                  setGroupBy((e.target.value || null) as GroupField);
                  setExpandedGroups(new Set());
                }}
                className="text-sm border border-border rounded-md px-2 py-1 bg-background"
              >
                {GROUP_OPTIONS.map((o) => (
                  <option key={String(o.value)} value={o.value ?? ''}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-primary font-medium text-lg">Counting the coins...</p>
            <p className="text-muted-foreground text-sm mt-1">Retrieving payment records</p>
          </div>
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
                    grouped.map(({ key, rows }) => {
                      const isExpanded = expandedGroups.has(key);
                      return (
                        <Fragment key={`group-${key}`}>
                          <TableRow
                            className="bg-muted/40 hover:bg-muted/60 cursor-pointer"
                            onClick={() => toggleGroup(key)}
                          >
                            <TableCell colSpan={5} className="py-2 px-4">
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronDownIcon className="size-4" />
                                ) : (
                                  <ChevronRightIcon className="size-4" />
                                )}
                                <span className="text-sm font-semibold text-foreground">{key}</span>
                                <span className="text-xs font-normal text-muted-foreground">({rows.length})</span>
                              </div>
                            </TableCell>
                          </TableRow>
                          {isExpanded && rows.map((payment) => (
                            <TableRow
                              key={payment.id}
                              onClick={() => handlePaymentClick(payment)}
                              className="cursor-pointer hover:bg-muted/80 transition-colors"
                            >
                              <TableCell className="font-medium whitespace-nowrap">{contractName(payment.lease_id)}</TableCell>
                              <TableCell className="text-muted-foreground">{paymentTypeMap[payment.payment_type_id] || payment.payment_type_id || '—'}</TableCell>
                              <TableCell className="whitespace-nowrap">{payment.due_date ? new Date(payment.due_date).toLocaleDateString() : '—'}</TableCell>
                              <TableCell className="text-right font-mono">{formatCurrency(payment.amount)}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CLASSES[payment.status] ?? 'bg-gray-100 text-gray-800'}`}>
                                  {payment.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </Fragment>
                      );
                    })
                  ) : (
                    payments.map((payment: any) => (
                      <TableRow
                        key={payment.id}
                        onClick={() => handlePaymentClick(payment)}
                        className="cursor-pointer hover:bg-muted/80 transition-colors"
                      >
                        <TableCell className="font-medium whitespace-nowrap">{contractName(payment.lease_id)}</TableCell>
                        <TableCell className="text-muted-foreground">{paymentTypeMap[payment.payment_type_id] || payment.payment_type_id || '—'}</TableCell>
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
                  <ChevronLeft className="size-4 mr-1" />Previous
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  Page {page}{totalPages > 1 ? ` of ${totalPages}` : ''}
                </span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={payments.length < PAGE_SIZE || page >= totalPages}>
                  Next<ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Payment Detail Modal */}
      <Dialog open={showPaymentDetail} onOpenChange={setShowPaymentDetail}>
        <DialogContent
          className="!fixed !inset-4 !w-auto !max-w-none !translate-x-0 !translate-y-0 !max-h-none !h-auto !rounded-lg !gap-0 !p-0 overflow-hidden"
          style={{
            left: '2rem',
            right: '2rem',
            top: '2rem',
            bottom: '2rem',
            transform: 'none',
          }}
        >
          <div className="h-full w-full overflow-y-auto p-6">
            {selectedPayment && (
              <PaymentDetail
                paymentId={selectedPayment.id}
                contractId={selectedPayment.lease_id}
                contractName={contractName(selectedPayment.lease_id)}
                onClose={() => setShowPaymentDetail(false)}
                onViewContract={handleViewContract}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading Dialog */}
      <Dialog open={isLoadingContract}>
        <DialogContent
          className="!fixed !inset-4 !w-auto !max-w-none !translate-x-0 !translate-y-0 !max-h-none !h-auto !rounded-lg !gap-0 !p-0 overflow-hidden flex items-center justify-center"
          style={{
            left: '2rem',
            right: '2rem',
            top: '2rem',
            bottom: '2rem',
            transform: 'none',
          }}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="text-primary animate-spin" size={48} />
            <p className="text-lg font-medium text-foreground">Loading contract details...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lease/Contract Details Modal */}
      {openLeaseModal && (
        <LeaseModal
          open={openLeaseModal}
          onOpenChange={setOpenLeaseModal}
        >
          <LeaseDetails contractId={parseInt(selectedContractId) || 0} />
        </LeaseModal>
      )}
    </Card>
  );
}

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/lease-dashboard/ui/table';
import { Badge } from '@/components/lease-dashboard/ui/badge';
import { Button } from '@/components/lease-dashboard/ui/button';
import { FileText, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useAuthToken } from '@/hooks/use-auth-token';
import { API_BASE_URL } from '@/config/api';
import type { JournalEntryResponse, JournalEntryType, LeaseAccount } from './JournalEntries';

const PAGE_SIZE = 50;

const ACCOUNT_LABELS: Record<LeaseAccount, string> = {
  rou_asset: 'ROU Asset',
  lease_liability: 'Lease Liability',
  cash: 'Cash',
  lease_expense: 'Lease Expense',
};

const ENTRY_TYPE_CONFIG: Record<JournalEntryType, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  commencement: { label: 'Commencement', variant: 'default' },
  payment: { label: 'Payment', variant: 'secondary' },
  amortization: { label: 'Amortization', variant: 'outline' },
};

type SortField = 'lease_id' | 'entry_date' | 'entry_type' | 'debit_account' | 'credit_account' | 'amount';
type SortOrder = 'asc' | 'desc';
type GroupField = 'lease_id' | 'entry_type' | 'debit_account' | 'credit_account' | null;

interface GlobalJournalEntriesProps {
  totalCount?: number;
  currency?: string;
  contracts?: Array<{ id: string | number; lease_name: string }>;
  onRowClick?: (leaseId: string) => void;
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
  { value: 'entry_type', label: 'Entry Type' },
  { value: 'debit_account', label: 'Debit Account' },
  { value: 'credit_account', label: 'Credit Account' },
];

const YEAR_OPTIONS = [
  { value: '', label: 'All Years' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
  { value: '2028', label: '2028' },
];

export function GlobalJournalEntries({ totalCount, currency = 'USD', contracts = [], onRowClick }: GlobalJournalEntriesProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>('lease_id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [groupBy, setGroupBy] = useState<GroupField>(null);
  const [yearFilter, setYearFilter] = useState<string>('');
  const { getToken } = useAuthToken();

  const skip = (page - 1) * PAGE_SIZE;
  const totalPages = totalCount ? Math.ceil(totalCount / PAGE_SIZE) : 1;

  const { data: entries = [], isLoading } = useQuery<JournalEntryResponse[]>({
    queryKey: [`${API_BASE_URL}/journal-entries/`, page],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(
        `${API_BASE_URL}/journal-entries/?skip=${skip}&limit=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
  });

  const contractName = (leaseId: number) => {
    const contractsList = Array.isArray(contracts) ? contracts : [];
    const match = contractsList.find((c) => String(c.id) === String(leaseId));
    return match?.lease_name ?? `Lease ${leaseId}`;
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(num || 0);
  };

  const handleSort = (field: SortField) => {
    if (field === sortBy) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortValue = (entry: JournalEntryResponse, field: SortField): string | number => {
    switch (field) {
      case 'lease_id': return contractName(entry.lease_id).toLowerCase();
      case 'entry_date': return entry.entry_date ?? '';
      case 'entry_type': return ENTRY_TYPE_CONFIG[entry.entry_type]?.label ?? entry.entry_type;
      case 'debit_account': return ACCOUNT_LABELS[entry.debit_account] ?? entry.debit_account;
      case 'credit_account': return ACCOUNT_LABELS[entry.credit_account] ?? entry.credit_account;
      case 'amount': return typeof entry.amount === 'string' ? parseFloat(entry.amount) : entry.amount;
      default: return '';
    }
  };

  const filteredEntries = useMemo(() => {
    if (!yearFilter) return entries;
    return entries.filter((entry) => {
      const entryYear = entry.entry_date?.substring(0, 4);
      return entryYear === yearFilter;
    });
  }, [entries, yearFilter]);

  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      const va = getSortValue(a, sortBy);
      const vb = getSortValue(b, sortBy);
      let cmp = 0;
      if (typeof va === 'number' && typeof vb === 'number') {
        cmp = va - vb;
      } else {
        cmp = String(va).localeCompare(String(vb));
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [filteredEntries, sortBy, sortOrder]);

  const getGroupKey = (entry: JournalEntryResponse): string => {
    if (!groupBy) return '';
    if (groupBy === 'lease_id') return contractName(entry.lease_id);
    if (groupBy === 'entry_type') return ENTRY_TYPE_CONFIG[entry.entry_type]?.label ?? entry.entry_type;
    if (groupBy === 'debit_account') return ACCOUNT_LABELS[entry.debit_account] ?? entry.debit_account;
    if (groupBy === 'credit_account') return ACCOUNT_LABELS[entry.credit_account] ?? entry.credit_account;
    return '';
  };

  const grouped: { key: string; rows: JournalEntryResponse[] }[] = [];
  if (groupBy) {
    const map = new Map<string, JournalEntryResponse[]>();
    for (const e of sortedEntries) {
      const key = getGroupKey(e);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
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
            <CardTitle>Entries</CardTitle>
            <CardDescription>All journal entries across leases</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Year</span>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="text-sm border border-border rounded-md px-2 py-1 bg-background"
              >
                {YEAR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
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
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading entries...</div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <FileText className="size-10 mx-auto mb-3 opacity-30" />
            <p>No journal entries found.</p>
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
                    <TableHead className={thClass} onClick={() => handleSort('entry_date')}>
                      <span className="flex items-center">Date <SortIcon field="entry_date" sortBy={sortBy} sortOrder={sortOrder} /></span>
                    </TableHead>
                    <TableHead className={thClass} onClick={() => handleSort('entry_type')}>
                      <span className="flex items-center">Type <SortIcon field="entry_type" sortBy={sortBy} sortOrder={sortOrder} /></span>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className={thClass} onClick={() => handleSort('debit_account')}>
                      <span className="flex items-center">Debit Account <SortIcon field="debit_account" sortBy={sortBy} sortOrder={sortOrder} /></span>
                    </TableHead>
                    <TableHead className={thClass} onClick={() => handleSort('credit_account')}>
                      <span className="flex items-center">Credit Account <SortIcon field="credit_account" sortBy={sortBy} sortOrder={sortOrder} /></span>
                    </TableHead>
                    <TableHead className={`${thClass} text-right`} onClick={() => handleSort('amount')}>
                      <span className="flex items-center justify-end">Amount <SortIcon field="amount" sortBy={sortBy} sortOrder={sortOrder} /></span>
                    </TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupBy ? (
                    grouped.map(({ key, rows }) => (
                      <>
                        <TableRow key={`group-${key}`} className="bg-muted/40">
                          <TableCell colSpan={8} className="py-2 px-4 text-sm font-semibold text-muted-foreground">
                            {key} <span className="font-normal">({rows.length})</span>
                          </TableCell>
                        </TableRow>
                        {rows.map((entry) => (
                          <TableRow 
                            key={entry.id} 
                            className="cursor-pointer hover:bg-blue-50 transition-colors duration-150"
                            onClick={() => onRowClick?.(String(entry.lease_id))}
                          >
                            <TableCell className="font-medium whitespace-nowrap text-blue-600 hover:underline">{contractName(entry.lease_id)}</TableCell>
                            <TableCell className="whitespace-nowrap">{new Date(entry.entry_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={ENTRY_TYPE_CONFIG[entry.entry_type]?.variant ?? 'outline'}>
                                {ENTRY_TYPE_CONFIG[entry.entry_type]?.label ?? entry.entry_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{ACCOUNT_LABELS[entry.debit_account] ?? entry.debit_account}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{ACCOUNT_LABELS[entry.credit_account] ?? entry.credit_account}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(entry.amount)}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{entry.reference ?? '—'}</TableCell>
                          </TableRow>
                        ))}
                      </>
                    ))
                  ) : (
                    sortedEntries.map((entry) => (
                      <TableRow 
                        key={entry.id} 
                        className="cursor-pointer hover:bg-blue-50 transition-colors duration-150"
                        onClick={() => onRowClick?.(String(entry.lease_id))}
                      >
                        <TableCell className="font-medium whitespace-nowrap text-blue-600 hover:underline">{contractName(entry.lease_id)}</TableCell>
                        <TableCell className="whitespace-nowrap">{new Date(entry.entry_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={ENTRY_TYPE_CONFIG[entry.entry_type]?.variant ?? 'outline'}>
                            {ENTRY_TYPE_CONFIG[entry.entry_type]?.label ?? entry.entry_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ACCOUNT_LABELS[entry.debit_account] ?? entry.debit_account}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ACCOUNT_LABELS[entry.credit_account] ?? entry.credit_account}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(entry.amount)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{entry.reference ?? '—'}</TableCell>
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
                  ? `Showing ${skip + 1}–${Math.min(skip + PAGE_SIZE, totalCount)} of ${totalCount.toLocaleString()} entries`
                  : `Page ${page}`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page}{totalPages > 1 ? ` of ${totalPages}` : ''}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={entries.length < PAGE_SIZE || page >= totalPages}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

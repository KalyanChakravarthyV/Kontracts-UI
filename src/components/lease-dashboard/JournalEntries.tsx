import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/lease-dashboard/ui/table';
import { Badge } from '@/components/lease-dashboard/ui/badge';
import { Button } from '@/components/lease-dashboard/ui/button';
import { FileText, TrendingUp, DollarSign, Loader2 } from 'lucide-react';

export type JournalEntryType = 'commencement' | 'payment' | 'amortization';
export type LeaseAccount = 'rou_asset' | 'lease_liability' | 'cash' | 'lease_expense';

export interface JournalEntryResponse {
  id: string;
  lease_id: number;
  entry_date: string;
  entry_type: JournalEntryType;
  description: string;
  debit_account: LeaseAccount;
  credit_account: LeaseAccount;
  amount: string;
  reference?: string | null;
  created_at: string | null;
}

interface JournalEntriesProps {
  entries: JournalEntryResponse[];
  currency?: string;
  isGenerating?: boolean;
  hasLeaseId?: boolean;
  handleGenerateOrRegenerate?: (param: string) => void;
}

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

export function JournalEntries({
  entries,
  currency = 'USD',
  isGenerating = false,
  hasLeaseId = false,
  handleGenerateOrRegenerate,
}: JournalEntriesProps) {
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(num || 0);
  };

  const getTotalAmount = () =>
    entries.reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);

  const getCountByType = (type: JournalEntryType) =>
    entries.filter((e) => e.entry_type === type).length;

  const getGenerateStateName = () => (entries.length > 0 ? 'Regenerate' : 'Generate');

  return (
    <div className="space-y-6">
      {/* Header with Generate button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Journal Entries</h2>
          <p className="text-sm text-muted-foreground">Automated accounting entries for this lease</p>
        </div>
        <Button
          onClick={() => handleGenerateOrRegenerate?.(getGenerateStateName())}
          disabled={isGenerating || !hasLeaseId}
          className="gap-2"
        >
          {isGenerating
            ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
            : getGenerateStateName()
          }
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Entries</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{entries.length}</div>
            <p className="text-xs text-muted-foreground">
              {getCountByType('commencement')} commencement · {getCountByType('payment')} payment · {getCountByType('amortization')} amortization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Amount</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(getTotalAmount())}</div>
            <p className="text-xs text-muted-foreground">Sum of all entry amounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Entry Types</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 flex-wrap pt-1">
              {(['commencement', 'payment', 'amortization'] as JournalEntryType[]).map((type) => (
                getCountByType(type) > 0 && (
                  <Badge key={type} variant={ENTRY_TYPE_CONFIG[type].variant}>
                    {ENTRY_TYPE_CONFIG[type].label} ({getCountByType(type)})
                  </Badge>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entries Table */}
      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="size-10 mx-auto mb-3 opacity-30" />
            <p>No journal entries yet. Click <strong>Generate</strong> to create them from the lease schedule.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Entries</CardTitle>
            <CardDescription>All journal entries for this lease</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Debit Account</TableHead>
                    <TableHead>Credit Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </TableCell>
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
                      <TableCell className="text-right font-mono">
                        {formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {entry.reference ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

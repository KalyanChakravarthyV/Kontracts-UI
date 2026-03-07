import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/lease-dashboard/ui/table';
import { Badge } from '@/components/lease-dashboard/ui/badge';
import { Separator } from '@/components/lease-dashboard/ui/separator';
import { FileText, TrendingUp, Calendar } from 'lucide-react';

export interface JournalEntry {
  entryId: string;
  date: string;
  period: number;
  description: string;
  entryType: 'initial-recognition' | 'periodic-payment' | 'interest-expense' | 'amortization' | 'depreciation' | 'modification' | 'termination';
  lineItems: JournalEntryLine[];
  reference?: string;
}

export interface JournalEntryLine {
  account: string;
  accountCode: string;
  accountType: 'asset' | 'liability' | 'expense' | 'cash';
  debit: number;
  credit: number;
}

interface JournalEntriesProps {
  entries: JournalEntry[];
  currency?: string;
}

export function JournalEntries({ entries, currency = 'USD' }: JournalEntriesProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getEntryTypeBadge = (type: JournalEntry['entryType']) => {
    const config = {
      'initial-recognition': { label: 'Initial Recognition', variant: 'default' as const },
      'periodic-payment': { label: 'Payment', variant: 'secondary' as const },
      'interest-expense': { label: 'Interest', variant: 'outline' as const },
      'amortization': { label: 'Amortization', variant: 'outline' as const },
      'depreciation': { label: 'Depreciation', variant: 'outline' as const },
      'modification': { label: 'Modification', variant: 'default' as const },
      'termination': { label: 'Termination', variant: 'destructive' as const },
    };

    const { label, variant } = config[type];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTotalDebits = () => {
    return entries.reduce((sum, entry) => 
      sum + entry.lineItems.reduce((lineSum, line) => lineSum + line.debit, 0), 0
    );
  };

  const getTotalCredits = () => {
    return entries.reduce((sum, entry) => 
      sum + entry.lineItems.reduce((lineSum, line) => lineSum + line.credit, 0), 0
    );
  };

  const isBalanced = () => {
    return Math.abs(getTotalDebits() - getTotalCredits()) < 0.01;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Entries</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{entries.length}</div>
            <p className="text-xs text-muted-foreground">Journal entries recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Debits</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(getTotalDebits())}</div>
            <p className="text-xs text-muted-foreground">Sum of all debits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Credits</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(getTotalCredits())}</div>
            <p className="text-xs text-muted-foreground">Sum of all credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Balance Check */}
      {!isBalanced() && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-sm text-red-900">
              <strong>Warning:</strong> Journal entries are not balanced. 
              Difference: {formatCurrency(Math.abs(getTotalDebits() - getTotalCredits()))}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Journal Entries List */}
      <div className="space-y-6">
        {entries.map((entry) => {
          const totalDebit = entry.lineItems.reduce((sum, line) => sum + line.debit, 0);
          const totalCredit = entry.lineItems.reduce((sum, line) => sum + line.credit, 0);
          const entryBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

          return (
            <Card key={entry.entryId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Entry #{entry.entryId}</CardTitle>
                      {getEntryTypeBadge(entry.entryType)}
                      {!entryBalanced && (
                        <Badge variant="destructive">Unbalanced</Badge>
                      )}
                    </div>
                    <CardDescription>
                      Period {entry.period} - {new Date(entry.date).toLocaleDateString()} - {entry.description}
                      {entry.reference && ` (Ref: ${entry.reference})`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Account Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entry.lineItems.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>{line.account}</TableCell>
                        <TableCell className="font-mono text-sm">{line.accountCode}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{line.accountType}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={3} className="text-right">
                        <strong>Total</strong>
                      </TableCell>
                      <TableCell className="text-right">
                        <strong>{formatCurrency(totalDebit)}</strong>
                      </TableCell>
                      <TableCell className="text-right">
                        <strong>{formatCurrency(totalCredit)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Accounting Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Accounting Summary</CardTitle>
          <CardDescription>Overview of journal entry activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Debits</p>
              <p className="text-xl">{formatCurrency(getTotalDebits())}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <p className="text-xl">{formatCurrency(getTotalCredits())}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <p className="text-sm text-muted-foreground">Balanced Status</p>
            <p className="text-xl">
              {isBalanced() ? (
                <span className="text-green-600">✓ All entries balanced</span>
              ) : (
                <span className="text-red-600">✗ Entries not balanced</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

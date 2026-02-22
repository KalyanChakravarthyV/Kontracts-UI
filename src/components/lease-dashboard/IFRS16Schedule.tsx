import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/lease-dashboard/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/lease-dashboard/ui/tabs';
import { Badge } from '@/components/lease-dashboard/ui/badge';
import { Button } from '@/components/lease-dashboard/ui/button';
import { Download } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

export interface IFRS16ScheduleEntry {
  period: number;
  period_date: string;
  lease_payment: number;
  interest_expense: number;
  principal_reduction: number;
  lease_liability_beginning: number;
  lease_liability_ending: number;
  rou_asset_beginning: number;
  amortization: number;
  rou_asset_ending: number;
  total_expense: number;
}

export interface IFRS16ScheduleData {
  id?: number;
  lease_id?: number;
  initial_rou_asset: string;
  initial_lease_liability: string;
  total_payments: string;
  total_interest: string;
  total_depreciation: string;
  schedule_data: {
    entries: IFRS16ScheduleEntry[];
  };
}

export interface IFRS16ScheduleItem {
  period: number;
  date: string;
  leasePayment: number;
  interestExpense: number;
  depreciationExpense: number;
  rouAssetBalance: number;
  leaseLiabilityBalance: number;
  totalExpense: number;
}

interface IFRS16ScheduleProps {
  schedule: IFRS16ScheduleData;
  existingLease?: any;
  currency?: string;
  onExport?: () => void;
  handleGenerateOrRegenerate?: (param: string) => void;
}

export function IFRS16Schedule({ 
  schedule, 
  existingLease,
  currency = 'USD',
  onExport,
  handleGenerateOrRegenerate
}: IFRS16ScheduleProps) {
  // Get created lease ID from Redux store
  const { createdLeaseId } = useAppSelector((state) => state.newLease);
  const hasLeaseId = !!createdLeaseId || !!schedule?.id || !!existingLease?.id;;

  const formatCurrency = (amount: number | string | undefined) => {
    if (!amount) return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(numAmount);
  };

  const entries: IFRS16ScheduleEntry[] = schedule?.schedule_data?.entries || [];

  const getTotalInterest = () => parseFloat(schedule?.total_interest || '0');
  const getTotalDepreciation = () => parseFloat(schedule?.total_depreciation || '0');
  const getTotalExpense = () => entries.reduce((sum, item) => sum + item.total_expense, 0);
 
  const getGenerateStateName = () => {
    if (schedule && entries.length > 0) {
      return 'Regenerate';
    }
    return 'Generate';
  };

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>IFRS 16 Lease Schedule</CardTitle>
              <CardDescription>International Financial Reporting Standards lease accounting</CardDescription>
            </div>
            <div className="flex items-center gap-2">
             
              <Badge>IFRS 16</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Initial ROU Asset</p>
              <p className="text-lg">{formatCurrency(schedule?.initial_rou_asset)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Initial Lease Liability</p>
              <p className="text-lg">{formatCurrency(schedule?.initial_lease_liability)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Interest</p>
              <p className="text-lg">{formatCurrency(getTotalInterest())}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Depreciation</p>
              <p className="text-lg">{formatCurrency(getTotalDepreciation())}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>IFRS 16 Accounting Model:</strong> All leases are treated similarly to finance leases 
            under US GAAP. The lessee recognizes a right-of-use asset and a lease liability, with interest 
            expense on the liability and depreciation expense on the asset separately presented in the income statement.
          </p>
        </CardContent>
      </Card>

      {/* Schedule Tabs */}
      
      <Tabs defaultValue="expense">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="expense">P&L Impact</TabsTrigger>
            <TabsTrigger value="liability">Lease Liability</TabsTrigger>
            <TabsTrigger value="asset">ROU Asset</TabsTrigger>
            <TabsTrigger value="balances">Balance Sheet</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateOrRegenerate?.(getGenerateStateName());
              }}
              disabled={!hasLeaseId}
              className="gap-2"
            >
              {getGenerateStateName()}
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onExport?.();
              }}
              disabled={!hasLeaseId || !(schedule && entries.length > 0)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div> 

        <TabsContent value="expense" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Impact</CardTitle>
              <CardDescription>
                Interest expense and depreciation expense (separate line items)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Interest Expense</TableHead>
                      <TableHead className="text-right">Depreciation Expense</TableHead>
                      <TableHead className="text-right">Total P&L Impact</TableHead>
                      <TableHead className="text-right">Cash Payment</TableHead>
                      <TableHead className="text-right">Non-Cash Expense</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => {
                      const nonCashExpense = entry.total_expense - entry.lease_payment;
                      return (
                        <TableRow key={entry.period}>
                          <TableCell>{entry.period}</TableCell>
                          <TableCell>{new Date(entry.period_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.interest_expense)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.amortization)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.total_expense)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.lease_payment)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(nonCashExpense)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Interest Expense</p>
                  <p className="text-lg">{formatCurrency(getTotalInterest())}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Depreciation</p>
                  <p className="text-lg">{formatCurrency(getTotalDepreciation())}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total P&L Impact</p>
                  <p className="text-lg">{formatCurrency(getTotalExpense())}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lease Liability Schedule</CardTitle>
              <CardDescription>
                Amortization of lease liability using effective interest method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Opening Balance</TableHead>
                      <TableHead className="text-right">Interest Expense</TableHead>
                      <TableHead className="text-right">Lease Payment</TableHead>
                      <TableHead className="text-right">Principal Reduction</TableHead>
                      <TableHead className="text-right">Closing Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.period}>
                        <TableCell>{entry.period}</TableCell>
                        <TableCell>{new Date(entry.period_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.lease_liability_beginning)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.interest_expense)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.lease_payment)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.principal_reduction)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.lease_liability_ending)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asset" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Right-of-Use Asset Schedule</CardTitle>
              <CardDescription>
                Depreciation of ROU asset (typically straight-line)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Opening Balance</TableHead>
                      <TableHead className="text-right">Depreciation Expense</TableHead>
                      <TableHead className="text-right">Accumulated Depreciation</TableHead>
                      <TableHead className="text-right">Net Book Value</TableHead>
                      <TableHead className="text-right">% Depreciated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => {
                      const initialROU = parseFloat(schedule?.initial_rou_asset || '0');
                      const accumulatedDepreciation = initialROU - entry.rou_asset_ending;
                      const percentDepreciated = initialROU > 0 ? (accumulatedDepreciation / initialROU) * 100 : 0;
                      return (
                        <TableRow key={entry.period}>
                          <TableCell>{entry.period}</TableCell>
                          <TableCell>{new Date(entry.period_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.rou_asset_beginning)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.amortization)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(accumulatedDepreciation)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.rou_asset_ending)}</TableCell>
                          <TableCell className="text-right">{percentDepreciated.toFixed(1)}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet Presentation</CardTitle>
              <CardDescription>
                Current and non-current classification of lease balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">ROU Asset (Non-Current)</TableHead>
                      <TableHead className="text-right">Current Lease Liability</TableHead>
                      <TableHead className="text-right">Non-Current Lease Liability</TableHead>
                      <TableHead className="text-right">Total Lease Liability</TableHead>
                      <TableHead className="text-right">Net Position</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry, index) => {
                      const remainingPeriods = entries.length - index;
                      const currentLiability = remainingPeriods <= 12 ? entry.lease_liability_ending : 
                        (entry.lease_liability_ending - (entries[index + Math.min(12, remainingPeriods - 1)]?.lease_liability_ending || 0));
                      const nonCurrentLiability = entry.lease_liability_ending - currentLiability;
                      const netPosition = entry.rou_asset_ending - entry.lease_liability_ending;
                      
                      return (
                        <TableRow key={entry.period}>
                          <TableCell>{entry.period}</TableCell>
                          <TableCell>{new Date(entry.period_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.rou_asset_ending)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(currentLiability)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(nonCurrentLiability)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.lease_liability_ending)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(netPosition)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/lease-dashboard/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/lease-dashboard/ui/tabs';
import { Badge } from '@/components/lease-dashboard/ui/badge';

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
  schedule: IFRS16ScheduleItem[];
  initialROU: number;
  initialLiability: number;
  currency?: string;
}

export function IFRS16Schedule({ 
  schedule, 
  initialROU, 
  initialLiability, 
  currency = 'USD' 
}: IFRS16ScheduleProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getTotalInterest = () => {
    return schedule.reduce((sum, item) => sum + item.interestExpense, 0);
  };

  const getTotalDepreciation = () => {
    return schedule.reduce((sum, item) => sum + item.depreciationExpense, 0);
  };

  const getTotalExpense = () => {
    return schedule.reduce((sum, item) => sum + item.totalExpense, 0);
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
            <Badge>IFRS 16</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Initial ROU Asset</p>
              <p className="text-lg">{formatCurrency(initialROU)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Initial Lease Liability</p>
              <p className="text-lg">{formatCurrency(initialLiability)}</p>
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
        <TabsList>
          <TabsTrigger value="expense">P&L Impact</TabsTrigger>
          <TabsTrigger value="liability">Lease Liability</TabsTrigger>
          <TabsTrigger value="asset">ROU Asset</TabsTrigger>
          <TabsTrigger value="balances">Balance Sheet</TabsTrigger>
        </TabsList>

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
                    {schedule.map((item) => {
                      const nonCashExpense = item.totalExpense - item.leasePayment;
                      return (
                        <TableRow key={item.period}>
                          <TableCell>{item.period}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.interestExpense)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.depreciationExpense)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.totalExpense)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.leasePayment)}</TableCell>
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
                    {schedule.map((item, index) => {
                      const openingBalance = index === 0 ? initialLiability : schedule[index - 1].leaseLiabilityBalance;
                      const principalReduction = item.leasePayment - item.interestExpense;
                      return (
                        <TableRow key={item.period}>
                          <TableCell>{item.period}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(openingBalance)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.interestExpense)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.leasePayment)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(principalReduction)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.leaseLiabilityBalance)}</TableCell>
                        </TableRow>
                      );
                    })}
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
                    {schedule.map((item, index) => {
                      const openingBalance = index === 0 ? initialROU : schedule[index - 1].rouAssetBalance;
                      const accumulatedDepreciation = initialROU - item.rouAssetBalance;
                      const percentDepreciated = (accumulatedDepreciation / initialROU) * 100;
                      return (
                        <TableRow key={item.period}>
                          <TableCell>{item.period}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(openingBalance)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.depreciationExpense)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(accumulatedDepreciation)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.rouAssetBalance)}</TableCell>
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
                    {schedule.map((item, index) => {
                      const remainingPeriods = schedule.length - index;
                      const currentLiability = remainingPeriods <= 12 ? item.leaseLiabilityBalance : 
                        (item.leaseLiabilityBalance - (schedule[index + Math.min(12, remainingPeriods - 1)]?.leaseLiabilityBalance || 0));
                      const nonCurrentLiability = item.leaseLiabilityBalance - currentLiability;
                      const netPosition = item.rouAssetBalance - item.leaseLiabilityBalance;
                      
                      return (
                        <TableRow key={item.period}>
                          <TableCell>{item.period}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.rouAssetBalance)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(currentLiability)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(nonCurrentLiability)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.leaseLiabilityBalance)}</TableCell>
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

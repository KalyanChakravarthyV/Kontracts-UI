import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/lease-dashboard/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/lease-dashboard/ui/tabs';
import { Badge } from '@/components/lease-dashboard/ui/badge';

export interface ASC842ScheduleItem {
  period: number;
  date: string;
  leasePayment: number;
  interestExpense: number;
  amortization: number;
  rouAssetBalance: number;
  leaseLiabilityBalance: number;
  straightLineExpense: number;
}

interface ASC842ScheduleProps {
  schedule: ASC842ScheduleItem[];
  classification: 'operating' | 'finance';
  initialROU: number;
  initialLiability: number;
  currency?: string;
}

export function ASC842Schedule({ 
  schedule, 
  classification, 
  initialROU, 
  initialLiability, 
  currency = 'USD' 
}: ASC842ScheduleProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getTotalInterest = () => {
    return schedule.reduce((sum, item) => sum + item.interestExpense, 0);
  };

  const getTotalAmortization = () => {
    return schedule.reduce((sum, item) => sum + item.amortization, 0);
  };

  const getTotalStraightLine = () => {
    return schedule.reduce((sum, item) => sum + item.straightLineExpense, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>ASC 842 Lease Schedule</CardTitle>
              <CardDescription>US GAAP lease accounting calculations</CardDescription>
            </div>
            <Badge variant={classification === 'finance' ? 'default' : 'secondary'}>
              {classification === 'finance' ? 'Finance Lease' : 'Operating Lease'}
            </Badge>
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
              <p className="text-sm text-muted-foreground">Total Interest Expense</p>
              <p className="text-lg">{formatCurrency(getTotalInterest())}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amortization</p>
              <p className="text-lg">{formatCurrency(getTotalAmortization())}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Tabs */}
      <Tabs defaultValue={classification === 'finance' ? 'finance' : 'operating'}>
        <TabsList>
          <TabsTrigger value="finance">Finance Lease View</TabsTrigger>
          <TabsTrigger value="operating">Operating Lease View</TabsTrigger>
          <TabsTrigger value="balances">Balance Sheet Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="finance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Finance Lease Schedule</CardTitle>
              <CardDescription>
                Interest expense and ROU asset amortization (separate presentation)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Lease Payment</TableHead>
                      <TableHead className="text-right">Interest Expense</TableHead>
                      <TableHead className="text-right">Principal Reduction</TableHead>
                      <TableHead className="text-right">ROU Amortization</TableHead>
                      <TableHead className="text-right">Total Expense</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.map((item) => {
                      const principalReduction = item.leasePayment - item.interestExpense;
                      const totalExpense = item.interestExpense + item.amortization;
                      return (
                        <TableRow key={item.period}>
                          <TableCell>{item.period}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.leasePayment)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.interestExpense)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(principalReduction)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amortization)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(totalExpense)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operating" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operating Lease Schedule</CardTitle>
              <CardDescription>
                Straight-line lease expense (combined presentation)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Lease Payment</TableHead>
                      <TableHead className="text-right">Interest Expense</TableHead>
                      <TableHead className="text-right">ROU Amortization</TableHead>
                      <TableHead className="text-right">Straight-Line Expense</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.map((item) => {
                      const actualExpense = item.interestExpense + item.amortization;
                      const variance = actualExpense - item.straightLineExpense;
                      return (
                        <TableRow key={item.period}>
                          <TableCell>{item.period}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.leasePayment)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.interestExpense)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amortization)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.straightLineExpense)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(variance)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> For operating leases under ASC 842, a single lease expense is 
                  recognized on a straight-line basis over the lease term. Total straight-line expense: {formatCurrency(getTotalStraightLine())}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet Impact</CardTitle>
              <CardDescription>
                ROU Asset and Lease Liability balances over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">ROU Asset Balance</TableHead>
                      <TableHead className="text-right">Lease Liability Balance</TableHead>
                      <TableHead className="text-right">Net Position</TableHead>
                      <TableHead className="text-right">Current Liability</TableHead>
                      <TableHead className="text-right">Non-Current Liability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.map((item, index) => {
                      const netPosition = item.rouAssetBalance - item.leaseLiabilityBalance;
                      // Estimate current vs non-current (next 12 months)
                      const remainingPeriods = schedule.length - index;
                      const currentLiability = remainingPeriods <= 12 ? item.leaseLiabilityBalance : 
                        (schedule[index + Math.min(12, remainingPeriods - 1)]?.leaseLiabilityBalance || 0);
                      const nonCurrentLiability = item.leaseLiabilityBalance - currentLiability;
                      
                      return (
                        <TableRow key={item.period}>
                          <TableCell>{item.period}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.rouAssetBalance)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.leaseLiabilityBalance)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(netPosition)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(currentLiability)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(nonCurrentLiability)}</TableCell>
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

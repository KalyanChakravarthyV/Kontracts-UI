import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/lease-dashboard/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/lease-dashboard/ui/tabs';
import { Badge } from '@/components/lease-dashboard/ui/badge';
import { Button } from '@/components/lease-dashboard/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useState, useEffect } from 'react';

export interface ASC842ScheduleEntry {
  period: number;
  period_date: string;
  lease_payment: number;
  interest_expense: number;
  principal_reduction: number;
  lease_liability_beginning: number;
  lease_liability_ending: number;
  current_lease_liability?: number;
  non_current_lease_liability?: number;
  rou_asset_beginning: number;
  amortization: number;
  rou_asset_ending: number;
  total_expense: number;
}

export interface ASC842ScheduleData {
  id?: number;
  lease_id?: number;
  initial_rou_asset: string;
  initial_lease_liability: string;
  total_payments: string;
  total_interest: string;
  total_amortization: string;
  schedule_data: {
    entries: ASC842ScheduleEntry[];
  };
}

interface ASC842ScheduleProps {
  schedule: ASC842ScheduleData;
  existingLease?: any;
  paymentsList?: any[];
  classification: 'operating' | 'finance';
  currency?: string;
  isGenerating?: boolean;
  onExport?: () => void;
  handleGenerateOrRegenerate?: (param: string) => void;
}

export function ASC842Schedule({
  schedule,
  existingLease,
  paymentsList,
  currency = 'USD',
  isGenerating = false,
  onExport,
  handleGenerateOrRegenerate
}: ASC842ScheduleProps) {
  // Get created lease ID from Redux store
  const { createdLeaseId } = useAppSelector((state) => state.newLease);
  const hasLeaseId = !!createdLeaseId || !!schedule?.id || !!existingLease?.id;
  const hasPayments = paymentsList && paymentsList.length > 0;
  const hasScheduleData = schedule && schedule.schedule_data?.entries?.length > 0;
  console.log("createdLeaseId", createdLeaseId);
  // State for active tab
  const [activeTab, setActiveTab] = useState<string>(
    existingLease?.classification === 'finance' ? 'finance' : 'operating'
  );
  console.log("existingLease", existingLease);
  // Update active tab when classification changes
  useEffect(() => {
    if (existingLease?.classification) {
      setActiveTab(existingLease.classification === 'finance' ? 'finance' : 'operating');
    }
  }, [existingLease?.classification]);  
  const formatCurrency = (amount: number | string | undefined) => {
    if (!amount) return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(numAmount);
  };
  console.log("schedule", schedule);

  const entries: ASC842ScheduleEntry[] = schedule?.schedule_data?.entries || [];

  const getTotalInterest = () => parseFloat(schedule?.total_interest || '0');
  const getTotalAmortization = () => parseFloat(schedule?.total_amortization || '0');
  const getTotalStraightLine = () => entries.reduce((sum, item) => sum + item.total_expense, 0);
  
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
              <CardTitle>ASC 842 Lease Schedule</CardTitle>
              <CardDescription>US GAAP lease accounting standard</CardDescription>
            </div>
            <div className="flex items-center gap-2">
             
              <Badge variant={existingLease?.classification === 'finance' ? 'default' : 'secondary'}>
                {existingLease?.classification === 'finance' ? 'Finance Lease' : 'Operating Lease'}
              </Badge>
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            {existingLease?.classification === 'finance' && (
              <TabsTrigger value="finance">Finance Lease View</TabsTrigger>
            )}
            {existingLease?.classification === 'operating' && (
              <TabsTrigger value="operating">Operating Lease View</TabsTrigger>
            )}
            <TabsTrigger value="balances">Balance Sheet Impact</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateOrRegenerate?.(getGenerateStateName());
              }}
              disabled={isGenerating || !hasLeaseId || (!hasPayments && !hasScheduleData)}
              className="gap-2"
            >
              {isGenerating
                ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
                : getGenerateStateName()
              }
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onExport?.();
              }}
              disabled={isGenerating || !hasLeaseId || !(schedule && entries.length > 0)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

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
                      <TableHead className="text-right">Lease Liability (Beg)</TableHead>
                      <TableHead className="text-right">Lease Liability (End)</TableHead>
                      <TableHead className="text-right">Current Liability</TableHead>
                      <TableHead className="text-right">Non-Current Liability</TableHead>
                      <TableHead className="text-right">ROU Asset (Beg)</TableHead>
                      <TableHead className="text-right">ROU Amortization</TableHead>
                      <TableHead className="text-right">ROU Asset (End)</TableHead>
                      <TableHead className="text-right">Total Expense</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.period}>
                        <TableCell>{entry.period}</TableCell>
                        <TableCell>{new Date(entry.period_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.lease_payment)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.interest_expense)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.principal_reduction)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.lease_liability_beginning)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.lease_liability_ending)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.current_lease_liability)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.non_current_lease_liability)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.rou_asset_beginning)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.amortization)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.rou_asset_ending)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.total_expense)}</TableCell>
                      </TableRow>
                    ))}
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
                      <TableHead className="text-right">Principal Reduction</TableHead>
                      <TableHead className="text-right">Lease Liability (Beg)</TableHead>
                      <TableHead className="text-right">Lease Liability (End)</TableHead>
                      <TableHead className="text-right">Current Liability</TableHead>
                      <TableHead className="text-right">Non-Current Liability</TableHead>
                      <TableHead className="text-right">ROU Asset (Beg)</TableHead>
                      <TableHead className="text-right">ROU Amortization</TableHead>
                      <TableHead className="text-right">ROU Asset (End)</TableHead>
                      <TableHead className="text-right">Straight-Line Expense</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => {
                      return (
                        <TableRow key={entry.period}>
                          <TableCell>{entry.period}</TableCell>
                          <TableCell>{new Date(entry.period_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.lease_payment)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.interest_expense)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.principal_reduction)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.lease_liability_beginning)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.lease_liability_ending)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.current_lease_liability)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.non_current_lease_liability)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.rou_asset_beginning)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.amortization)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.rou_asset_ending)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.total_expense)}</TableCell>
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
                    {entries.map((entry) => {
                      const netPosition = entry.rou_asset_ending - entry.lease_liability_ending;
                      
                      return (
                        <TableRow key={entry.period}>
                          <TableCell>{entry.period}</TableCell>
                          <TableCell>{new Date(entry.period_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.rou_asset_ending)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.lease_liability_ending)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(netPosition)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.current_lease_liability)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.non_current_lease_liability)}</TableCell>
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

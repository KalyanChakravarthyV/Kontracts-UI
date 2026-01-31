import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/lease-dashboard/ui/table';
import { Badge } from '@/components/lease-dashboard/ui/badge';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

export interface PaymentScheduleItem {
  period: number;
  date: string;
  baseRent: number;
  cam: number;
  insurance: number;
  propertyTax: number;
  totalPayment: number;
  principalPayment: number;
  interestPayment: number;
  leaseliabilityBalance: number;
  status: 'paid' | 'pending' | 'upcoming';
}

interface PaymentScheduleProps {
  payments: PaymentScheduleItem[];
  currency?: string;
}

export function PaymentSchedule({ payments, currency = 'USD' }: PaymentScheduleProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getTotalPayments = () => {
    return payments.reduce((sum, payment) => sum + payment.totalPayment, 0);
  };

  const getTotalPrincipal = () => {
    return payments.reduce((sum, payment) => sum + payment.principalPayment, 0);
  };

  const getTotalInterest = () => {
    return payments.reduce((sum, payment) => sum + payment.interestPayment, 0);
  };

  const getStatusBadge = (status: PaymentScheduleItem['status']) => {
    const variants = {
      paid: 'default',
      pending: 'secondary',
      upcoming: 'outline',
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Payments</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(getTotalPayments())}</div>
            <p className="text-xs text-muted-foreground">{payments.length} periods</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Principal</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(getTotalPrincipal())}</div>
            <p className="text-xs text-muted-foreground">Lease liability reduction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Interest</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(getTotalInterest())}</div>
            <p className="text-xs text-muted-foreground">Interest expense</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Amortization Schedule</CardTitle>
          <CardDescription>
            Detailed breakdown of lease payments and liability amortization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Period</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Base Rent</TableHead>
                  <TableHead className="text-right">CAM</TableHead>
                  <TableHead className="text-right">Insurance</TableHead>
                  <TableHead className="text-right">Property Tax</TableHead>
                  <TableHead className="text-right">Total Payment</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">Interest</TableHead>
                  <TableHead className="text-right">Liability Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.period}>
                    <TableCell>{payment.period}</TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.baseRent)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.cam)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.insurance)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.propertyTax)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.totalPayment)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.principalPayment)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.interestPayment)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.leaseliabilityBalance)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

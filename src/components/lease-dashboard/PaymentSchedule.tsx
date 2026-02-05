import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/lease-dashboard/ui/table';
import { Badge } from '@/components/lease-dashboard/ui/badge';
import { Button } from '@/components/lease-dashboard/ui/button';
import { Input } from '@/components/lease-dashboard/ui/input';
import { DollarSign, TrendingUp, Calendar, Plus, Save, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import AppAlert from '@/components/common/AppAlert';

// API Response type
export interface PaymentApiResponse {
  id: string;
  contract_id: string;
  amount: string;
  due_date: string;
  status: 'Paid' | 'Scheduled';
  paid_date: string | null;
  created_at: string;
}

// Component Props type
export interface PaymentScheduleItem {
  period: number;                    // calculated
  due_date: string;                  // from due_date
  amount: number;
  type: string;                    // from amount (for now)             // from amount (for now)
  principal: number,
  interest: number,
  liablity_balance: number,    // calculated
  status: 'paid' | 'pending' | 'upcoming';
  paid_date?: string;                // from paid_date
}

// New row type for user input
export interface NewPaymentRow {
  due_date: string;
  amount: string;
  type: string;
  principal: '',
  interest: '',
  liablity_balance: '',
  status: 'Paid' | 'Scheduled';
  paid_date: string;
}

interface PaymentScheduleProps {
  paymentsList: PaymentScheduleItem[];
  currency?: string;
  contractId: number;
  onPaymentAdded?: (newPayment: PaymentApiResponse) => void;
}

export function PaymentSchedule({ 
  paymentsList, 
  currency = 'USD',
  contractId,
  onPaymentAdded 
}: PaymentScheduleProps) {

  // State for adding new rows
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [payments, setPayments] = useState<PaymentScheduleItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState('')
  const lastInputRef = useRef<HTMLInputElement | null>(null);

  const [newRow, setNewRow] = useState<NewPaymentRow>({
    due_date: '',
    amount: '',
    type: '',
    principal: '',
    interest: '',
    liablity_balance: '',
    status: 'Scheduled',
    paid_date: ''
  });
  useEffect(()=>{
    setPayments(paymentsList)
  },[paymentsList])

useEffect(() => {
  if (isAddingRow && lastInputRef.current) {
    setTimeout(() => {
      lastInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      lastInputRef.current?.focus({ preventScroll: true });
    }, 0);
  }
}, [isAddingRow]);
  const { getAccessTokenSilently } = useAuth0();
  const formatCurrency = (amount: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Invalid date:', dateString);
      return '-';
    }
  };

  const getTotalPayments = () => {
    return payments?.reduce((sum, payment) => sum + payment.totalPayment, 0);
  };

  const getTotalPrincipal = () => {
    return payments?.reduce((sum, payment) => sum + payment.principalPayment, 0);
  };

  const getTotalInterest = () => {
    return payments?.reduce((sum, payment) => sum + payment.interestPayment, 0);
  };

type Status = 'paid' | 'pending' | 'upcoming' | 'scheduled';

const getStatusBadge = (status: string) => {
  const statusMap = {
    paid: 'paid',
    Paid: 'paid',
    pending: 'pending',
    Scheduled: 'scheduled',
    upcoming: 'upcoming',
  } as const;

  const mappedStatus: Status =
    statusMap[status as keyof typeof statusMap] || 'upcoming';

  const variants = {
    paid: 'default',
    pending: 'secondary',
    upcoming: 'outline',
    scheduled: 'secondary',
  } as const;
    return (
      <Badge variant={variants[mappedStatus]}>
        {mappedStatus.charAt(0).toUpperCase() + mappedStatus.slice(1)}
      </Badge>
    );
  };

  // Handle input change
  const handleInputChange = (field: keyof NewPaymentRow, value: string) => {
    setNewRow(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new row button handler
  const handleAddRow = () => {
    setIsAddingRow(true);
    setNewRow({
      due_date: '',
      amount: '',
      type: '',
      principal: '',
      interest: '',
      liablity_balance: '',
      status: 'Scheduled',
      paid_date: ''
    });
  };

  // Cancel adding row
  const handleCancelAdd = () => {
    setIsAddingRow(false);
    setNewRow({
      due_date: '',
      amount: '',
      type:'',
      principal: '',
      interest: '',
      liablity_balance: '',
      status: 'Scheduled',
      paid_date: ''
    });
  };

  // Save new payment (POST API call)
  const handleSavePayment = async () => {
     const accessToken = await getAccessTokenSilently();
    try {
      setIsSaving(true);

      // Validate required fields
     const requiredFields = {
        due_date: 'Due Date',
        type: 'Type',
        amount: 'Amount'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !newRow[key as keyof typeof newRow])
        .map(([, label]) => label);

      if (missingFields.length) {
        setAlertMessage(`${missingFields.join(', ')} ${missingFields.length > 1 ? 'are' : 'is'} required`);
        return;
      }

      // Prepare payload for API
      const payload = {
        contract_id: contractId.toString(),
        amount: newRow.amount,
        due_date: new Date(newRow.due_date).toISOString(),
        status: newRow.status,
        paid_date: newRow.paid_date ? new Date(newRow.paid_date).toISOString() : null
      };

      console.log('Posting payment:', payload);
      // Make POST API call
      const response = await fetch('https://api.kontracts.pro/api/v1/payments/', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data: PaymentApiResponse = await response.json();
      console.log('Payment created successfully:', data);

      // Call callback if provided
      if (onPaymentAdded) {
        onPaymentAdded(data);
      }

     setPayments(prev => [...prev, data]);
      // Reset form and close
      setIsAddingRow(false);
      setNewRow({
        due_date: '',
        amount: '',
        type:'',
        principal: '',
        interest: '',
        liablity_balance: '',
        status: 'Scheduled',
        paid_date: ''
      });

      // Show success message
      alert('Payment added successfully!');

    } catch (error) {
      console.error('Error saving payment:', error);
      alert(`Failed to save payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
    <AppAlert message={alertMessage}
          severity = 'error'/>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment Amortization Schedule</CardTitle>
            <CardDescription>
              Detailed breakdown of lease payments and liability amortization
            </CardDescription>
          </div>
          <Button 
            onClick={handleAddRow} 
            disabled={isAddingRow}
            size="sm"
          >
            <Plus className="size-4 mr-2" />
            Add Payment
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Period</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">Interest</TableHead>
                  <TableHead className="text-right">Liability Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid Date</TableHead>
                  {isAddingRow && <TableHead className="w-24">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{formatDate(payment.due_date)}</TableCell>
                    <TableCell className="text-right">{payment.type}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.principal)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.interest)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.liablity_balance)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{formatDate(payment.paid_date)}</TableCell>
                    {isAddingRow && <TableCell></TableCell>}
                  </TableRow>
                ))}
                
                {/* New Row Input Form */}
                {isAddingRow && (
                  <TableRow className="bg-muted/50">
                    <TableCell>{payments.length + 1}</TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        ref={lastInputRef}
                        value={newRow.due_date}
                        onChange={(e) => handleInputChange('due_date', e.target.value)}
                        className="w-full"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        value={newRow.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      > 
                        <option value="base_rent">Base rent</option>
                        <option value="cam">CAM</option>
                        <option value="insurance">Insurance</option>
                        <option value="property-tax">Property tax</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newRow.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        className="w-full text-right"
                        step="0.01"
                        required
                      />
                    </TableCell>
                   
                  
                    <TableCell className="text-muted-foreground text-right">-</TableCell>
                    <TableCell className="text-muted-foreground text-right">-</TableCell>
                    <TableCell className="text-muted-foreground text-right">-</TableCell>
                    <TableCell>
                      <select
                        value={newRow.status}
                        onChange={(e) => handleInputChange('status', e.target.value as 'Paid' | 'Scheduled')}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={newRow.paid_date}
                        onChange={(e) => handleInputChange('paid_date', e.target.value)}
                        className="w-full"
                        disabled={newRow.status !== 'Paid'}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSavePayment}
                          disabled={isSaving}
                        >
                          <Save className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelAdd}
                          disabled={isSaving}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}

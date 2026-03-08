import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/lease-dashboard/ui/table';
import { Badge } from '@/components/lease-dashboard/ui/badge';
import { Button } from '@/components/lease-dashboard/ui/button';
import { Input } from '@/components/lease-dashboard/ui/input';
import { DollarSign, TrendingUp, Calendar, Plus, Save, X, Edit2, Check, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import AppAlert from '@/components/common/AppAlert';
import { API_BASE_URL } from '@/config/api';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setSuccessMessage, setErrorMessage } from '@/store/slices/alertMessageSlice';

// API Response type
export interface PaymentApiResponse {
  id: string;
  contract_id: string;
  amount: string;
  due_date: string;
  payment_type_id: string;
  status: 'Paid' | 'Scheduled';
  paid_date: string | null;
  created_at: string;
}

// Component Props type
export interface PaymentScheduleItem {
  id?: string;                       // payment ID for API calls
  period: number;                    // calculated
  due_date: string;                  // from due_date
  amount: number;
  payment_type_id: string;           // payment type id from API
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
  payment_type_id: string;
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
  onPaymentChanged?: () => void;
}

export function PaymentSchedule({ 
  paymentsList, 
  currency = 'USD',
  contractId,
  onPaymentAdded,
  onPaymentChanged
}: PaymentScheduleProps) {

  const dispatch = useAppDispatch();
  const { getAccessTokenSilently } = useAuth0();
  
  // Get created lease ID from Redux store
  const { createdLeaseId } = useAppSelector((state) => state.newLease);
  const hasLeaseId = !!createdLeaseId || !!contractId;

  // State for adding new rows
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [payments, setPayments] = useState<PaymentScheduleItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState('')
  const lastInputRef = useRef<HTMLInputElement | null>(null);

  // State for inline editing
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<PaymentScheduleItem | null>(null);

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    paymentId: string | null;
  }>({ show: false, paymentId: null });

  // State for payment summary
  const [paymentSummary, setPaymentSummary] = useState<{
    contract_id: string;
    total_amount: number;
    total_paid: number;
    total_scheduled: number;
    total_overdue: number;
    payment_count: number;
  } | null>(null);

  // State for payment type options
  const [paymentTypeOptions, setPaymentTypeOptions] = useState<Array<{
    id: string;
    name: string;
    charge_category: string;
    description: string;
  }>>([]);

  const [newRow, setNewRow] = useState<NewPaymentRow>({
    due_date: '',
    amount: '',
    payment_type_id: '', // This will store the id
    principal: '',
    interest: '',
    liablity_balance: '',
    status: 'Scheduled',
    paid_date: ''
  });
  
  useEffect(()=>{
    setPayments(paymentsList)
  },[paymentsList])

  // Fetch payment type options
  useEffect(() => {
    const fetchPaymentTypeOptions = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        const response = await fetch(`${API_BASE_URL}/payments/dropdown-options`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.payment_types && data.payment_types.length > 0) {
          setPaymentTypeOptions(data.payment_types);
          // Set default payment type to first option's id
          setNewRow(prev => ({ ...prev, payment_type_id: data.payment_types[0].id }));
        }
      } catch (error) {
        console.error('Error fetching payment type options:', error);
      }
    };

    fetchPaymentTypeOptions();
  }, [getAccessTokenSilently]);

  // Fetch payment summary
  useEffect(() => {
    const getPaymentSummary = async () => {
      if (!contractId) return;

      try {
        const accessToken = await getAccessTokenSilently();
        const response = await fetch(`${API_BASE_URL}/payments/contract/${contractId}/summary`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPaymentSummary(data);
        }
      } catch (error) {
        console.error('Error fetching payment summary:', error);
      }
    };

    getPaymentSummary();
  }, [contractId, getAccessTokenSilently])

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
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPaymentType = (paymentTypeId: string) => {
    // Find the matching option by id from the fetched payment types
    const option = paymentTypeOptions.find(opt => opt.id === paymentTypeId);
    return option ? option.name : paymentTypeId;
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
      payment_type_id: paymentTypeOptions.length > 0 ? paymentTypeOptions[0].id : '',
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
      payment_type_id: paymentTypeOptions.length > 0 ? paymentTypeOptions[0].id : '',
      principal: '',
      interest: '',
      liablity_balance: '',
      status: 'Scheduled',
      paid_date: ''
    });
  };

  // Start editing a row
  const handleEditRow = (index: number) => {
    const paymentToEdit = { ...payments[index] };
    console.log('Editing payment:', paymentToEdit);
    setEditingRowIndex(index);
    setEditingRow(paymentToEdit);
  };

  // Handle editing input change
  const handleEditInputChange = (field: keyof PaymentScheduleItem, value: string | number) => {
    if (editingRow) {
      setEditingRow({
        ...editingRow,
        [field]: value
      });
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingRowIndex(null);
    setEditingRow(null);
  };

  // Show delete confirmation
  const handleDeleteClick = (paymentId: string) => {
    setDeleteConfirmation({ show: true, paymentId });
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmation({ show: false, paymentId: null });
  };

  // Confirm and delete payment
  const handleConfirmDelete = async () => {
    const paymentId = deleteConfirmation.paymentId;
    if (!paymentId) return;

    try {
      const accessToken = await getAccessTokenSilently();
      
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete payment: ${response.status} ${response.statusText}`);
      }

      // Remove payment from local state
      setPayments((prev) => prev.filter((payment) => payment.id !== paymentId));
      dispatch(setSuccessMessage('Payment deleted successfully!'));
      setDeleteConfirmation({ show: false, paymentId: null });
      
      // Refetch payments
      onPaymentChanged?.();
    } catch (error) {
      console.error('Error deleting payment:', error);
      dispatch(setErrorMessage(error instanceof Error ? error.message : 'Failed to delete payment. Please try again.'));
      setDeleteConfirmation({ show: false, paymentId: null });
    }
  };

  // Mark payment as paid
  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const accessToken = await getAccessTokenSilently();
      
      if (!contractId) {
        dispatch(setErrorMessage('No contract ID available'));
        return;
      }

      const payment = payments.find(p => p.id === paymentId);
      if (!payment) {
        dispatch(setErrorMessage('Payment not found'));
        return;
      }

      const currentDate = new Date().toISOString();
      
      const payload = {
        contract_id: contractId.toString(),
        due_date: payment.due_date,
        amount: payment.amount.toString(),
        payment_type_id: payment.payment_type_id,
        status: 'Paid',
        paid_date: currentDate
      };

      console.log('Marking payment as paid:', payload);

      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark payment as paid: ${response.status} ${response.statusText}`);
      }

      // Update payment in local state with the same paid_date
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId ? { ...p, status: 'paid', paid_date: currentDate } : p
        )
      );
      dispatch(setSuccessMessage('Payment marked as paid successfully!'));
      console.log('Payment marked as paid:', payload);
      
      // Refetch payments
      onPaymentChanged?.();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      dispatch(setErrorMessage(error instanceof Error ? error.message : 'Failed to mark payment as paid. Please try again.'));
    }
  };

  // Save edited payment (PUT API call)
  const handleUpdatePayment = async (paymentId: string) => {
    if (!editingRow) return;

    try {
      setIsSaving(true);
      const accessToken = await getAccessTokenSilently();

      if (!contractId) {
        dispatch(setErrorMessage('No contract ID available'));
        setIsSaving(false);
        return;
      }

      const payload = {
        contract_id: contractId.toString(),
        due_date: editingRow.due_date,
        amount: editingRow.amount.toString(),
        payment_type_id: editingRow.payment_type_id,
        status: editingRow.status === 'paid' ? 'Paid' : 'Scheduled',
        paid_date: editingRow.paid_date || null
      };
      console.log("update payload", payload)
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update payment');
      }

      // Update the payments list
      setPayments(prev => prev.map((payment, idx) => 
        idx === editingRowIndex ? editingRow : payment
      ));

      dispatch(setSuccessMessage('Payment updated successfully!'));
      
      // Refetch payments
      onPaymentChanged?.();
      setEditingRowIndex(null);
      setEditingRow(null);
    } catch (error) {
      console.error('Error updating payment:', error);
      dispatch(setErrorMessage('Failed to update payment. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  // Save new payment (POST API call)
  const handleSavePayment = async () => {
     const accessToken = await getAccessTokenSilently();
    try {
      setIsSaving(true);

      // Determine which lease ID to use: createdLeaseId (new lease) or contractId (existing lease)
      const leaseId = createdLeaseId || contractId?.toString();
      
      if (!leaseId) {
        setAlertMessage('No lease ID available. Please create or select a lease first.');
        setIsSaving(false);
        return;
      }

      // Validate required fields
     const requiredFields = {
        due_date: 'Due Date',
        payment_type_id: 'Type',
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
        contract_id: leaseId,
        amount: newRow.amount,
        due_date: new Date(newRow.due_date).toISOString(),
        payment_type_id: newRow.payment_type_id,
        status: newRow.status,
        paid_date: newRow.paid_date ? new Date(newRow.paid_date).toISOString() : null
      };

      console.log('Posting payment:', payload);
      // Make POST API call
      const response = await fetch(`${API_BASE_URL}/payments/`, {
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

      // Map API response to PaymentScheduleItem format
      const newPayment: PaymentScheduleItem = {
        id: data.id,
        period: payments.length + 1,
        due_date: data.due_date,
        amount: parseFloat(data.amount),
        payment_type_id: data.payment_type_id,
        principal: 0,
        interest: 0,
        liablity_balance: 0,
        status: data.status === 'Paid' ? 'paid' : 'upcoming',
        paid_date: data.paid_date || undefined
      };

      setPayments(prev => [...prev, newPayment]);
      
      // Dispatch success message
      dispatch(setSuccessMessage('Payment added successfully!'));
      
      // Reset form and close
      setIsAddingRow(false);
      setNewRow({
        due_date: '',
        amount: '',
        payment_type_id: paymentTypeOptions.length > 0 ? paymentTypeOptions[0].id : '',
        principal: '',
        interest: '',
        liablity_balance: '',
        status: 'Scheduled',
        paid_date: ''
      });
    } catch (error) {
      console.error('Error saving payment:', error);
      alert(`Failed to save payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Dispatch error message
      dispatch(setErrorMessage('Failed to save payment. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
    <AppAlert 
      message={alertMessage}
      severity='error'
      onClose={() => setAlertMessage('')}
    />
    
    {/* Delete Confirmation Dialog */}
    {deleteConfirmation.show && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this payment? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    )}
    
    <div className="space-y-6">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Payments</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(paymentSummary?.total_amount || 0)}</div>
            <p className="text-xs text-muted-foreground">{paymentSummary?.payment_count || payments.length} periods</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Average Payment</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {formatCurrency(
                paymentSummary?.payment_count 
                  ? paymentSummary.total_amount / paymentSummary.payment_count 
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Per period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Overdue</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(paymentSummary?.total_overdue || 0)}</div>
            <p className="text-xs text-muted-foreground">Overdue payments</p>
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
            disabled={isAddingRow || !hasLeaseId}
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
                  <TableHead className="w-32">Due Date</TableHead>
                  <TableHead className="w-48">Type</TableHead>
                  <TableHead className="w-28 text-right">Amount</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-32">Paid Date</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment, index) => {
                  const isEditing = editingRowIndex === index;
                  const displayRow = isEditing && editingRow ? editingRow : payment;
                  
                  return (
                    <TableRow key={index} className={isEditing ? 'bg-muted/50' : ''}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={displayRow.due_date ? displayRow.due_date.split('T')[0] : ''}
                            onChange={(e) => handleEditInputChange('due_date', e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          formatDate(payment.due_date)
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <select
                            value={displayRow.payment_type_id}
                            onChange={(e) => handleEditInputChange('payment_type_id', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          >
                            {paymentTypeOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          formatPaymentType(payment.payment_type_id)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={displayRow.amount}
                            onChange={(e) => handleEditInputChange('amount', parseFloat(e.target.value))}
                            className="w-full text-right"
                            step="0.01"
                          />
                        ) : (
                          formatCurrency(payment.amount)
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <select
                            value={displayRow.status}
                            onChange={(e) => handleEditInputChange('status', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="upcoming">Upcoming</option>
                          </select>
                        ) : (
                          getStatusBadge(payment.status)
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={displayRow.paid_date || ''}
                            onChange={(e) => handleEditInputChange('paid_date', e.target.value)}
                            className="w-full"
                            disabled={displayRow.status !== 'paid'}
                          />
                        ) : (
                          payment.paid_date ? formatDate(payment.paid_date) : '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdatePayment(payment.id || '')}
                              disabled={isSaving || !payment.id}
                            >
                              <Check className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {payment.status.toLowerCase() !== 'paid' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsPaid(payment.id || '')}
                                disabled={isAddingRow || editingRowIndex !== null || !payment.id}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="size-4" />
                              </Button>
                            ) : (
                              <div className="w-8"></div>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditRow(index)}
                              disabled={isAddingRow || editingRowIndex !== null}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClick(payment.id || '')}
                              disabled={isAddingRow || editingRowIndex !== null || !payment.id}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                
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
                        value={newRow.payment_type_id}
                        onChange={(e) => handleInputChange('payment_type_id', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      > 
                        {paymentTypeOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
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

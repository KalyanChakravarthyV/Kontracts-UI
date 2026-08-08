import { useState, useEffect } from 'react';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config/api';
import { DollarSign, Calendar, FileText, Building2, ArrowRight, Loader2 } from 'lucide-react';

interface PaymentDetailProps {
  paymentId: string;
  contractId: string;
  contractName: string;
  onClose?: () => void;
  onViewContract?: (contractId: string) => void;
}

export function PaymentDetail({ paymentId, contractId, contractName, onClose, onViewContract }: PaymentDetailProps) {
  const [payment, setPayment] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { getHeaders } = useAuthToken();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
          headers: await getHeaders(),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }

        const data = await response.json();
        setPayment(data);

        // Fetch payment type name
        const paymentTypesRes = await fetch(`${API_BASE_URL}/payments/dropdown-options`, {
          headers: await getHeaders(),
        });

        if (paymentTypesRes.ok) {
          const typesData = await paymentTypesRes.json();
          const typeObj = typesData.payment_types?.find((pt: any) => pt.id === data.payment_type_id);
          if (typeObj) {
            setPaymentType(typeObj.name);
          }
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load payment details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 text-2xl animate-spin text-primary" size={48} />
          <p className="mt-4 text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex items-center justify-center py-12 min-h-screen">
        <div className="text-center">
          <DollarSign className="mx-auto mb-4 opacity-30" size={48} />
          <p className="text-muted-foreground">Payment details not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold">Payment Details</h2>
          {payment.status && (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(payment.status)}`}>
              {payment.status}
            </span>
          )}
        </div>
        <p className="text-muted-foreground">Payment ID: {paymentId}</p>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amount */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center mb-2">
            <DollarSign className="mr-2 text-blue-600" size={20} />
            <p className="text-sm font-medium text-blue-700">Amount</p>
          </div>
          <p className="text-3xl font-bold text-blue-900">{formatCurrency(payment.amount)}</p>
        </div>

        {/* Payment Type */}
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center mb-2">
            <FileText className="mr-2 text-purple-600" size={20} />
            <p className="text-sm font-medium text-purple-700">Payment Type</p>
          </div>
          <p className="text-2xl font-semibold text-purple-900">{paymentType || payment.payment_type_id || 'N/A'}</p>
        </div>

        {/* Due Date */}
        <div className="bg-orange-50 rounded-lg p-6">
          <div className="flex items-center mb-2">
            <Calendar className="mr-2 text-orange-600" size={20} />
            <p className="text-sm font-medium text-orange-700">Due Date</p>
          </div>
          <p className="text-xl font-semibold text-orange-900">
            {payment.due_date ? formatDate(payment.due_date) : 'N/A'}
          </p>
        </div>

        {/* Paid Date (if applicable) */}
        {payment.paid_date && (
          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center mb-2">
              <Calendar className="mr-2 text-green-600" size={20} />
              <p className="text-sm font-medium text-green-700">Paid Date</p>
            </div>
            <p className="text-xl font-semibold text-green-900">{formatDate(payment.paid_date)}</p>
          </div>
        )}
      </div>

      {/* Contract Link */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Related Contract</p>
            <p className="text-xl font-semibold text-slate-900">{contractName}</p>
          </div>
          <button
            onClick={() => onViewContract?.(contractId)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/95 transition-all"
          >
            View Contract
            <ArrowRight className="ml-2" size={18} />
          </button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Created At</p>
            <p className="font-medium">{payment.created_at ? formatDate(payment.created_at) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Contract ID</p>
            <p className="font-medium">{contractId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/lease-dashboard/ui/button';
import { Input } from '@/components/lease-dashboard/ui/input';
import { Label } from '@/components/lease-dashboard/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/lease-dashboard/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/lease-dashboard/ui/dialog';

interface PaymentWizardProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (wizardData: WizardPayload) => void;
  paymentTypeOptions: Array<{ id: string; name: string }>;
}

interface WizardPayload {
  payment_type_id: string;
  amount: number;
  frequency: string;
  start_date: string;
  number_of_payments?: number;
  duration?: number;
  duration_unit?: string;
}

export function PaymentWizard({ open, onClose, onGenerate, paymentTypeOptions }: PaymentWizardProps) {
  const [paymentType, setPaymentType] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [numberOfPayments, setNumberOfPayments] = useState('');
  const [startDate, setStartDate] = useState('');
  const [useDuration, setUseDuration] = useState(false);
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('years');

  // Reset form when dialog opens with default values
  useEffect(() => {
    if (open) {
      setPaymentType(paymentTypeOptions[0]?.id || '');
      setPaymentAmount('10000'); // Default amount from API example
      setFrequency('monthly'); // Default frequency
      setNumberOfPayments('36'); // Default number of payments
      setStartDate(''); // User should set this
      setUseDuration(false); // Default to number of payments mode
      setDuration('3'); // Default duration
      setDurationUnit('months'); // Default duration unit from API example
    }
  }, [open, paymentTypeOptions]);

  const calculateNumberOfPayments = () => {
    if (useDuration) {
      const dur = parseInt(duration) || 0;
      if (durationUnit === 'years') {
        if (frequency === 'monthly') return dur * 12;
        if (frequency === 'quarterly') return dur * 4;
        if (frequency === 'annually') return dur;
      } else if (durationUnit === 'months') {
        if (frequency === 'monthly') return dur;
        if (frequency === 'quarterly') return Math.ceil(dur / 3);
        if (frequency === 'annually') return Math.ceil(dur / 12);
      }
    }
    return parseInt(numberOfPayments) || 0;
  };

  const calculateTotalAmount = () => {
    const amount = parseFloat(paymentAmount) || 0;
    const count = calculateNumberOfPayments();
    return amount * count;
  };

  const calculateDuration = () => {
    if (useDuration) {
      const dur = parseInt(duration) || 0;
      return `${dur} ${durationUnit}`;
    }
    const count = parseInt(numberOfPayments) || 0;
    if (frequency === 'monthly') return `${count} months`;
    if (frequency === 'quarterly') return `${Math.ceil(count * 3)} months`;
    if (frequency === 'annually') return `${count} years`;
    return '0 months';
  };

  const generatePayments = () => {
    const amount = parseFloat(paymentAmount);

    if (!amount || !startDate || !paymentType) return;

    // Build the wizard payload based on the mode
    const wizardData: WizardPayload = {
      payment_type_id: paymentType,
      amount: amount,
      frequency: frequency,
      start_date: startDate,
    };

    // Add either number_of_payments or duration fields
    if (useDuration) {
      wizardData.duration = parseInt(duration);
      wizardData.duration_unit = durationUnit;
    } else {
      wizardData.number_of_payments = parseInt(numberOfPayments);
    }

    onGenerate(wizardData);
    onClose();
  };

  const isFormValid = () => {
    if (useDuration) {
      return paymentType && paymentAmount && duration && durationUnit && startDate;
    }
    return paymentType && paymentAmount && numberOfPayments && startDate;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">Payment Wizard</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-base">
            Create a payment schedule by specifying the amount, frequency, and duration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Type */}
          <div className="space-y-2">
            <Label htmlFor="payment-type">Payment Type</Label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger id="payment-type">
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                {paymentTypeOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Payment Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="pl-7"
                placeholder="10000"
              />
            </div>
          </div>

          {/* Duration Toggle */}
          <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <Label>Duration</Label>
                <p className="text-sm text-muted-foreground">Specify total duration, payments calculated automatically</p>
              </div>
              <button
                type="button"
                onClick={() => setUseDuration(!useDuration)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  useDuration ? 'bg-black' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useDuration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Payment Frequency */}
          <div className="space-y-2">
            <Label htmlFor="payment-frequency">Payment Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="payment-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Fields based on Duration Toggle */}
          {useDuration ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration-unit">Duration Unit</Label>
                <Select value={durationUnit} onValueChange={setDurationUnit}>
                  <SelectTrigger id="duration-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="number-of-payments">Number of Payments</Label>
              <Input
                id="number-of-payments"
                type="number"
                value={numberOfPayments}
                onChange={(e) => setNumberOfPayments(e.target.value)}
                placeholder="36"
              />
            </div>
          )}

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* Preview */}
          {isFormValid() && (
            <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-3">Preview</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Frequency:</span>{' '}
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </p>
                <p>
                  <span className="font-medium">Number of Payments:</span> {calculateNumberOfPayments()}
                </p>
                <p>
                  <span className="font-medium">Total Duration:</span> {calculateDuration()}
                </p>
                <p>
                  <span className="font-medium">Total Amount:</span> ${calculateTotalAmount().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={generatePayments} disabled={!isFormValid()}>
            Generate Payments
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

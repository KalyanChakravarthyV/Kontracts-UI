import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { Input } from '@/components/lease-dashboard/ui/input';
import { Label } from '@/components/lease-dashboard/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/lease-dashboard/ui/select';
import { Textarea } from '@/components/lease-dashboard/ui/textarea';
import { Button } from '@/components/lease-dashboard/ui/button';
import { Calendar } from 'lucide-react';

interface LeaseFormProps {
  onSubmit?: (data: LeaseFormData) => void;
}

export interface LeaseFormData {
  // Lease Identification
  leaseId: string;
  leaseName: string;
  leaseType: string;
  status: string;
  
  // Tenant Information
  tenantName: string;
  tenantContact: string;
  tenantEmail: string;
  tenantPhone: string;
  
  // Property/Asset Information
  propertyAddress: string;
  propertyType: string;
  assetDescription: string;
  assetClass: string;
  
  // Lease Dates
  commencementDate: string;
  startDate: string;
  endDate: string;
  rentStartDate: string;
  
  // Financial Terms
  baseRent: string;
  paymentFrequency: string;
  currency: string;
  escalationRate: string;
  escalationType: string;
  
  // Additional Costs
  commonAreaMaintenance: string;
  insurance: string;
  propertyTax: string;
  securityDeposit: string;
  
  // Accounting
  discountRate: string;
  accountingStandard: string;
  classification: string;
  
  // Options
  renewalOption: boolean;
  renewalTerm: string;
  purchaseOption: boolean;
  purchasePrice: string;
  
  // Notes
  notes: string;
}

export function LeaseForm({ onSubmit }: LeaseFormProps) {
  const [formData, setFormData] = useState<LeaseFormData>({
    leaseId: '',
    leaseName: '',
    leaseType: 'real-estate',
    status: 'active',
    tenantName: '',
    tenantContact: '',
    tenantEmail: '',
    tenantPhone: '',
    propertyAddress: '',
    propertyType: 'office',
    assetDescription: '',
    assetClass: '',
    commencementDate: '',
    startDate: '',
    endDate: '',
    rentStartDate: '',
    baseRent: '',
    paymentFrequency: 'monthly',
    currency: 'USD',
    escalationRate: '',
    escalationType: 'fixed',
    commonAreaMaintenance: '',
    insurance: '',
    propertyTax: '',
    securityDeposit: '',
    discountRate: '',
    accountingStandard: 'ASC842',
    classification: 'operating',
    renewalOption: false,
    renewalTerm: '',
    purchaseOption: false,
    purchasePrice: '',
    notes: '',
  });

  const handleChange = (field: keyof LeaseFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Lease Identification */}
      <Card>
        <CardHeader>
          <CardTitle>Lease Identification</CardTitle>
          <CardDescription>Basic lease information and identifiers</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="leaseId">Lease ID</Label>
            <Input
              id="leaseId"
              value={formData.leaseId}
              onChange={(e) => handleChange('leaseId', e.target.value)}
              placeholder="L-2024-001"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="leaseName">Lease Name</Label>
            <Input
              id="leaseName"
              value={formData.leaseName}
              onChange={(e) => handleChange('leaseName', e.target.value)}
              placeholder="Main Street Office Lease"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="leaseType">Lease Type</Label>
            <Select value={formData.leaseType} onValueChange={(value) => handleChange('leaseType', value)}>
              <SelectTrigger id="leaseType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="real-estate">Real Estate</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tenant Information */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Information</CardTitle>
          <CardDescription>Details about the lessee</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tenantName">Tenant Name</Label>
            <Input
              id="tenantName"
              value={formData.tenantName}
              onChange={(e) => handleChange('tenantName', e.target.value)}
              placeholder="ABC Corporation"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tenantContact">Contact Person</Label>
            <Input
              id="tenantContact"
              value={formData.tenantContact}
              onChange={(e) => handleChange('tenantContact', e.target.value)}
              placeholder="John Smith"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tenantEmail">Email</Label>
            <Input
              id="tenantEmail"
              type="email"
              value={formData.tenantEmail}
              onChange={(e) => handleChange('tenantEmail', e.target.value)}
              placeholder="john.smith@abc.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tenantPhone">Phone</Label>
            <Input
              id="tenantPhone"
              type="tel"
              value={formData.tenantPhone}
              onChange={(e) => handleChange('tenantPhone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </CardContent>
      </Card>

      {/* Property/Asset Information */}
      <Card>
        <CardHeader>
          <CardTitle>Property/Asset Information</CardTitle>
          <CardDescription>Details about the leased asset</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="propertyAddress">Property Address</Label>
            <Input
              id="propertyAddress"
              value={formData.propertyAddress}
              onChange={(e) => handleChange('propertyAddress', e.target.value)}
              placeholder="123 Main Street, Suite 100, New York, NY 10001"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type</Label>
            <Select value={formData.propertyType} onValueChange={(value) => handleChange('propertyType', value)}>
              <SelectTrigger id="propertyType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assetClass">Asset Class</Label>
            <Input
              id="assetClass"
              value={formData.assetClass}
              onChange={(e) => handleChange('assetClass', e.target.value)}
              placeholder="Commercial Real Estate"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="assetDescription">Asset Description</Label>
            <Textarea
              id="assetDescription"
              value={formData.assetDescription}
              onChange={(e) => handleChange('assetDescription', e.target.value)}
              placeholder="5,000 sq ft office space on the 10th floor"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lease Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Lease Dates</CardTitle>
          <CardDescription>Key dates for the lease agreement</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="commencementDate">Commencement Date</Label>
            <div className="relative">
              <Input
                id="commencementDate"
                type="date"
                value={formData.commencementDate}
                onChange={(e) => handleChange('commencementDate', e.target.value)}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDate">Lease Start Date</Label>
            <div className="relative">
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">Lease End Date</Label>
            <div className="relative">
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rentStartDate">Rent Start Date</Label>
            <div className="relative">
              <Input
                id="rentStartDate"
                type="date"
                value={formData.rentStartDate}
                onChange={(e) => handleChange('rentStartDate', e.target.value)}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Terms</CardTitle>
          <CardDescription>Payment and escalation details</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="baseRent">Base Rent</Label>
            <Input
              id="baseRent"
              type="number"
              step="0.01"
              value={formData.baseRent}
              onChange={(e) => handleChange('baseRent', e.target.value)}
              placeholder="10000.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentFrequency">Payment Frequency</Label>
            <Select value={formData.paymentFrequency} onValueChange={(value) => handleChange('paymentFrequency', value)}>
              <SelectTrigger id="paymentFrequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="escalationType">Escalation Type</Label>
            <Select value={formData.escalationType} onValueChange={(value) => handleChange('escalationType', value)}>
              <SelectTrigger id="escalationType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="cpi">CPI Index</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="escalationRate">Escalation Rate (%)</Label>
            <Input
              id="escalationRate"
              type="number"
              step="0.01"
              value={formData.escalationRate}
              onChange={(e) => handleChange('escalationRate', e.target.value)}
              placeholder="3.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="discountRate">Discount Rate (%)</Label>
            <Input
              id="discountRate"
              type="number"
              step="0.01"
              value={formData.discountRate}
              onChange={(e) => handleChange('discountRate', e.target.value)}
              placeholder="5.00"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Costs */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Costs</CardTitle>
          <CardDescription>Other fees and charges</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="commonAreaMaintenance">Common Area Maintenance (CAM)</Label>
            <Input
              id="commonAreaMaintenance"
              type="number"
              step="0.01"
              value={formData.commonAreaMaintenance}
              onChange={(e) => handleChange('commonAreaMaintenance', e.target.value)}
              placeholder="1500.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance</Label>
            <Input
              id="insurance"
              type="number"
              step="0.01"
              value={formData.insurance}
              onChange={(e) => handleChange('insurance', e.target.value)}
              placeholder="500.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="propertyTax">Property Tax</Label>
            <Input
              id="propertyTax"
              type="number"
              step="0.01"
              value={formData.propertyTax}
              onChange={(e) => handleChange('propertyTax', e.target.value)}
              placeholder="800.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="securityDeposit">Security Deposit</Label>
            <Input
              id="securityDeposit"
              type="number"
              step="0.01"
              value={formData.securityDeposit}
              onChange={(e) => handleChange('securityDeposit', e.target.value)}
              placeholder="20000.00"
            />
          </div>
        </CardContent>
      </Card>

      {/* Accounting Classification */}
      <Card>
        <CardHeader>
          <CardTitle>Accounting Classification</CardTitle>
          <CardDescription>Accounting standard and lease classification</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accountingStandard">Accounting Standard</Label>
            <Select value={formData.accountingStandard} onValueChange={(value) => handleChange('accountingStandard', value)}>
              <SelectTrigger id="accountingStandard">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ASC842">ASC 842 (US GAAP)</SelectItem>
                <SelectItem value="IFRS16">IFRS 16</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="classification">Lease Classification</Label>
            <Select value={formData.classification} onValueChange={(value) => handleChange('classification', value)}>
              <SelectTrigger id="classification">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operating">Operating Lease</SelectItem>
                <SelectItem value="finance">Finance Lease</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lease Options */}
      <Card>
        <CardHeader>
          <CardTitle>Lease Options</CardTitle>
          <CardDescription>Renewal and purchase options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="renewalOption"
              checked={formData.renewalOption}
              onChange={(e) => handleChange('renewalOption', e.target.checked)}
              className="size-4"
            />
            <Label htmlFor="renewalOption">Renewal Option Available</Label>
          </div>
          
          {formData.renewalOption && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="renewalTerm">Renewal Term (months)</Label>
              <Input
                id="renewalTerm"
                type="number"
                value={formData.renewalTerm}
                onChange={(e) => handleChange('renewalTerm', e.target.value)}
                placeholder="12"
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="purchaseOption"
              checked={formData.purchaseOption}
              onChange={(e) => handleChange('purchaseOption', e.target.checked)}
              className="size-4"
            />
            <Label htmlFor="purchaseOption">Purchase Option Available</Label>
          </div>
          
          {formData.purchaseOption && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => handleChange('purchasePrice', e.target.value)}
                placeholder="250000.00"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>Any additional information or comments</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Enter any additional notes or special terms..."
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Save Lease</Button>
      </div>
    </form>
  );
}

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/lease-dashboard/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { LeaseForm } from '@/components/lease-dashboard/LeaseForm';
import { PaymentSchedule } from '@/components/lease-dashboard/PaymentSchedule';
import type { PaymentScheduleItem } from '@/components/lease-dashboard/PaymentSchedule';
import { ASC842Schedule } from '@/components/lease-dashboard/ASC842Schedule';
import { IFRS16Schedule } from '@/components/lease-dashboard/IFRS16Schedule';
import type { IFRS16ScheduleItem } from '@/components/lease-dashboard/IFRS16Schedule';
import { JournalEntries } from '@/components/lease-dashboard/JournalEntries';
import type { JournalEntry } from '@/components/lease-dashboard/JournalEntries';
import { FileText, DollarSign, BookOpen, Receipt } from 'lucide-react';
import axios from "axios";
import { useAuth0 } from '@auth0/auth0-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { API_BASE_URL } from '@/config/api';

type LeaseDetailsProps = {
  contractId: number;
};

export default function LeaseDetails({ contractId }: LeaseDetailsProps) {
  const dispatch = useAppDispatch();
  const { leaseData } = useAppSelector(
    (state) => state.existingLease
  );
  console.log("lease data", leaseData)
  console.log("existing lease", leaseData)
  const [activeTab, setActiveTab] = useState('form');
  const [paymentScheduleData, setPaymentScheduleData] = useState([])
  const [asc842ScheduleData, setASC842ScheduleData] = useState<any>(null)

  // Sample Payment Schedule Data
  const samplePayments: PaymentScheduleItem[] = generateSamplePayments();


  // Sample IFRS 16 Schedule Data
  const sampleIFRS16: IFRS16ScheduleItem[] = generateSampleIFRS16();

  // Sample Journal Entries
  const sampleJournalEntries: JournalEntry[] = generateSampleJournalEntries();
  useEffect(() => {
    if (contractId) {
      fetchPayments()
      fetchASC842Schedule()
    }

  }, [contractId])
  const fetchPayments = async () => {
    try {
      const accessToken = await getAccessTokenSilently();
      const response = await axios.get(
        `${API_BASE_URL}/payments/`,
        {
          params: {
            skip: 0,
            limit: 100,
            contract_id: contractId,
            sort_by: "due_date",
            sort_order: "asc",
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response && response?.data && response?.data?.length) {
          setPaymentScheduleData(response.data)
      }
      
      console.log("fetched payments successfully", response.data);
    } catch (error) {
      console.error("Error fetching payment", error);
    }
  }
   const fetchASC842Schedule = async () => {
    try {
      const accessToken = await getAccessTokenSilently();
      const response = await axios.get(
        `${API_BASE_URL}/schedules/asc842/${contractId}`,
        {
          params: {
           format: "json"
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response?.data) {
          setASC842ScheduleData(response.data)
      }
      
      console.log("fetched asc842 schedule successfully", response.data);
    } catch (error) {
      console.error("Error fetching asc842 schedule", error);
    }
  }
  
  const { getAccessTokenSilently } = useAuth0();
  const handleAddPayment = (data: any)=>{
    console.log("data", data)
  }

  const handleSubmittedCreateLeaseFields = async (values: any) => {
    console.log("submitted create lease payload", values);

    try {
      const accessToken = await getAccessTokenSilently();
      console.log("accesstoken", accessToken)
      await axios.post(`${API_BASE_URL}/leases/`, values,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // token from auth
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Lease created successfully");
    } catch (error) {
      console.error("Error creating lease", error);
    }
  }

  return (
    <div className="size-full overflow-auto bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Lease Management System</h1>
          <p className="text-gray-600">
            Comprehensive lease accounting based on ASC 842 and IFRS 16 standards
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <FileText className="size-4" />
              Lease Form
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="size-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="asc842" className="flex items-center gap-2">
              <BookOpen className="size-4" />
              ASC 842
            </TabsTrigger>
            <TabsTrigger value="ifrs16" className="flex items-center gap-2">
              <BookOpen className="size-4" />
              IFRS 16
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-2">
              <Receipt className="size-4" />
              Journal Entries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>Lease Information Form</CardTitle>
                <CardDescription>
                  Enter all lease details including tenant information, property details, and financial terms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaseForm existingLease={leaseData} onSubmit={(data) => handleSubmittedCreateLeaseFields(data)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <PaymentSchedule contractId={contractId} paymentsList={paymentScheduleData} onPaymentAdded={handleAddPayment} currency="USD" />
          </TabsContent>

          <TabsContent value="asc842">
            <ASC842Schedule
              schedule={asc842ScheduleData}
              classification="operating"
              currency="USD"
            />
          </TabsContent>

          <TabsContent value="ifrs16">
            <IFRS16Schedule
              schedule={sampleIFRS16}
              initialROU={360000}
              initialLiability={360000}
              currency="USD"
            />
          </TabsContent>

          <TabsContent value="journal">
            <JournalEntries entries={sampleJournalEntries} currency="USD" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper function to generate sample payment schedule
function generateSamplePayments(): PaymentScheduleItem[] {
  const payments: PaymentScheduleItem[] = [];
  const monthlyRent = 10000;
  const cam = 1500;
  const insurance = 500;
  const propertyTax = 800;
  const discountRate = 0.05 / 12; // 5% annual rate
  let liability = 360000;

  for (let i = 1; i <= 36; i++) {
    const date = new Date(2024, i - 1, 1);
    const interestPayment = liability * discountRate;
    const totalPayment = monthlyRent + cam + insurance + propertyTax;
    const principalPayment = monthlyRent - interestPayment;
    liability = Math.max(0, liability - principalPayment);

    let status: PaymentScheduleItem['status'] = 'upcoming';
    if (i <= 3) status = 'paid';
    else if (i === 4) status = 'pending';

    payments.push({
      period: i,
      date: date.toISOString().split('T')[0],
      baseRent: monthlyRent,
      cam,
      insurance,
      propertyTax,
      totalPayment,
      principalPayment,
      interestPayment,
      leaseliabilityBalance: liability,
      status,
    });
  }

  return payments;
}


// Helper function to generate sample IFRS 16 schedule
function generateSampleIFRS16(): IFRS16ScheduleItem[] {
  const schedule: IFRS16ScheduleItem[] = [];
  const monthlyRent = 10000;
  const discountRate = 0.05 / 12;
  let rouAsset = 360000;
  let liability = 360000;
  const depreciationExpense = rouAsset / 36;

  for (let i = 1; i <= 36; i++) {
    const date = new Date(2024, i - 1, 1);
    const interestExpense = liability * discountRate;
    const principalReduction = monthlyRent - interestExpense;

    liability = Math.max(0, liability - principalReduction);
    rouAsset = Math.max(0, rouAsset - depreciationExpense);

    schedule.push({
      period: i,
      date: date.toISOString().split('T')[0],
      leasePayment: monthlyRent,
      interestExpense,
      depreciationExpense,
      rouAssetBalance: rouAsset,
      leaseLiabilityBalance: liability,
      totalExpense: interestExpense + depreciationExpense,
    });
  }

  return schedule;
}

// Helper function to generate sample journal entries
function generateSampleJournalEntries(): JournalEntry[] {
  return [
    {
      entryId: 'JE-001',
      date: '2024-01-01',
      period: 0,
      description: 'Initial recognition of lease',
      entryType: 'initial-recognition',
      reference: 'Lease L-2024-001',
      lineItems: [
        {
          account: 'Right-of-Use Asset',
          accountCode: '1500',
          accountType: 'asset',
          debit: 360000,
          credit: 0,
        },
        {
          account: 'Lease Liability',
          accountCode: '2100',
          accountType: 'liability',
          debit: 0,
          credit: 360000,
        },
      ],
    },
    {
      entryId: 'JE-002',
      date: '2024-01-31',
      period: 1,
      description: 'Monthly lease payment - Period 1',
      entryType: 'periodic-payment',
      reference: 'Lease L-2024-001',
      lineItems: [
        {
          account: 'Lease Liability',
          accountCode: '2100',
          accountType: 'liability',
          debit: 8500,
          credit: 0,
        },
        {
          account: 'Interest Expense',
          accountCode: '7200',
          accountType: 'expense',
          debit: 1500,
          credit: 0,
        },
        {
          account: 'Cash',
          accountCode: '1000',
          accountType: 'cash',
          debit: 0,
          credit: 10000,
        },
      ],
    },
    {
      entryId: 'JE-003',
      date: '2024-01-31',
      period: 1,
      description: 'ROU asset depreciation - Period 1',
      entryType: 'depreciation',
      reference: 'Lease L-2024-001',
      lineItems: [
        {
          account: 'Depreciation Expense - ROU Asset',
          accountCode: '7100',
          accountType: 'expense',
          debit: 10000,
          credit: 0,
        },
        {
          account: 'Accumulated Depreciation - ROU Asset',
          accountCode: '1505',
          accountType: 'asset',
          debit: 0,
          credit: 10000,
        },
      ],
    },
    {
      entryId: 'JE-004',
      date: '2024-02-29',
      period: 2,
      description: 'Monthly lease payment - Period 2',
      entryType: 'periodic-payment',
      reference: 'Lease L-2024-001',
      lineItems: [
        {
          account: 'Lease Liability',
          accountCode: '2100',
          accountType: 'liability',
          debit: 8535,
          credit: 0,
        },
        {
          account: 'Interest Expense',
          accountCode: '7200',
          accountType: 'expense',
          debit: 1465,
          credit: 0,
        },
        {
          account: 'Cash',
          accountCode: '1000',
          accountType: 'cash',
          debit: 0,
          credit: 10000,
        },
      ],
    },
    {
      entryId: 'JE-005',
      date: '2024-02-29',
      period: 2,
      description: 'ROU asset depreciation - Period 2',
      entryType: 'depreciation',
      reference: 'Lease L-2024-001',
      lineItems: [
        {
          account: 'Depreciation Expense - ROU Asset',
          accountCode: '7100',
          accountType: 'expense',
          debit: 10000,
          credit: 0,
        },
        {
          account: 'Accumulated Depreciation - ROU Asset',
          accountCode: '1505',
          accountType: 'asset',
          debit: 0,
          credit: 10000,
        },
      ],
    },
  ];
}

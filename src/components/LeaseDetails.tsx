import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/lease-dashboard/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lease-dashboard/ui/card';
import { LeaseForm } from '@/components/lease-dashboard/LeaseForm';
import { PaymentSchedule } from '@/components/lease-dashboard/PaymentSchedule';
import type { PaymentScheduleItem } from '@/components/lease-dashboard/PaymentSchedule';
import { ASC842Schedule } from '@/components/lease-dashboard/ASC842Schedule';
import { IFRS16Schedule } from '@/components/lease-dashboard/IFRS16Schedule';
import { JournalEntries } from '@/components/lease-dashboard/JournalEntries';
import type { JournalEntryResponse } from '@/components/lease-dashboard/JournalEntries';
import { AlertMessage } from '@/components/common/AlertMessage';
import { FileText, DollarSign, BookOpen, Receipt } from 'lucide-react';
import axios from "axios";
import { useAuthToken } from '@/hooks/use-auth-token';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCreatedLeaseId } from '@/store/slices/newLeaseSlice';
import { setSuccessMessage, setErrorMessage } from '@/store/slices/alertMessageSlice';
import { setExistingLease } from '@/store/slices/existingLeaseSlice';
import { API_BASE_URL } from '@/config/api';

type LeaseDetailsProps = {
  contractId: number;
};

export default function LeaseDetails({ contractId }: LeaseDetailsProps) {
  const dispatch = useAppDispatch();
  const { leaseData } = useAppSelector(
    (state) => state.existingLease
  );
  const { createdLeaseId } = useAppSelector(
    (state) => state.newLease
  );
  console.log("lease data", leaseData)
  console.log("existing lease", leaseData)
  const [activeTab, setActiveTab] = useState('form');
  const [paymentScheduleData, setPaymentScheduleData] = useState([])
  const [asc842ScheduleData, setASC842ScheduleData] = useState<any>(null)
  const [ifrs16ScheduleData, setIFRS16ScheduleData] = useState<any>(null)
  const [isGeneratingASC842, setIsGeneratingASC842] = useState(false)
  const [isGeneratingIFRS16, setIsGeneratingIFRS16] = useState(false)
  const [journalEntriesData, setJournalEntriesData] = useState<JournalEntryResponse[]>([])
  const [isGeneratingJournals, setIsGeneratingJournals] = useState(false)
  useEffect(() => {
    if (contractId) {
      Promise.all([
        fetchPayments(),
        fetchASC842Schedule(),
        fetchIFRS16Schedule(),
        fetchJournalEntries(),
      ]);
    }
  }, [contractId])
  const fetchPayments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/payments/`,
        {
          params: {
            skip: 0,
            limit: 100,
            lease_id: contractId,
            sort_by: "due_date",
            sort_order: "asc",
          },
          headers: { ...(await getHeaders()), "Content-Type": "application/json" },
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
      const response = await axios.get(
        `${API_BASE_URL}/schedules/asc842/${contractId}`,
        {
          params: { format: "json" },
          headers: { ...(await getHeaders()), "Content-Type": "application/json" },
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
  const fetchIFRS16Schedule = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/schedules/ifrs16/${contractId}`,
        {
          params: { format: "json" },
          headers: { ...(await getHeaders()), "Content-Type": "application/json" },
        }
      );
      if (response?.data) {
          setIFRS16ScheduleData(response.data)
      }
      
      console.log("fetched ifrs16 schedule successfully", response.data);
    } catch (error) {
      console.error("Error fetching ifrs16 schedule", error);
    }
  }
  const { getHeaders } = useAuthToken();
  
  const exportASC842Schedule = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/schedules/asc842/${contractId}`,
        {
          params: { format: "excel" },
          headers: { ...(await getHeaders()), "Content-Type": "application/json" },
          responseType: 'blob',
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ASC842_Schedule_${contractId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      console.log("exported asc842 schedule successfully");
      // Dispatch success message
      dispatch(setSuccessMessage('ASC842 schedule exported successfully!'));
    } catch (error) {
      console.error("Error exporting asc842 schedule", error);
      // Dispatch error message
      dispatch(setErrorMessage('Failed to export ASC842 schedule. Please try again.'));
    }
  }

  const exportIFRS16Schedule = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/schedules/ifrs16/${contractId}`,
        {
          params: { format: "excel" },
          headers: { ...(await getHeaders()), "Content-Type": "application/json" },
          responseType: 'blob',
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `IFRS16_Schedule_${contractId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      console.log("exported ifrs16 schedule successfully");
      // Dispatch success message
      dispatch(setSuccessMessage('IFRS16 schedule exported successfully!'));
    } catch (error) {
      console.error("Error exporting ifrs16 schedule", error);
      // Dispatch error message
      dispatch(setErrorMessage('Failed to export IFRS16 schedule. Please try again.'));
    }
  }
  const generateASC842 = async () => {
    if (!contractId) {
      dispatch(setErrorMessage('No lease ID available'));
      return;
    }

    try {
      setIsGeneratingASC842(true);
      const response = await axios.post(
        `${API_BASE_URL}/schedules/asc842/${contractId}`,
        {},
        { headers: { ...(await getHeaders()), 'Content-Type': 'application/json' } }
      );

      if (response?.data) {
        console.log('ASC842 schedule generated successfully:', response.data);
        dispatch(setSuccessMessage('ASC842 schedule generated successfully!'));

        // Refetch the ASC842 schedule data
        await fetchASC842Schedule();
      }
    } catch (error) {
      console.error('Error generating ASC842 schedule:', error);
      dispatch(setErrorMessage('Failed to generate ASC842 schedule. Please try again.'));
    } finally {
      setIsGeneratingASC842(false);
    }
  };

  const deleteExistingASC842Schedule = async () => {
    if (!contractId) {
      dispatch(setErrorMessage('No lease ID available'));
      return;
    }

    try {
      setIsGeneratingASC842(true);
      await axios.delete(
        `${API_BASE_URL}/schedules/asc842/${contractId}`,
        { headers: await getHeaders() }
      );

      console.log('ASC842 schedule deleted successfully');

      // After successful deletion, regenerate the schedule
      await generateASC842();
    } catch (error) {
      console.error('Error deleting ASC842 schedule:', error);
      dispatch(setErrorMessage('Failed to delete ASC842 schedule. Please try again.'));
      setIsGeneratingASC842(false);
    }
  };

  const handleGenerateOrRegenerateASC842 = async (param: string) => {
    if (param === 'Generate') {
      await generateASC842();
    } else {
      await deleteExistingASC842Schedule();
    }
  };

  const generateIFRS16 = async () => {
    if (!contractId) {
      dispatch(setErrorMessage('No lease ID available'));
      return;
    }

    try {
      setIsGeneratingIFRS16(true);
      const response = await axios.post(
        `${API_BASE_URL}/schedules/ifrs16/${contractId}`,
        {},
        { headers: { ...(await getHeaders()), 'Content-Type': 'application/json' } }
      );

      if (response?.data) {
        console.log('IFRS16 schedule generated successfully:', response.data);
        dispatch(setSuccessMessage('IFRS16 schedule generated successfully!'));

        // Refetch the IFRS16 schedule data
        await fetchIFRS16Schedule();
      }
    } catch (error) {
      console.error('Error generating IFRS16 schedule:', error);
      dispatch(setErrorMessage('Failed to generate IFRS16 schedule. Please try again.'));
    } finally {
      setIsGeneratingIFRS16(false);
    }
  };

  const deleteExistingIFRS16Schedule = async () => {
    if (!contractId) {
      dispatch(setErrorMessage('No lease ID available'));
      return;
    }

    try {
      setIsGeneratingIFRS16(true);
      await axios.delete(
        `${API_BASE_URL}/schedules/ifrs16/${contractId}`,
        { headers: await getHeaders() }
      );

      console.log('IFRS16 schedule deleted successfully');

      // After successful deletion, regenerate the schedule
      await generateIFRS16();
    } catch (error) {
      console.error('Error deleting IFRS16 schedule:', error);
      dispatch(setErrorMessage('Failed to delete IFRS16 schedule. Please try again.'));
      setIsGeneratingIFRS16(false);
    }
  };

  const handleGenerateOrRegenerateIFRS16 = async (param: string) => {
    if (param === 'Generate') {
      await generateIFRS16();
    } else {
      await deleteExistingIFRS16Schedule();
    }
  };

  const fetchJournalEntries = async () => {
    if (!contractId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/journal-entries/`, {
        params: { lease_id: contractId, limit: 1000 },
        headers: await getHeaders(),
      });
      if (Array.isArray(response.data)) {
        setJournalEntriesData(response.data);
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  };

  const generateJournalEntries = async () => {
    const leaseId = createdLeaseId || contractId;
    if (!leaseId) {
      dispatch(setErrorMessage('No lease ID available'));
      return;
    }
    try {
      setIsGeneratingJournals(true);
      const scheduleType = leaseData?.classification === 'finance' ? 'IFRS16' : 'ASC842';
      const hasExisting = journalEntriesData.length > 0;
      const method = hasExisting ? 'put' : 'post';
      const response = await axios[method](
        `${API_BASE_URL}/journal-entries/lease/${leaseId}`,
        {},
        {
          params: { schedule_type: scheduleType },
          headers: { ...(await getHeaders()), 'Content-Type': 'application/json' },
        }
      );
      if (response?.data) {
        dispatch(setSuccessMessage(`Journal entries ${hasExisting ? 'regenerated' : 'generated'} successfully!`));
        await fetchJournalEntries();
      }
    } catch (error) {
      console.error('Error generating journal entries:', error);
      dispatch(setErrorMessage('Failed to generate journal entries. Please try again.'));
    } finally {
      setIsGeneratingJournals(false);
    }
  };

  const handleGenerateOrRegenerateJournals = async (_param: string) => {
    await generateJournalEntries();
  };
  const handleAddPayment = (data: any)=>{
    console.log("data", data)
  }

  const transformLeasePayload = (values: any) => {
    // Transform string values to numbers for numeric fields
    return {
      ...values,
      initial_direct_costs: parseFloat(values.initial_direct_costs) || 0,
      prepaid_rent: parseFloat(values.prepaid_rent) || 0,
      lease_incentives: parseFloat(values.lease_incentives) || 0,
      residual_value: parseFloat(values.residual_value) || 0,
      incremental_borrowing_rate: parseFloat(values.incremental_borrowing_rate) || 0,
      discount_rate: parseFloat(values.discount_rate) || 0,
    };
  };

  const handleSubmittedCreateLeaseFields = async (values: any) => {
    console.log("submitted create lease payload", values);

    try {
      const transformedPayload = transformLeasePayload(values);
      console.log("transformed payload", transformedPayload);

      const response = await axios.post(`${API_BASE_URL}/leases/`, transformedPayload,
        { headers: { ...(await getHeaders()), "Content-Type": "application/json" } }
      );
      console.log("Lease created successfully", response.data);
      
      // Dispatch the created lease ID to Redux store
      if (response.data && response.data.id) {
        dispatch(setCreatedLeaseId(response.data.id.toString()));
        console.log("Created lease ID set:", response.data.id);
      }
      
      // Dispatch success message
      dispatch(setSuccessMessage("Lease created successfully!"));
    } catch (error) {
      console.error("Error creating lease", error);
      // Dispatch error message
      dispatch(setErrorMessage("Failed to create lease. Please try again."));
    }
  }

  const fetchLeaseData = async (leaseId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leases/${leaseId}`, {
        headers: { ...(await getHeaders()), "Content-Type": "application/json" },
      });
      
      if (response.data) {
        // Update Redux store with the latest lease data
        dispatch(setExistingLease(response.data));
        console.log("Lease data refreshed:", response.data);
      }
    } catch (error) {
      console.error("Error fetching lease data:", error);
    }
  };

  const handleUpdateLease = async (values: any) => {
    console.log("submitted update lease payload", values);

    try {
      const transformedPayload = transformLeasePayload(values);
      console.log("transformed payload for update", transformedPayload);

      // Use createdLeaseId (for newly created leases) or contractId (for existing leases)
      const leaseIdToUpdate = createdLeaseId || contractId;
      const response = await axios.put(`${API_BASE_URL}/leases/${leaseIdToUpdate}`, transformedPayload,
        { headers: { ...(await getHeaders()), "Content-Type": "application/json" } }
      );
      console.log("Lease updated successfully", response.data);
      
      // Update Redux store with updated lease data
      if (response.data && response.data.id) {
        console.log("Lease updated with ID:", response.data.id);
        // Fetch the latest lease data to ensure all fields are up to date
        await fetchLeaseData(response.data.id);
      }
      
      // Dispatch success message
      dispatch(setSuccessMessage("Lease updated successfully!"));
    } catch (error) {
      console.error("Error updating lease", error);
      // Dispatch error message
      dispatch(setErrorMessage("Failed to update lease. Please try again."));
    }
  }

  const handleSubmitLeaseForm = async (values: any) => {
    // Determine if this is a create or update operation
    // Check for createdLeaseId (newly created), leaseData (existing from Redux), or contractId (existing from props)
    if (createdLeaseId || leaseData || contractId) {
      // Existing lease - use PUT method
      await handleUpdateLease(values);
    } else {
      // New lease - use POST method
      await handleSubmittedCreateLeaseFields(values);
    }
  }

  return (
    <div className="size-full overflow-auto bg-gray-50">
      <AlertMessage />
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
                <LeaseForm existingLease={leaseData} onSubmit={(data) => handleSubmitLeaseForm(data)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <PaymentSchedule 
              contractId={contractId} 
              paymentsList={paymentScheduleData} 
              onPaymentAdded={handleAddPayment} 
              onPaymentChanged={fetchPayments}
              currency="USD" 
            />
          </TabsContent>

          <TabsContent value="asc842">
            <ASC842Schedule
              schedule={asc842ScheduleData}
              existingLease={leaseData}
              paymentsList={paymentScheduleData}
              classification="operating"
              currency="USD"
              isGenerating={isGeneratingASC842}
              handleGenerateOrRegenerate={handleGenerateOrRegenerateASC842}
              onExport={exportASC842Schedule}
            />
          </TabsContent>

          <TabsContent value="ifrs16">
            <IFRS16Schedule
              schedule={ifrs16ScheduleData}
              existingLease={leaseData}
              paymentsList={paymentScheduleData}
              currency="USD"
              isGenerating={isGeneratingIFRS16}
              handleGenerateOrRegenerate={handleGenerateOrRegenerateIFRS16}
              onExport={exportIFRS16Schedule}
            />
          </TabsContent>

          <TabsContent value="journal">
            <JournalEntries
              entries={journalEntriesData}
              currency="USD"
              isGenerating={isGeneratingJournals}
              hasLeaseId={!!(createdLeaseId || contractId)}
              handleGenerateOrRegenerate={handleGenerateOrRegenerateJournals}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


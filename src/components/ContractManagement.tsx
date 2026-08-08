import { useState, useEffect, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import axios from "axios";
import { useAuthToken } from '@/hooks/use-auth-token';
import { GlobalJournalEntries } from '@/components/lease-dashboard/GlobalJournalEntries';
import { GlobalPayments } from '@/components/lease-dashboard/GlobalPayments';
import LeaseDetails from '@/components/LeaseDetails'
import LeaseModal from '@/components/LeaseModal'
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setExistingLease, clearExistingLease } from '@/store/slices/existingLeaseSlice';
import { AlertMessage } from '@/components/common/AlertMessage';
import { API_BASE_URL } from '@/config/api';
import { ChevronDown, ChevronRight, ChevronUp, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';


interface ContractManagementProps {
  initialTab?: string;
}

type ContractSortField = 'lease_name' | 'status' | 'classification' | 'commencement_date' | 'end_date';
type ContractSortOrder = 'asc' | 'desc';
type ContractGroupField = 'classification' | 'status' | 'lessee_name' | null;

export function ContractManagement({ initialTab = 'contracts' }: ContractManagementProps = {}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [openLeaseModal, setOpenLeaseModal] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>('');
  const [isLoadingLeaseDetails, setIsLoadingLeaseDetails] = useState(false);


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(500);

  // Grouping and sorting state for contracts
  const [contractSortBy, setContractSortBy] = useState<ContractSortField>('lease_name');
  const [contractSortOrder, setContractSortOrder] = useState<ContractSortOrder>('asc');
  const [contractGroupBy, setContractGroupBy] = useState<ContractGroupField>(null);
  const [expandedContractGroups, setExpandedContractGroups] = useState<Set<string>>(new Set());
  const [isLoadingContract, setIsLoadingContract] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const dispatch = useAppDispatch()
  const { getHeaders: getAccessTokenSilently } = useAuthToken();

  // Get createdLeaseId from Redux store
  const { createdLeaseId } = useAppSelector((state) => state.newLease);

  const getLeasesApi = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leases/`, {
        headers: await getAccessTokenSilently(),
      });

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('API call failed:', error);
    }
    return []
  };


  const { data: contracts, isLoading: contractsLoading } = useQuery({
    queryKey: ['/api/contracts'],
    queryFn: getLeasesApi
  });

  // Refetch contracts when a new lease is created
  useEffect(() => {
    if (createdLeaseId) {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
    }
  }, [createdLeaseId, queryClient]);

  // Pagination calculations
  const contractsList = Array.isArray(contracts) ? contracts : [];
  const totalPages = Math.ceil(contractsList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContracts = contractsList.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when contracts change
  useEffect(() => {
    setCurrentPage(1);
  }, [contracts?.length]);


  const complianceScheduleMutation = useMutation({
    mutationFn: async ({
      contractId,
      type,
    }: {
      contractId: string;
      type: string;
      data: any;
    }) => {
      const schedulePath = type === 'IFRS16' ? 'ifrs16' : 'asc842';
      return await axios.post(
        `${API_BASE_URL}/schedules/${schedulePath}/${contractId}`,
        {},
        { headers: await getAccessTokenSilently() }
      );
    },
    onSuccess: () => {
      toast({
        title: 'Compliance schedule generated',
        description: 'The schedule and payment records have been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/compliance-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
    },
    onError: error => {
      toast({
        title: 'Failed to generate schedule',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const journalEntryMutation = useMutation({
    mutationFn: async ({
      contractId,
    }: {
      contractId: string;
      scheduleType: string;
    }) => {
      return await axios.post(
        `${API_BASE_URL}/journal-entries/lease/${contractId}`,
        {},
        { headers: await getAccessTokenSilently() }
      );
    },
    onSuccess: () => {
      toast({
        title: 'Journal entries generated',
        description: 'The entries have been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
    },
    onError: error => {
      toast({
        title: 'Failed to generate entries',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleGenerateSchedule = async (contractId: string, type: 'ASC842' | 'IFRS16') => {
    complianceScheduleMutation.mutate({ contractId, type, data: undefined });
  };

  const handleGenerateJournal = async (contractId: string, scheduleType: string) => {
    journalEntryMutation.mutate({ contractId, scheduleType });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-600';
      case 'renewal due':
        return 'bg-amber-100 text-amber-600';
      case 'expired':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'real estate':
        return 'bg-blue-100 text-blue-600';
      case 'equipment':
        return 'bg-purple-100 text-purple-600';
      case 'software':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleContractSort = (field: ContractSortField) => {
    if (field === contractSortBy) {
      setContractSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setContractSortBy(field);
      setContractSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const toggleContractGroup = (key: string) => {
    const newSet = new Set(expandedContractGroups);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedContractGroups(newSet);
  };

  const toggleAllContractGroups = (show: boolean) => {
    if (show && contractGroupBy) {
      const groupedContracts = getGroupedAndSortedContracts();
      setExpandedContractGroups(new Set(groupedContracts.map(g => g.key)));
    } else {
      setExpandedContractGroups(new Set());
    }
  };

  const getContractGroupKey = (contract: any): string => {
    if (!contractGroupBy) return '';
    if (contractGroupBy === 'classification') {
      return contract.classification || contract.contract_type || 'N/A';
    }
    if (contractGroupBy === 'lessee_name') {
      return contract.lessee_name || 'N/A';
    }
    return String(contract[contractGroupBy] ?? '—');
  };

  const getGroupedAndSortedContracts = () => {
    if (!contracts) return [];

    // Sort contracts
    const sorted = [...contracts].sort((a, b) => {
      let aVal = a[contractSortBy];
      let bVal = b[contractSortBy];

      if (contractSortBy === 'commencement_date' || contractSortBy === 'end_date') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      if (aVal < bVal) return contractSortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return contractSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    if (!contractGroupBy) return [];

    const grouped: { key: string; rows: any[] }[] = [];
    const map = new Map<string, any[]>();
    for (const contract of sorted) {
      const key = getContractGroupKey(contract);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(contract);
    }
    map.forEach((rows, key) => grouped.push({ key, rows }));
    grouped.sort((a, b) => a.key.localeCompare(b.key));
    return grouped;
  };

  const tabs = [
    { id: 'contracts', label: 'Active Contracts' },
    { id: 'payments', label: 'Payments' },
    { id: 'journal', label: 'Journal Entries' },
  ];

  // Payment Schedule View Component
  function PaymentScheduleView({ contracts }: { contracts: any[] }) {
    const { getHeaders } = useAuthToken();

    const { data: summary } = useQuery({
      queryKey: [`${API_BASE_URL}/payments/summary`],
      queryFn: async () => {
        const res = await fetch(`${API_BASE_URL}/payments/summary`, {
          headers: await getHeaders(),
        });
        if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
        return res.json();
      },
    });

    const fmt = (val: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val ?? 0);

    return (
      <div className='space-y-6'>
        {/* Summary — row 1: totals */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          <div className='bg-accent/50 rounded-lg p-4'>
            <p className='text-sm text-muted-foreground'>Total Amount</p>
            <p className='text-2xl font-bold mt-1'>{fmt(summary?.total_amount)}</p>
            <p className='text-xs text-muted-foreground mt-1'>
              {summary?.payment_count?.toLocaleString() ?? '—'} payments · {summary?.lease_count ?? '—'} leases
            </p>
          </div>
          <div className='bg-green-50 rounded-lg p-4'>
            <p className='text-sm text-green-700'>Total Paid</p>
            <p className='text-2xl font-bold text-green-700 mt-1'>{fmt(summary?.total_paid)}</p>
            <p className='text-xs text-green-600 mt-1'>
              {summary?.by_status?.Paid?.count?.toLocaleString() ?? '—'} payments
            </p>
          </div>
          <div className='bg-accent/50 rounded-lg p-4'>
            <p className='text-sm text-muted-foreground'>Total Scheduled</p>
            <p className='text-2xl font-bold mt-1'>{fmt(summary?.total_scheduled)}</p>
            <p className='text-xs text-muted-foreground mt-1'>
              {summary?.by_status?.Scheduled?.count?.toLocaleString() ?? '—'} payments
            </p>
          </div>
        </div>

        {/* Summary — row 2: by due */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-red-50 rounded-lg p-4'>
            <p className='text-sm text-red-700'>Overdue</p>
            <p className='text-2xl font-bold text-red-600 mt-1'>{fmt(summary?.by_due?.overdue?.total_amount)}</p>
            <p className='text-xs text-red-500 mt-1'>
              {summary?.by_due?.overdue?.count?.toLocaleString() ?? '—'} payments
            </p>
          </div>
          <div className='bg-yellow-50 rounded-lg p-4'>
            <p className='text-sm text-yellow-700'>Due This Month</p>
            <p className='text-2xl font-bold text-yellow-700 mt-1'>{fmt(summary?.by_due?.due_this_month?.total_amount)}</p>
            <p className='text-xs text-yellow-600 mt-1'>
              {summary?.by_due?.due_this_month?.count?.toLocaleString() ?? '—'} payments
            </p>
          </div>
          <div className='bg-accent/50 rounded-lg p-4'>
            <p className='text-sm text-muted-foreground'>Next 90 Days</p>
            <p className='text-2xl font-bold mt-1'>{fmt(summary?.by_due?.next_90_days?.total_amount)}</p>
            <p className='text-xs text-muted-foreground mt-1'>
              {summary?.by_due?.next_90_days?.count?.toLocaleString() ?? '—'} payments
            </p>
          </div>
        </div>

        <GlobalPayments totalCount={summary?.payment_count} contracts={contracts} />

      </div>
    );
  }


  // Journal Entries View Component
  function JournalEntriesView({ contracts, onRowClick }: { contracts: any[]; onRowClick?: (leaseId: string) => void }) {
    const { getHeaders } = useAuthToken();

    const { data: summary } = useQuery({
      queryKey: [`${API_BASE_URL}/journal-entries/summary`],
      queryFn: async () => {
        const res = await fetch(`${API_BASE_URL}/journal-entries/summary`, {
          headers: await getHeaders(),
        });
        if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
        return res.json();
      },
    });

    const fmt = (val: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val ?? 0);

    return (
      <div className='space-y-6'>
        {/* Summary — by account */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[
            { key: 'rou_asset', label: 'ROU Asset', color: 'text-purple-700', bg: 'bg-purple-50' },
            { key: 'lease_liability', label: 'Lease Liability', color: 'text-indigo-700', bg: 'bg-indigo-50' },
            { key: 'lease_expense', label: 'Lease Expense', color: 'text-orange-700', bg: 'bg-orange-50' },
            { key: 'cash', label: 'Cash', color: 'text-green-700', bg: 'bg-green-50' },
          ].map(({ key, label, color, bg }) => (
            <div key={key} className={`${bg} rounded-lg p-4`}>
              <p className={`text-sm font-medium ${color}`}>{label}</p>
              <div className='mt-2 space-y-1 text-xs'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Dr</span>
                  <span className={`font-medium ${color}`}>{fmt(summary?.by_account?.[key]?.total_debited)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Cr</span>
                  <span className={`font-medium ${color}`}>{fmt(summary?.by_account?.[key]?.total_credited)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <GlobalJournalEntries 
          totalCount={summary?.entry_count} 
          contracts={contracts} 
          onRowClick={onRowClick}
        />
      </div>
    );
  }
  const fetchExistingLeaseDetails = async (contractId: string) => {
    setIsLoadingLeaseDetails(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/leases/${contractId}`,
        {
          headers: {
            ...(await getAccessTokenSilently()),
            "Content-Type": "application/json",
          },
        }
      );
      if (response && response?.data) {
        dispatch(setExistingLease(response?.data));
      }

      console.log("fetched existingLease data successfully", response.data);
      return true;
    } catch (error) {
      console.error("Error fetching lease", error);
      toast({
        title: 'Error',
        description: 'Failed to load contract details',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoadingLeaseDetails(false);
    }
  }

  const handleDisplayCreateLeaseform = async (leaseId?: string) => {
    try {
      setIsLoadingContract(true);
      dispatch(clearExistingLease());

      if (leaseId) {
        setSelectedLeaseId(leaseId);
        const success = await fetchExistingLeaseDetails(leaseId);
        if (success) {
          setOpenLeaseModal(true);
        }
      } else {
        setSelectedLeaseId("");
        setOpenLeaseModal(true);
      }
    } finally {
      setIsLoadingContract(false);
    }
  }
  console.log("Selected lease id", selectedLeaseId)
  return (
    <>
      {/* Lease Details Dialog - available for all tabs */}
      {openLeaseModal && (
        <LeaseModal
          open={openLeaseModal}
          onOpenChange={setOpenLeaseModal}
        >
          {isLoadingLeaseDetails ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-primary font-medium text-lg">Gathering the details...</p>
                <p className="text-muted-foreground text-sm">Preparing lease information</p>
              </div>
            </div>
          ) : (
            <LeaseDetails contractId={parseInt(selectedLeaseId) || Number(createdLeaseId) || 0} />
          )}
        </LeaseModal>
      )}
      <AlertMessage />
      <div className='mt-8 bg-card rounded-lg border border-border shadow-sm'>
        <div className='p-6 border-b border-border'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-2xl font-bold mb-2'>Contract Administration Dashboard</h3>
              <p className='text-base text-muted-foreground'>
                Manage contracts, track payments, and ensure compliance
              </p>
            </div>
            <div className='flex items-center space-x-2'>
              <button
                className='px-4 py-2 text-sm font-medium border border-input rounded-lg hover:bg-accent transition-all shadow-sm hover:shadow-md'
                data-testid='button-filter'
              >
                <i className='fas fa-filter mr-2'></i>Filter
              </button>
              <button
                className='px-4 py-2 text-sm font-medium border border-input rounded-lg hover:bg-accent transition-all shadow-sm hover:shadow-md'
                data-testid='button-export'
              >
                <i className='fas fa-download mr-2'></i>Export
              </button>
            </div>
          </div>
        </div>

        <div className='p-6'>
          {/* Tabs */}
          <div className='border-b border-border mb-6'>
            <nav className='flex space-x-8'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  data-testid={`tab-${tab.id}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contract Table */}
          {activeTab === 'contracts' && (
            <div className='overflow-x-auto'>
              {contractsLoading ? (
                <div className='py-16 flex flex-col items-center justify-center'>
                  <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4'></div>
                  <p className='text-primary font-medium text-lg'>Crunching the numbers...</p>
                  <p className='text-muted-foreground text-sm mt-1'>Fetching contract data</p>
                </div>
              ) : (
                <div>
                  <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-3'>
                      {contractGroupBy && getGroupedAndSortedContracts().length > 0 && (
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => toggleAllContractGroups(true)}
                            className='px-4 py-2 text-sm font-medium border border-input rounded-lg hover:bg-accent transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md'
                          >
                            <ChevronDown size={16} />
                            Expand All
                          </button>
                          <button
                            onClick={() => toggleAllContractGroups(false)}
                            className='px-4 py-2 text-sm font-medium border border-input rounded-lg hover:bg-accent transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md'
                          >
                            <ChevronRight size={16} />
                            Collapse All
                          </button>
                        </div>
                      )}
                      <div className='flex items-center gap-2'>
                        <span className='text-sm text-muted-foreground'>Group by</span>
                        <select
                          value={contractGroupBy ?? ''}
                          onChange={(e) => {
                            setContractGroupBy((e.target.value || null) as ContractGroupField);
                            setExpandedContractGroups(new Set());
                            setCurrentPage(1);
                          }}
                          className='text-sm border border-border rounded-md px-2 py-1 bg-background'
                        >
                          <option value=''>None</option>
                          <option value='classification'>Type</option>
                          <option value='status'>Status</option>
                          <option value='lessee_name'>Lessee</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisplayCreateLeaseform()}
                      className='px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/95 active:bg-primary/85 shadow-sm hover:shadow-md transition-all text-base'
                      data-testid='button-new-asc842-schedule'
                    >
                      <i className='fas fa-plus mr-2'></i>Create Lease
                    </button>
                  </div>
                  {/* Loading Dialog */}
                  <Dialog open={isLoadingContract}>
                    <DialogContent
                      className='!fixed !inset-4 !w-auto !max-w-none !translate-x-0 !translate-y-0 !max-h-none !h-auto !rounded-lg !gap-0 !p-0 overflow-hidden flex items-center justify-center'
                      style={{
                        left: '2rem',
                        right: '2rem',
                        top: '2rem',
                        bottom: '2rem',
                        transform: 'none',
                      }}
                    >
                      <div className='flex flex-col items-center justify-center gap-4'>
                        <Loader2 className='text-primary animate-spin' size={48} />
                        <p className='text-lg font-medium text-foreground'>Loading contract details...</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-border'>
                        <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                          Contract
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                          Lessee
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Type</th>
                        <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                          Commencement
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                          End Date
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                          Status
                        </th>
                        <th className='text-right py-3 px-4 font-medium text-muted-foreground'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractGroupBy ? (
                        getGroupedAndSortedContracts().length > 0 ? (
                          getGroupedAndSortedContracts().map(({ key, rows }) => {
                            const isExpanded = expandedContractGroups.has(key);
                            return (
                              <Fragment key={`group-${key}`}>
                                <tr
                                  className='bg-muted/40 hover:bg-muted/60 cursor-pointer border-b border-border'
                                  onClick={() => toggleContractGroup(key)}
                                >
                                  <td colSpan={7} className='py-2 px-4'>
                                    <div className='flex items-center gap-2'>
                                      {isExpanded ? (
                                        <ChevronDown size={16} />
                                      ) : (
                                        <ChevronRight size={16} />
                                      )}
                                      <span className='text-sm font-semibold text-foreground'>{key}</span>
                                      <span className='text-xs font-normal text-muted-foreground'>({rows.length})</span>
                                    </div>
                                  </td>
                                </tr>
                                {isExpanded && rows.map((contract: any) => {
                                  const contractTypeLabel =
                                    contract.classification || contract.contract_type || 'N/A';
                                  const formatDate = (value?: string | null) =>
                                    value ? new Date(value).toLocaleDateString() : 'N/A';

                          return (
                            <tr
                              key={contract.id}
                              className='border-b border-border hover:bg-muted/50 transition-colors'
                              data-testid={`contract-row-${contract.id}`}
                            >
                              <td
                                className='py-4 px-4 cursor-pointer max-w-[280px]'
                                onClick={() => handleDisplayCreateLeaseform(contract.id)}
                                title={contract.lease_name}
                              >
                                <p
                                  className='font-medium truncate'
                                  data-testid={`text-contract-name-${contract.id}`}
                                >
                                  {contract.lease_name}
                                </p>
                                <p className='text-xs text-muted-foreground truncate' data-testid={`text-vendor-${contract.id}`}>
                                  {contract.lessor_name}
                                </p>
                              </td>
                              <td
                                className='py-4 px-4 text-muted-foreground max-w-[200px]'
                                data-testid={`text-lessee-${contract.id}`}
                                title={contract.lessee_name || 'N/A'}
                              >
                                <span className='block truncate'>{contract.lessee_name || 'N/A'}</span>
                              </td>
                              <td className='py-4 px-4'>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(contractTypeLabel)}`}
                                  data-testid={`badge-type-${contract.id}`}
                                >
                                  {contractTypeLabel}
                                </span>
                              </td>
                              <td
                                className='py-4 px-4 text-muted-foreground'
                                data-testid={`text-commencement-${contract.id}`}
                              >
                                {formatDate(contract.commencement_date)}
                              </td>
                              <td
                                className='py-4 px-4 text-muted-foreground'
                                data-testid={`text-end-date-${contract.id}`}
                              >
                                {formatDate(contract.end_date)}
                              </td>
                              <td className='py-4 px-4'>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(contract.status)}`}
                                  data-testid={`badge-status-${contract.id}`}
                                >
                                  {contract.status}
                                </span>
                              </td>
                              <td className='py-4 px-4 text-right'>
                                <div className='flex items-center justify-end space-x-2'>
                                  <button
                                    className='text-muted-foreground hover:text-foreground p-1'
                                    data-testid={`button-view-${contract.id}`}
                                  >
                                    <i className='fas fa-eye'></i>
                                  </button>
                                  <button
                                    className='text-muted-foreground hover:text-foreground p-1'
                                    data-testid={`button-edit-${contract.id}`}
                                  >
                                    <i className='fas fa-edit'></i>
                                  </button>
                                  <button
                                    onClick={() => handleGenerateSchedule(contract.id, 'ASC842')}
                                    className='text-muted-foreground hover:text-foreground p-1'
                                    disabled={complianceScheduleMutation.isPending}
                                    data-testid={`button-schedule-${contract.id}`}
                                  >
                                    <i className='fas fa-calculator'></i>
                                  </button>
                                  <button
                                    onClick={() => handleGenerateJournal(contract.id, 'ASC842')}
                                    className='text-muted-foreground hover:text-foreground p-1'
                                    disabled={journalEntryMutation.isPending}
                                    data-testid={`button-journal-${contract.id}`}
                                  >
                                    <i className='fas fa-book'></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                              </Fragment>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className='py-8 text-center text-muted-foreground'>
                              <div className='flex flex-col items-center'>
                                <div className='bg-muted rounded-full w-16 h-16 flex items-center justify-center mb-4'>
                                  <i className='fas fa-file-contract text-2xl'></i>
                                </div>
                                <p className='text-lg font-medium mb-2'>No contracts found</p>
                                <p className='text-sm'>Upload contract documents to get started</p>
                              </div>
                            </td>
                          </tr>
                        )
                      ) : (
                        paginatedContracts && paginatedContracts.length > 0 ? (
                          paginatedContracts.map((contract: any) => {
                            const contractTypeLabel =
                              contract.classification || contract.contract_type || 'N/A';
                            const formatDate = (value?: string | null) =>
                              value ? new Date(value).toLocaleDateString() : 'N/A';

                            return (
                              <tr
                                key={contract.id}
                                className='border-b border-border hover:bg-muted/50 transition-colors'
                                data-testid={`contract-row-${contract.id}`}
                              >
                                <td className='py-4 px-4 cursor-pointer' onClick={() => handleDisplayCreateLeaseform(contract.id)}>
                                  <div>
                                    <p className='font-medium' data-testid={`text-contract-name-${contract.id}`}>
                                      {contract.lease_name}
                                    </p>
                                    <p className='text-xs text-muted-foreground' data-testid={`text-vendor-${contract.id}`}>
                                      {contract.lessor_name}
                                    </p>
                                  </div>
                                </td>
                                <td className='py-4 px-4 text-muted-foreground' data-testid={`text-lessee-${contract.id}`}>
                                  {contract.lessee_name || 'N/A'}
                                </td>
                                <td className='py-4 px-4'>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(contractTypeLabel)}`} data-testid={`badge-type-${contract.id}`}>
                                    {contractTypeLabel}
                                  </span>
                                </td>
                                <td className='py-4 px-4 text-muted-foreground' data-testid={`text-commencement-${contract.id}`}>
                                  {formatDate(contract.commencement_date)}
                                </td>
                                <td className='py-4 px-4 text-muted-foreground' data-testid={`text-end-date-${contract.id}`}>
                                  {formatDate(contract.end_date)}
                                </td>
                                <td className='py-4 px-4'>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(contract.status)}`} data-testid={`badge-status-${contract.id}`}>
                                    {contract.status}
                                  </span>
                                </td>
                                <td className='py-4 px-4 text-right'>
                                  <div className='flex items-center justify-end space-x-2'>
                                    <button className='text-muted-foreground hover:text-foreground p-1' data-testid={`button-view-${contract.id}`}>
                                      <i className='fas fa-eye'></i>
                                    </button>
                                    <button className='text-muted-foreground hover:text-foreground p-1' data-testid={`button-edit-${contract.id}`}>
                                      <i className='fas fa-edit'></i>
                                    </button>
                                    <button onClick={() => handleGenerateSchedule(contract.id, 'ASC842')} className='text-muted-foreground hover:text-foreground p-1' disabled={complianceScheduleMutation.isPending} data-testid={`button-schedule-${contract.id}`}>
                                      <i className='fas fa-calculator'></i>
                                    </button>
                                    <button onClick={() => handleGenerateJournal(contract.id, 'ASC842')} className='text-muted-foreground hover:text-foreground p-1' disabled={journalEntryMutation.isPending} data-testid={`button-journal-${contract.id}`}>
                                      <i className='fas fa-book'></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className='py-8 text-center text-muted-foreground'>
                              <div className='flex flex-col items-center'>
                                <div className='bg-muted rounded-full w-16 h-16 flex items-center justify-center mb-4'>
                                  <i className='fas fa-file-contract text-2xl'></i>
                                </div>
                                <p className='text-lg font-medium mb-2'>No contracts found</p>
                                <p className='text-sm'>Upload contract documents to get started</p>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination - hidden when grouping is active */}
              {!contractGroupBy && contracts && contracts.length > 0 && (
                <div className='flex items-center justify-between mt-6'>
                  <p className='text-sm text-muted-foreground'>
                    Showing {startIndex + 1} to {Math.min(endIndex, contracts.length)} of {contracts.length} results
                  </p>
                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={handlePreviousPage}
                      className='px-4 py-2 text-sm font-medium border border-input rounded-lg hover:bg-accent transition-all disabled:opacity-50 shadow-sm hover:shadow-md'
                      disabled={currentPage === 1}
                      data-testid='button-prev-page'
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`px-4 py-2 text-sm rounded-lg font-medium transition-all shadow-sm hover:shadow-md ${
                          currentPage === page
                            ? 'bg-primary text-primary-foreground hover:bg-primary/95'
                            : 'border border-input hover:bg-accent'
                        }`}
                        data-testid={`button-page-${page}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={handleNextPage}
                      className='px-4 py-2 text-sm font-medium border border-input rounded-lg hover:bg-accent transition-all disabled:opacity-50 shadow-sm hover:shadow-md'
                      disabled={currentPage >= totalPages}
                      data-testid='button-next-page'
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Schedule Tab */}
          {activeTab === 'payments' && <PaymentScheduleView contracts={contracts} />}

          {/* Journal Entries Tab */}
          {activeTab === 'journal' && (
            <JournalEntriesView contracts={contracts} onRowClick={handleDisplayCreateLeaseform} />
          )}
        </div>
      </div>
    </>
  );
}

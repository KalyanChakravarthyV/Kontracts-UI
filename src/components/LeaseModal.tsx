import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LeaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const LeaseModal = ({
  open,
  onOpenChange,
  children,
}: LeaseModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[96vw]
          h-[98vh]
          max-w-none
          max-h-none
          p-0
          overflow-hidden
          rounded-xl
        "
      >
        <div className="h-full w-full overflow-y-auto p-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaseModal;

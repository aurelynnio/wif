import { useState } from 'react';
import { AlertTriangle, Flag, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { useSubmitReport } from '@/hooks/useReportQuery';
import { notify } from '@/utils/notify';
import { REPORT_REASONS } from '@/constants/report';

const ReportModal = ({
  isOpen,
  onClose,
  targetId,
  targetType = 'post', // 'post' | 'comment' | 'user' | 'message'
}) => {
  const { mutateAsync: submitReport, isPending: loading } = useSubmitReport();
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      notify.error('Please select a reason for reporting');
      return;
    }

    try {
      const reasonLabel =
        REPORT_REASONS.find(r => r.id === selectedReason)?.label ||
        selectedReason;

      await submitReport({
        targetId,
        targetType,
        category: selectedReason,
        reason: reasonLabel,
        description: description.trim(),
      });

      setSubmitted(true);
      notify.success('Report submitted successfully');

      // Close modal after showing success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      notify.error(error?.response?.data?.message || 'Failed to submit report');
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setDescription('');
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  const getTargetLabel = () => {
    switch (targetType) {
      case 'post':
        return 'post';
      case 'comment':
        return 'comment';
      case 'user':
        return 'user';
      case 'message':
        return 'message';
      default:
        return 'content';
    }
  };

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Flag size={18} className="text-destructive" />
            <DialogTitle className="text-base font-semibold text-foreground">
              Report {getTargetLabel()}
            </DialogTitle>
          </div>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <Check size={32} className="text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Report Submitted
            </h3>
            <p className="text-sm text-muted-foreground text-center px-6">
              Thank you for helping keep our community safe. We'll review your
              report and take appropriate action.
            </p>
          </div>
        ) : (
          <>
            {/* Warning */}
            <div className="mx-4 mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
              <div className="flex gap-2">
                <AlertTriangle
                  size={18}
                  className="text-warning flex-shrink-0 mt-0.5"
                />
                <p className="text-sm text-warning/90">
                  Reports are reviewed by our moderation team. False reports may
                  result in action against your account.
                </p>
              </div>
            </div>

            {/* Reasons */}
            <div className="p-4">
              <p className="text-sm font-medium text-foreground mb-3">
                Why are you reporting this {getTargetLabel()}?
              </p>
              <div className="space-y-2 max-h-[35vh] overflow-y-auto">
                {REPORT_REASONS.map(reason => (
                  <button
                    type="button"
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                      selectedReason === reason.id
                        ? 'bg-muted border-2 border-primary'
                        : 'hover:bg-muted border border-border'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedReason === reason.id
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}
                    >
                      {selectedReason === reason.id && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {reason.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {reason.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Additional description */}
              {selectedReason && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Additional details (optional)
                  </label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide any additional context..."
                    className="resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {description.length}/500
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-border flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleSubmit}
                disabled={!selectedReason || loading}
                className="flex-1"
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <>
                    <Flag size={16} />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
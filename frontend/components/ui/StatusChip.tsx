'use client';

import React from 'react';
import { Chip } from '@mui/material';

type StatusType = 'PENDING' | 'ENROLLING' | 'REJECTED' | 'WITHDRAWN' | 'COMPLETED' | 'ACTIVE' | 'DROPPED' | 'OPEN' | 'CLOSED' | 'APPROVED';

interface StatusChipProps {
  status: StatusType;
  size?: 'small' | 'medium';
}

const statusConfig: Record<StatusType, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; variant: 'filled' | 'outlined' }> = {
  PENDING: { label: 'Pending', color: 'default', variant: 'filled' },
  ENROLLING: { label: 'Enrolling', color: 'success', variant: 'filled' },
  REJECTED: { label: 'Rejected', color: 'error', variant: 'filled' },
  WITHDRAWN: { label: 'Withdrawn', color: 'warning', variant: 'filled' },
  COMPLETED: { label: 'Completed', color: 'info', variant: 'filled' },
  ACTIVE: { label: 'Active', color: 'success', variant: 'filled' },
  DROPPED: { label: 'Dropped', color: 'error', variant: 'filled' },
  OPEN: { label: 'Open', color: 'info', variant: 'filled' },
  CLOSED: { label: 'Closed', color: 'default', variant: 'filled' },
  APPROVED: { label: 'Approved', color: 'success', variant: 'filled' },
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small' }) => {
  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Chip
      label={config.label}
      color={config.color}
      variant={config.variant}
      size={size}
      sx={{
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
      }}
    />
  );
};

export default StatusChip;

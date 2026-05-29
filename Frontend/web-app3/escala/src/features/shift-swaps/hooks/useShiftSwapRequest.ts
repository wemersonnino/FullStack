'use client';

import { useState } from 'react';
import { submitShiftSwapRequest, SubmitShiftSwapRequest } from '../api/shift-swap-api';

export function useShiftSwapRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(data: SubmitShiftSwapRequest) {
    setIsSubmitting(true);

    try {
      return await submitShiftSwapRequest(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    submit,
  };
}

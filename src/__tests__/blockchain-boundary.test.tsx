import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

import BlockchainErrorBoundary from '@/components/BlockchainErrorBoundary';
import { toast } from 'sonner';

function Bomb(): React.ReactElement {
  throw new Error('boom');
}

describe('BlockchainErrorBoundary', () => {
  it('catches errors in children and calls toast.error', () => {
    // Render a component that throws inside the boundary
    render(
      <BlockchainErrorBoundary>
        <Bomb />
      </BlockchainErrorBoundary>
    );

    expect(toast.error).toHaveBeenCalled();
  });
});


import React from 'react';
import { BrevoSync } from '@/components/admin/BrevoSync';

export default function BrevoSyncPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Administration Brevo</h1>
      <BrevoSync />
    </div>
  );
}


import React from 'react';

interface MetricProps {
  value: string;
  delta?: string;
}

export const Metric = ({ value, delta }: MetricProps) => {
  return (
    <div className="space-y-1">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {delta && (
        <div className="text-sm text-gray-500">{delta}</div>
      )}
    </div>
  );
};

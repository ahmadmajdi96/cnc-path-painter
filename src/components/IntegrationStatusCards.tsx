
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { Integration } from './IntegrationControlSystem';

interface IntegrationStatusCardsProps {
  integrations: Integration[];
}

export const IntegrationStatusCards: React.FC<IntegrationStatusCardsProps> = ({ integrations }) => {
  const totalIntegrations = integrations.length;
  const activeIntegrations = integrations.filter(i => i.status === 'active').length;
  const testingIntegrations = integrations.filter(i => i.status === 'testing').length;
  const errorIntegrations = integrations.filter(i => i.status === 'error').length;
  const inactiveIntegrations = integrations.filter(i => i.status === 'inactive').length;

  const statusCards = [
    {
      title: 'Total Integrations',
      value: totalIntegrations,
      icon: Network,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active',
      value: activeIntegrations,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Testing',
      value: testingIntegrations,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Error',
      value: errorIntegrations,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Inactive',
      value: inactiveIntegrations,
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {statusCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

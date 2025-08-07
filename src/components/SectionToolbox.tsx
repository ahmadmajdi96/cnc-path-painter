
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  List, 
  CreditCard, 
  Type, 
  CheckSquare,
  Layout,
  Plus
} from 'lucide-react';
import { AppSection } from './AppBuilderControlSystem';

interface SectionToolboxProps {
  onAddSection: (type: AppSection['type']) => void;
}

const sectionTypes = [
  {
    type: 'form' as const,
    title: 'Form Section',
    description: 'Interactive form with input fields',
    icon: FileText,
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
  },
  {
    type: 'details' as const,
    title: 'Details Section',
    description: 'Display detailed information',
    icon: Layout,
    color: 'bg-green-50 hover:bg-green-100 border-green-200',
  },
  {
    type: 'card' as const,
    title: 'Card Section',
    description: 'Card-based content display',
    icon: CreditCard,
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
  },
  {
    type: 'list' as const,
    title: 'List Section',
    description: 'Organized list of items',
    icon: List,
    color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
  },
  {
    type: 'text' as const,
    title: 'Text Section',
    description: 'Rich text content',
    icon: Type,
    color: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
  },
  {
    type: 'confirmation' as const,
    title: 'Confirmation',
    description: 'Action confirmation section',
    icon: CheckSquare,
    color: 'bg-red-50 hover:bg-red-100 border-red-200',
  },
];

export const SectionToolbox: React.FC<SectionToolboxProps> = ({ onAddSection }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-2">Section Components</h3>
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop these components to build your app
        </p>
      </div>

      <div className="grid gap-3">
        {sectionTypes.map((sectionType) => {
          const Icon = sectionType.icon;
          return (
            <Card
              key={sectionType.type}
              className={`cursor-pointer transition-all ${sectionType.color} hover:shadow-md`}
              onClick={() => onAddSection(sectionType.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg border">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{sectionType.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {sectionType.description}
                    </div>
                  </div>
                  <Plus className="w-4 h-4 opacity-60" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xs space-y-2 text-blue-800">
            <p>• Click a section to select and edit its properties</p>
            <p>• Drag sections to reorder them</p>
            <p>• Use the preview button to see your app</p>
            <p>• Form sections can have multiple input fields</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

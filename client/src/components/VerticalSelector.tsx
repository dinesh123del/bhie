import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Building2, Utensils, Laptop, ShoppingCart, Store, ArrowRight, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface Vertical {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  features: string[];
  color: string;
}

const verticals: Vertical[] = [
  {
    id: 'generic',
    name: 'General Business',
    icon: Building2,
    description: 'For all business types',
    features: ['Expense tracking', 'Invoicing', 'Basic analytics', 'AI insights'],
    color: 'bg-[#00D4FF]/20 text-[#00D4FF]'
  },
  {
    id: 'restaurant',
    name: 'Restaurant & Food',
    icon: Utensils,
    description: 'Cloud kitchens, cafes, dining',
    features: [
      'Platform commission tracking (Zomato/Swiggy)',
      'Inventory alerts for perishables',
      'Staffing optimizer with predictions',
      'Menu engineering matrix'
    ],
    color: 'bg-orange-500'
  },
  {
    id: 'freelancer',
    name: 'Freelancer & Agency',
    icon: Laptop,
    description: 'Designers, developers, consultants',
    features: [
      'Project profitability tracking',
      'Client risk scoring',
      'Rate optimization suggestions',
      'Automated payment chasing'
    ],
    color: 'bg-purple-500'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: ShoppingCart,
    description: 'DTC brands, marketplaces',
    features: [
      'Demand forecasting by SKU',
      'Dynamic pricing suggestions',
      'Return rate predictions',
      'LTV:CAC ratio tracking'
    ],
    color: 'bg-green-500'
  },
  {
    id: 'retail',
    name: 'Retail Store',
    icon: Store,
    description: 'Shops, boutiques, chains',
    features: [
      'Foot traffic correlation analysis',
      'Shrinkage detection',
      'Seasonal planning tools',
      'Multi-location dashboards'
    ],
    color: 'bg-pink-500'
  }
];

interface VerticalSelectorProps {
  currentVertical?: string;
  onSelect: (verticalId: string) => void;
}

export const VerticalSelector: React.FC<VerticalSelectorProps> = ({ 
  currentVertical = 'generic',
  onSelect 
}) => {
  const [selected, setSelected] = useState(currentVertical);
  const [hovered, setHovered] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect(id);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Business Type</h2>
        <p className="text-gray-600 mt-2">
          Get industry-specific insights and features tailored to your business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {verticals.map((vertical) => {
          const Icon = vertical.icon;
          const isSelected = selected === vertical.id;
          const isHovered = hovered === vertical.id;

          return (
            <motion.div
              key={vertical.id}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHovered(vertical.id)}
              onHoverEnd={() => setHovered(null)}
            >
              <Card
                className={`
                  cursor-pointer transition-all duration-300 h-full
                  ${isSelected 
                    ? `ring-2 ring-offset-2 ${vertical.color.replace('bg-', 'ring-')}` 
                    : 'hover:border-gray-400'
                  }
                `}
                onClick={() => handleSelect(vertical.id)}
              >
                <CardHeader className="pb-3">
                  <div className={`
                    w-12 h-12 rounded-lg ${vertical.color} 
                    flex items-center justify-center mb-3
                    transition-transform duration-300
                    ${isHovered ? 'scale-110' : ''}
                  `}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{vertical.name}</CardTitle>
                  <CardDescription>{vertical.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {vertical.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="text-sm text-gray-600 flex items-start gap-2"
                      >
                        <span className="text-green-500 mt-0.5">✓</span>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center text-sm font-medium text-blue-600"
                    >
                      Selected
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Pro tip:</strong> You can switch between verticals anytime. 
          Your data stays the same, but the insights and recommendations will be tailored 
          to your industry.
        </p>
      </div>
    </div>
  );
};

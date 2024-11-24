import { 
  Accessibility, 
  Eye, 
  Brain, 
  HeartPulse,
  AccessibilityIcon 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AccessibilityInfo {
  "Physical Accessibility": boolean;
  "Sensory Accessibility": boolean;
  "Cognitive Accessibility": boolean;
  "Inclusive Amenities": boolean;
}

interface AccessibilityIconsProps {
  accessibility: AccessibilityInfo;
}

export function AccessibilityIcons({ accessibility }: AccessibilityIconsProps) {
  const icons = [
    {
      available: accessibility["Physical Accessibility"],
      Icon: Accessibility,
      label: "Physical Accessibility",
      color: "text-blue-600"
    },
    {
      available: accessibility["Sensory Accessibility"],
      Icon: Eye,
      label: "Sensory Accessibility",
      color: "text-purple-600"
    },
    {
      available: accessibility["Cognitive Accessibility"],
      Icon: Brain,
      label: "Cognitive Accessibility",
      color: "text-orange-600"
    },
    {
      available: accessibility["Inclusive Amenities"],
      Icon: HeartPulse,
      label: "Inclusive Amenities",
      color: "text-red-600"
    }
  ];

  if (Object.values(accessibility).every(value => !value)) {
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <AccessibilityIcon className="h-4 w-4" />
        <span className="text-xs">No accessibility info</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        {icons.map(({ available, Icon, label, color }, index) => (
          available && (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div className={`${color} hover:opacity-80 transition-opacity cursor-help`}>
                  <Icon className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white shadow-lg">
                <p className="text-sm font-medium">{label}</p>
              </TooltipContent>
            </Tooltip>
          )
        ))}
      </div>
    </TooltipProvider>
  );
} 
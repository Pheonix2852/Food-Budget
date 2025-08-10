declare module 'lucide-react' {
  import * as React from 'react';

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    color?: string;
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  export const ArrowLeft: React.FC<LucideProps>;
  export const ArrowRight: React.FC<LucideProps>;
  export const Menu: React.FC<LucideProps>;
  export const CheckIcon: React.FC<LucideProps>;
  export const ChevronRight: React.FC<LucideProps>;
  export const Circle: React.FC<LucideProps>;
  export const ChevronDown: React.FC<LucideProps>;
  export const ChevronUp: React.FC<LucideProps>;
  export const X: React.FC<LucideProps>;
}

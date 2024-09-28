import React from 'react'
import Title from '@/app/reusables/content/title'

interface ExplanationProps {
  content: string;
  title: string;
  type: 'explanation';
  id?: string;
}

interface ExplanationUsageProps {
    data: ExplanationProps
}

export const explanationObject: ExplanationProps = {
  content: '',
  title: '',
  type: 'explanation'
}

const ExplanationComponent: React.FC<ExplanationUsageProps> = ({ data }) => {
  return (
    <div className="mt-4">
       <Title title={data.title} variant='subheading1' noMargin={false} />
       <p className="leading-8">
          { data.content }
       </p>
    </div>
  );
};

export default ExplanationComponent;
export type { ExplanationProps, ExplanationUsageProps };
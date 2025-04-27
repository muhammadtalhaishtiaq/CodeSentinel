
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SecurityStatus = 'healthy' | 'warning' | 'critical';

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  lastScanned: string;
  status: SecurityStatus;
  issuesCount: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  description,
  lastScanned,
  status,
  issuesCount,
}) => {
  const getBadgeClass = () => {
    switch(status) {
      case 'healthy':
        return 'security-badge-success';
      case 'warning':
        return 'security-badge-warning';
      case 'critical':
        return 'security-badge-critical';
      default:
        return 'security-badge-success';
    }
  };
  
  const getStatusText = () => {
    switch(status) {
      case 'healthy':
        return 'Healthy';
      case 'warning':
        return 'Issues Found';
      case 'critical':
        return 'Critical Issues';
      default:
        return 'Healthy';
    }
  };
  
  return (
    <Link to={`/project/${id}`}>
      <Card className="hover-card-animation">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{name}</CardTitle>
            <span className={cn(getBadgeClass())}>{getStatusText()}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">{description}</p>
          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>Last scanned: {lastScanned}</span>
            <span className="font-medium">{issuesCount} issue{issuesCount !== 1 ? 's' : ''}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProjectCard;

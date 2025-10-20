import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder } from 'lucide-react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  vulnerabilities: any[];
  children?: TreeNode[];
}

interface TreeViewProps {
  data: TreeNode[];
  onSelect?: (node: TreeNode) => void;
  selectedPath?: string;
}

interface TreeNodeProps extends TreeViewProps {
  node: TreeNode;
  level?: number;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  node,
  onSelect,
  selectedPath,
  level = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasVulnerabilities = node.vulnerabilities && node.vulnerabilities.length > 0;
  const isSelected = selectedPath === node.name;

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else if (onSelect) {
      onSelect(node);
    }
  };

  const getVulnerabilityVariant = () => {
    if (node.vulnerabilities.some(v => v.severity === 'critical')) return 'destructive';
    if (node.vulnerabilities.some(v => v.severity === 'high')) return 'destructive';
    if (node.vulnerabilities.some(v => v.severity === 'medium')) return 'default';
    return 'secondary';
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
          isSelected && "bg-gray-100 dark:bg-gray-800"
        )}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={handleClick}
      >
        {node.type === 'folder' ? (
          <div className="flex items-center flex-1">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-1 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-1 shrink-0" />
            )}
            <Folder className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">{node.name}</span>
            {hasVulnerabilities && (
              <Badge variant={getVulnerabilityVariant()} className="ml-2">
                {node.vulnerabilities.length}
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex items-center flex-1">
            <FileText className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">{node.name}</span>
            {hasVulnerabilities && (
              <Badge variant={getVulnerabilityVariant()} className="ml-2">
                {node.vulnerabilities.length}
              </Badge>
            )}
          </div>
        )}
      </div>
      {node.type === 'folder' && isExpanded && node.children && (
        <div className="ml-4">
          {node.children.map((child, index) => (
            <TreeNodeComponent
              key={`${child.name}-${index}`}
              node={child}
              onSelect={onSelect}
              selectedPath={selectedPath}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeView: React.FC<TreeViewProps> = ({ data, onSelect, selectedPath }) => {
  return (
    <div className="rounded-md border">
      {data.map((node, index) => (
        <TreeNodeComponent
          key={`${node.name}-${index}`}
          node={node}
          onSelect={onSelect}
          selectedPath={selectedPath}
          data={data}
        />
      ))}
    </div>
  );
}; 
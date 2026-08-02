import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '48px 24px' }}>
      <EmptyState
        icon={FileQuestion}
        title="404 - Page Not Found"
        description="The URL path you requested does not exist or may have been moved."
        actionLabel="Return to Homepage"
        onAction={() => navigate('/')}
      />
    </div>
  );
};

export default NotFound;

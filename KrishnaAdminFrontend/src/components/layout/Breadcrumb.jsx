import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--ink-soft)', marginBottom: '24px' }}>
      <Link to="/" style={{ color: 'var(--ink-soft)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <Home size={16} />
      </Link>
      {pathnames.length > 0 && <ChevronRight size={14} color="var(--brass)" />}
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');

        return (
          <React.Fragment key={name}>
            {isLast ? (
              <span style={{ color: 'var(--chestnut)', fontWeight: '600' }}>{formattedName}</span>
            ) : (
              <>
                <Link to={routeTo} style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>
                  {formattedName}
                </Link>
                <ChevronRight size={14} color="var(--brass)" />
              </>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;

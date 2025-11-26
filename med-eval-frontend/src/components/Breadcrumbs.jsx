import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ crumbs }) {
  return (
    <nav className="mb-4 text-sm text-slate-500">
      {crumbs.map((crumb, index) => (
        <span key={index}>
          {index > 0 && <span className="mx-2">/</span>}
          {crumb.path ? (
            <Link to={crumb.path} className="hover:underline hover:text-slate-700">
              {crumb.name}
            </Link>
          ) : (
            <span className="font-medium text-slate-700">{crumb.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

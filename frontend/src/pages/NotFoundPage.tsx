import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">404</p>
      <PageHeader title="Page not found" description="The page you're looking for doesn't exist or has moved." />
      <Link to="/" className="font-medium text-brand-700 underline underline-offset-4 dark:text-brand-300">
        Back to dashboard
      </Link>
    </div>
  );
}

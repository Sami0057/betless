import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-black text-brand-green mb-4">404</div>
        <h1 className="text-3xl font-black text-white mb-3">Page Not Found</h1>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

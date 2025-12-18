import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

/**
 * UnauthorizedPage
 * Displayed when a user tries to access admin routes without proper permissions
 */
export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center px-4">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-6">
            <ShieldAlert className="h-16 w-16 text-red-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>

        <p className="text-lg text-gray-600 mb-2">
          You don't have permission to access this page.
        </p>

        <p className="text-sm text-gray-500 mb-8">
          This area is restricted to administrators only.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Go to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

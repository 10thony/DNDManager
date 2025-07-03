import { SignIn as ClerkSignIn } from "@clerk/clerk-react";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <ClerkSignIn
          appearance={{
            elements: {
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
              footerActionLink: "text-blue-600 hover:text-blue-700",
              formFieldInput: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100",
              formFieldLabel: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
              formFieldError: "text-red-500 text-sm mt-1",
              card: "bg-white dark:bg-gray-800",
              headerTitle: "text-2xl font-bold text-gray-900 dark:text-gray-100",
              headerSubtitle: "text-gray-600 dark:text-gray-400",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          redirectUrl="/"
        />
      </div>
    </div>
  );
} 
import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, CheckCircle, Loader, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerifyEmailMutation } from "@/hooks/use-auth";
import { toast } from "sonner";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const { mutateAsync, isPending: isVerifying } = useVerifyEmailMutation();

  useEffect(() => {
    const verifyEmail = async () => {
      if (token) {
        try {
          await mutateAsync(token); // Make the async call to verify the email
          setIsSuccess(true); // Set success state if verification is successful
        } catch (error: any) {
          const msg = error?.response?.data?.message || "An error occurred";
          setIsSuccess(false); // Set failure state if an error occurs
          toast.error(msg);
        }
      } else {
        setIsSuccess(false); // Handle case where the token is not found
      }
    };

    verifyEmail(); // Call the verifyEmail function
  }, [token, mutateAsync]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-indigo-50 to-blue-50 px-4">
      <Card className="max-w-md w-full p-8 rounded-lg shadow-lg bg-white">
        <CardContent>
          <div className="flex flex-col items-center text-center space-y-5">
            {isVerifying ? (
              <>
                <Loader className="w-12 h-12 text-indigo-500 animate-spin" />
                <h2 className="text-xl font-semibold text-gray-700">
                  Verifying your email...
                </h2>
                <p className="text-gray-500 max-w-xs">
                  Please wait while we confirm your email address.
                </p>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="w-14 h-14 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Email Verified Successfully!
                </h2>
                <p className="text-gray-600 max-w-xs">
                  Your email has been verified. You can now sign in to your
                  account.
                </p>
                <Link to="/sign-in" className="w-full mt-6">
                  <Button
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-xl focus:outline-none"
                    variant="default"
                    size="lg"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <XCircle className="w-14 h-14 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Verification Failed
                </h2>
                <p className="text-gray-600 max-w-xs">
                  The verification link is invalid or expired. Please try again
                  or request a new verification email.
                </p>
                <Link to="/sign-in" className="w-full mt-6">
                  <Button
                    className="w-full px-2 py-3 bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-xl focus:outline-none"
                    variant="outline"
                    size="lg"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
                {/* Optional Retry Button */}
                <Link to="/resend-verification" className="mt-4">
                  <Button
                    className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-xl focus:outline-none"
                    variant="outline"
                    size="lg"
                  >
                    Request a New Verification Email
                  </Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;

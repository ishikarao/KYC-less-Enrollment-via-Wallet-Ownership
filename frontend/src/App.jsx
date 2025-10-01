import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Wallet } from 'lucide-react';

export default function KYCEnrollmentApp() {
  const [account, setAccount] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // REPLACE THIS WITH YOUR DEPLOYED MODULE ADDRESS
  const MODULE_ADDRESS = "0x363e7fba80d0af88f33970454d96cee79bf06bd85915f5422709b6b431d07f01";
  const MODULE_NAME = "KYClessEnrollment";

  // Connect Petra Wallet
  const connectWallet = async () => {
    try {
      if (!window.aptos) {
        setMessage('Please install Petra Wallet extension');
        return;
      }

      const response = await window.aptos.connect();
      setAccount(response.address);
      setMessage('Wallet connected successfully!');
      checkEnrollment(response.address);
    } catch (error) {
      setMessage('Failed to connect wallet: ' + error.message);
    }
  };

  // Check if user is enrolled
  const checkEnrollment = async (address) => {
    try {
      const payload = {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::is_user_enrolled`,
        type_arguments: [],
        arguments: [address]
      };

      const result = await window.aptos.view(payload);
      setIsEnrolled(result[0]);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  // Enroll user
const enrollUser = async () => {
  if (!account) {
    setMessage('Please connect your wallet first');
    return;
  }

  setLoading(true);
  try {
    const transaction = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::enroll_user`,
      type_arguments: [],
      arguments: []
    };

    const response = await window.aptos.signAndSubmitTransaction(transaction);
    
    // Simple wait with timeout
    setMessage('Transaction submitted! Waiting for confirmation...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsEnrolled(true);
    setMessage('Successfully enrolled! ✓');
    await checkEnrollment(account);
  } catch (error) {
    setMessage('Enrollment failed: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">KYC-less Enrollment</h1>
          <p className="text-gray-600">Enroll using your wallet address only</p>
        </div>

        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Connect Petra Wallet
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Connected Address:</p>
              <p className="text-xs font-mono text-gray-800 break-all">{account}</p>
            </div>

            {isEnrolled ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800">Already Enrolled</p>
                  <p className="text-sm text-green-700">Your wallet is registered in the system</p>
                </div>
              </div>
            ) : (
              <button
                onClick={enrollUser}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {loading ? 'Processing...' : 'Enroll Now'}
              </button>
            )}
          </div>
        )}

        {message && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">{message}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Powered by Aptos Blockchain
          </p>
        </div>
      </div>
    </div>
  );
}
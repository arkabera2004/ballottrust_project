export default function BlockchainStatus() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-xl font-bold mb-4">
        Blockchain Status
      </h2>

      <div className="flex items-center gap-3">

        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>

        <p className="text-green-600 font-semibold">
          Connected
        </p>

      </div>

      <p className="text-gray-500 mt-4 text-sm">
        All vote transactions are currently
        being verified and stored on-chain.
      </p>

    </div>
  );
}
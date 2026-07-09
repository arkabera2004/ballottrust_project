export default function DashboardHeader() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-8">
        Election Administration Dashboard
      </h1>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl mb-8 shadow-lg">
        <h2 className="text-2xl font-bold">
          Welcome Back Administrator
        </h2>

        <p className="opacity-90 mt-2">
          Monitor elections, approve candidates,
          manage voters and verify blockchain
          records.
        </p>
      </div>
    </>
  );
}
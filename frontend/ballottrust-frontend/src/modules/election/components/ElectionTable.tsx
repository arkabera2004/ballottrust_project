import type { Election } from '../types';

interface Props {
  elections: Election[];
}

export default function ElectionTable({
  elections,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-4 py-3 text-left">
              Code
            </th>

            <th className="px-4 py-3 text-left">
              Title
            </th>

            <th className="px-4 py-3 text-left">
              Status
            </th>

            <th className="px-4 py-3 text-left">
              Type
            </th>

            <th className="px-4 py-3 text-left">
              Start
            </th>

            <th className="px-4 py-3 text-left">
              End
            </th>
          </tr>
        </thead>

        <tbody>
          {elections.map((election) => (
            <tr
              key={election.id}
              className="border-t"
            >
              <td className="px-4 py-3">
                {election.electionCode}
              </td>

              <td className="px-4 py-3 font-medium">
                {election.title}
              </td>

              <td className="px-4 py-3">
                {election.status}
              </td>

              <td className="px-4 py-3">
                {election.electionType}
              </td>

              <td className="px-4 py-3">
                {new Date(
                  election.startDate,
                ).toLocaleDateString()}
              </td>

              <td className="px-4 py-3">
                {new Date(
                  election.endDate,
                ).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
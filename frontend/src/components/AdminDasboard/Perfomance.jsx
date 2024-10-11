import React from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "./DashboardHeader";
import Sidebar from "./Sidebar/SideBars";

const Performance = ({ user }) => {
  // Example students data
  const students = [
    {
      id: 1,
      name: "Alice",
      attemptedTests: 4,
      monthlyPerformance: [60, 70, 80, 90, 85],
      subjectPerformance: [85, 75, 80], // English, Math, GK/GS
    },
    {
      id: 2,
      name: "Bob",
      attemptedTests: 3,
      monthlyPerformance: [55, 65, 70, 75, 60],
      subjectPerformance: [70, 60, 75], // English, Math, GK/GS
    },
  ];
  console.log(students);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Dashboard Header */}
        <DashboardHeader user={user || { name: "Guest" }} />

        {/* Page Content */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Student Performance</h2>

          {/* Students List with Links */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mock Tests Given
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{student.attemptedTests}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(
                        (student.monthlyPerformance.reduce((a, b) => a + b) / student.monthlyPerformance.length) || 0
                      ).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
  to={{
    pathname: `/student-performance/${student.id}`,
    state: student, // Passing the student object
  }}
  className="text-blue-600 hover:text-blue-900"
>
  View Performance
</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;

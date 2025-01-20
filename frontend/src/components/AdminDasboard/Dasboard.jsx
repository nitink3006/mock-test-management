import React, { useState, useEffect } from "react";
import DashboardHeader from "./DashboardHeader";
import Sidebar from "./Sidebar/SideBars"; // Importing the updated Sidebar
import { FaTrophy } from "react-icons/fa"; // Icons for leaderboard
import { AiOutlineClockCircle } from "react-icons/ai"; // Icon for expiry date
import config from "../../config";

const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar collapse state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);


  const user = JSON.parse(localStorage.getItem("user")); // Fetch user from localStorage
  const token = user.token;

  // Retrieving subscription plan and expiry date from localStorage
  const subscriptionPlan = localStorage.getItem("plan_taken") || "Basic Plan";
  const planExpiryDate = localStorage.getItem("expiry");
  const isPlanExpired = planExpiryDate
    ? new Date(planExpiryDate) < new Date()
    : false;


  const institueName = user.institute_name;
  console.log("user",user,institueName)


  const fetchPerformanceData = async () => {
    try {
      const response = await fetch(
        `${config.apiUrl}/institute-statistics/?institute_name=${institueName}`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setUserData(data);
      setLeaderboard(data.leaderboard.leaderboard || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev); // Toggle collapse state
  };

  // Effect to handle sidebar visibility on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true); // Collapse sidebar on mobile view
      } else {
        setIsCollapsed(false); // Expand sidebar on desktop view
      }
    };

    // Set initial state based on the current window size
    handleResize();

    // Add event listener for resize
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <div className="flex flex-row flex-grow">
        {/* Sidebar: hidden on mobile */}
        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
          className="hidden md:block"
        />

        {/* Main Dashboard Content */}
        <div
          className={`flex-grow transition-all duration-300 ease-in-out ${
            isCollapsed ? "ml-0" : "ml-64"
          }`}
        >
          {/* Header */}
          <DashboardHeader user={user} toggleSidebar={toggleSidebar} />

          <div className="p-3 md:p-4">
            {/* Welcome Message */}
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-left">
              Welcome {user ? user.institute_name : "Guest"}
            </h1>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {/* Card for Subscription Plan */}
              <div
                className={`shadow-md rounded-lg p-4 border-l-4 ${
                  isPlanExpired
                    ? "bg-red-100 border-red-500"
                    : "bg-green-100 border-green-500"
                }`}
              >
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                  Subscription Plan
                </h2>
                <p className="text-lg md:text-xl font-bold">
                  {subscriptionPlan}
                </p>
                <div className="flex items-center mt-2">
                  <AiOutlineClockCircle
                    className={`mr-2 ${
                      isPlanExpired ? "text-red-500" : "text-green-500"
                    }`}
                    size={20}
                  />
                  <p
                    className={`text-sm md:text-base ${
                      isPlanExpired ? "text-red-500" : "text-gray-800"
                    }`}
                  >
                    Expiry Date:{" "}
                    {planExpiryDate
                      ? new Date(planExpiryDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                {isPlanExpired && (
                  <p className="text-red-500 mt-2 text-sm">
                    Your subscription has expired. Please renew to continue.
                  </p>
                )}
              </div>

              {/* Card for Total Students */}
              <div className="bg-white shadow-md rounded-lg p-3">
                <h2 className="text-base md:text-lg">Total Students</h2>
                <p className="text-xl md:text-2xl font-bold">
                  {userData.total_students}
                </p>
              </div>

              {/* Card for Active Tests */}
              <div className="bg-white shadow-md rounded-lg p-3">
                <h2 className="text-base md:text-lg">Active Tests</h2>
                <p className="text-xl md:text-2xl font-bold">
                  {userData.total_mock_tests}
                </p>
              </div>
            </div>

            {/* Leaderboard Section */}
            <div className="bg-white shadow-lg rounded-lg p-3">
              <h2 className="text-2xl md:text-2xl font-semibold mb-3 text-gray-800">
                Leaderboard
              </h2>

              {/* Responsive Table */}
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full leading-normal border border-gray-300 rounded-lg overflow-hidden">
                  <thead className="bg-gradient-to-r from-[#007bff] to-[#0056b3] text-white">
                    <tr>
                      <th className="px-3 py-2 md:px-4 md:py-3 border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                        Participants
                      </th>
                      <th className="px-3 py-2 md:px-4 md:py-3 border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-3 py-2 md:px-4 md:py-3 border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                        Rank
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((student, index) => (
                      <tr
                        key={student.id}
                        className={`hover:bg-gray-100 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-3 py-2 md:px-4 md:py-3 border-b border-gray-200 text-sm">
                          <div className="flex items-center">
                            {index === 0 && (
                              <FaTrophy className="text-yellow-500 w-4 h-4 md:w-5 md:h-5 mr-1" />
                            )}
                            {index === 1 && (
                              <FaTrophy className="text-gray-400 w-4 h-4 md:w-5 md:h-5 mr-1" />
                            )}
                            {index === 2 && (
                              <FaTrophy className="text-orange-500 w-4 h-4 md:w-5 md:h-5 mr-1" />
                            )}
                            {index >= 3 && (
                              <span className="text-gray-600 font-bold w-4 md:w-5 mr-1 text-center">
                                {index + 1}
                              </span>
                            )}
                            <div className="ml-2">
                              <p className="text-gray-900 font-medium whitespace-no-wrap">
                                {student.student_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 md:px-4 md:py-3 border-b border-gray-200 text-sm">
                          <p className="text-gray-900 font-bold whitespace-no-wrap">
                            {student.total_obtained}
                          </p>
                        </td>
                        <td className="px-3 py-2 md:px-4 md:py-3 border-b border-gray-200 text-sm">
                          <p className="text-gray-700 font-semibold whitespace-no-wrap">
                            {student.rank}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

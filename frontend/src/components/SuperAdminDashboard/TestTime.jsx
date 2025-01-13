import React, { useState, useEffect, useRef } from "react";
import DashboardHeader from "../SuperAdminDashboard/Header";
import Sidebar from "../SuperAdminDashboard/Sidebar";
import Select from "react-select";
import config from "../../config";

const TestTime = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [testName, setTestName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [testOptions, setTestOptions] = useState([]);

  const S = JSON.parse(localStorage.getItem("user"));
  const token = S.token;

  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  const fetchInstitutes = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/vendor-admin-crud/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      if (Array.isArray(result.data)) {
        const formattedInstitutes = result.data.map((institute) => ({
          value: institute.id,
          label: institute.institute_name,
        }));
        setInstitutes(formattedInstitutes);
      } else {
        console.error("Expected an array but received:", result.data);
      }
    } catch (error) {
      console.error("Error fetching institutes:", error);
    }
  };

  const fetchTests = async () => {
    try {
      const selectedInstituteNames = selectedOptions
        .map((option) => option.label)
        .join(",");

      const queryParams = new URLSearchParams({
        student_id: "3738837e-c8bd-458d-9152-634378b01060",
        institute_name: selectedInstituteNames,
      });

      const response = await fetch(
        `${config.apiUrl}/tests_point/?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch student test data");
      }

      const data = await response.json();

      const uniqueTestNames = [
        ...new Set(data.test_names.map((test) => test.test_name)),
      ];

      const testOptionsFormatted = uniqueTestNames.map((name) => ({
        id: name,
        name,
      }));

      setTestOptions(testOptionsFormatted);
    } catch (error) {
      console.error("Error fetching student test data:", error);
    }
  };

  useEffect(() => {
    if (selectedOptions.length > 0) {
      fetchTests();
    }
  }, [selectedOptions, token]);

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleInstituteChange = (selected) => {
    if (selected) {
      if (selected.some((option) => option.value === "selectAll")) {
        setSelectedOptions(institutes);
      } else if (selected.some((option) => option.value === "deselectAll")) {
        setSelectedOptions([]);
      } else {
        setSelectedOptions(selected);
      }
    }
  };

  const handleStartTimeClick = () => {
    startTimeRef.current.focus();
  };

  const handleEndTimeClick = () => {
    endTimeRef.current.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      institutes: selectedOptions.map((option) => option.value),
      test_name: testName,
      start_time: startTime,
      end_time: endTime,
    };

    try {
      const response = await fetch(`${config.apiUrl}/test_time/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to save test: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Test saved successfully:", result);

      alert("Test saved successfully!");

      // Clear the form data
      setSelectedOptions([]);
      setTestName("");
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.error("Error saving test:", error);
      alert("Failed to save test. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-row flex-grow">
        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
          className="hidden md:block"
        />

        <div
          className={`flex-grow transition-all duration-300 ease-in-out ${
            isCollapsed ? "ml-0" : "ml-64"
          }`}
        >
          <DashboardHeader user={user} toggleSidebar={toggleSidebar} />

          <div className="p-2 md:p-6">
            <h1 className="text-xl md:text-3xl font-bold mb-4 text-left">
              TestTime Setup
            </h1>

            <div className="bg-white shadow-lg rounded-lg p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4">
                  <div className="flex flex-col">
                    <label
                      htmlFor="institute"
                      className="text-lg sm:text-xl md:text-xl font-semibold text-gray-700"
                    >
                      Institute
                    </label>
                    <Select
                      isMulti
                      options={[
                        { value: "selectAll", label: "Select All" },
                        { value: "deselectAll", label: "Deselect All" },
                        ...institutes,
                      ]}
                      onChange={handleInstituteChange}
                      className="basic-multi-select mt-4"
                      classNamePrefix="select"
                      placeholder="Select Institute(s)"
                      value={selectedOptions}
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: "lightgray",
                          boxShadow: "none",
                          "&:hover": {
                            borderColor: "blue",
                          },
                          padding: "0.35rem",
                          borderRadius: "0.375rem",
                        }),
                        option: (base, { data }) => ({
                          ...base,
                          display:
                            data.value === "selectAll" ||
                            data.value === "deselectAll"
                              ? "inline-block"
                              : "block",
                          width:
                            data.value === "selectAll" ||
                            data.value === "deselectAll"
                              ? "48%"
                              : "100%",
                          textAlign: "center",
                          padding: "0.5rem",
                        }),
                        menu: (base) => ({
                          ...base,
                          display: "flex",
                          flexDirection: "column",
                          padding: "0.5rem",
                        }),
                      }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="testName"
                      className="text-lg sm:text-xl md:text-xl font-semibold text-gray-700 mb-2"
                    >
                      Test Name
                    </label>
                    <select
                      id="testName"
                      name="testName"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      className="mt-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                    >
                      <option value="">Select Test Name</option>
                      {testOptions.map((test) => (
                        <option key={test.id} value={test.name}>
                          {test.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4">
                  <div className="flex flex-col">
                    <label
                      htmlFor="startTime"
                      className="text-lg sm:text-xl md:text-xl font-semibold text-gray-700 mb-2"
                    >
                      Start Time
                    </label>
                    <input
                      ref={startTimeRef}
                      id="startTime"
                      name="startTime"
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      onClick={handleStartTimeClick}
                      className="mt-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="endTime"
                      className="text-lg sm:text-xl md:text-xl font-semibold text-gray-700 mb-2"
                    >
                      End Time
                    </label>
                    <input
                      ref={endTimeRef}
                      id="endTime"
                      name="endTime"
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      onClick={handleEndTimeClick}
                      className="mt-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                    />
                  </div>
                </div>

                <div className="mt-4 mb-4 mr-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-lg rounded-lg shadow-md hover:from-indigo-500 hover:to-indigo-400 transition duration-300"
                  >
                    Save Test
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTime;

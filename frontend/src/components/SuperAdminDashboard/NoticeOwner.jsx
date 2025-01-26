import React, { useState, useEffect } from "react";
import Sidebar from "../SuperAdminDashboard/Sidebar";
import DashboardHeader from "../SuperAdminDashboard/Header";
import Select from "react-select";
import { FaTrashAlt } from "react-icons/fa";
import config from "../../config";

const NoticeOwner = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [message, setMessage] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const S = JSON.parse(localStorage.getItem("user"));
  const token = S.token;
  // console.log(S);
  // console.log(S.id);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

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

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const handleInstituteChange = (selected) => {
    if (selected.some((option) => option.value === "selectAll")) {
      setSelectedOptions(institutes);
    } else if (selected.some((option) => option.value === "deselectAll")) {
      setSelectedOptions([]);
    } else {
      setSelectedOptions(selected);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      if (selectedOptions.length === 0) {
        setModalContent("Please select at least one recipient.");
        setIsModalVisible(true);
        return;
      }

      // Send a message to each selected recipient
      for (let option of selectedOptions) {
        const messageData = {
          message: message.trim(),
          sender: S.id, // User ID as sender
          recipient: option.value, // Single Institute ID as recipient
          // recipient: selectedOptions.map((option) => option.value), // Single Institute ID as recipient
          is_admin: recipient === option.value ? "OK" : "NOT OK",
        };

        try {
          const response = await fetch(`${config.apiUrl}/notifications/`, {
            method: "POST",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(messageData),
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }

          setAlerts((prevAlerts) => [
            ...prevAlerts,
            { ...messageData, recipient: option.label }, // Keep track of recipient label
          ]);
          setMessage("");
          setSelectedOptions([]);
          setModalContent("Message sent successfully!");
        } catch (error) {
          setModalContent("Failed to send the message. Please try again.");
          console.error("Error sending message:", error);
        }

        setIsModalVisible(true);
      }
    } else {
      setModalContent("Please enter a valid message.");
      setIsModalVisible(true);
    }
  };

  const handleDeleteMessage = (index) => {
    setAlerts((prevAlerts) => prevAlerts.filter((_, i) => i !== index));
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Layout Structure */}
      <div className="flex flex-row flex-grow">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
          className="hidden md:block"
        />

        {/* Main Content */}
        <div
          className={`flex-grow transition-all duration-300 ease-in-out ${
            isCollapsed ? "ml-0" : "ml-64"
          }`}
        >
          {/* Header */}
          <DashboardHeader
            user={{ user: "Owner" }}
            toggleSidebar={toggleSidebar}
          />

          {/* Main Content */}
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>

            {/* Dropdown Section */}
            <div className="flex flex-col mb-6">
              <label
                htmlFor="institute"
                className="text-lg sm:text-xl md:text-xl font-semibold text-gray-700 mb-2"
              >
                Select Institute(s)
              </label>
              <Select
                isMulti
                options={[
                  { value: "selectAll", label: "Select All" },
                  { value: "deselectAll", label: "Deselect All" },
                  ...institutes,
                ]}
                onChange={handleInstituteChange}
                className="basic-multi-select"
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
                    padding: "0.5rem",
                    borderRadius: "0.5rem",
                  }),
                  option: (base, { data }) => ({
                    ...base,
                    display:
                      data.value === "selectAll" || data.value === "deselectAll"
                        ? "inline-block"
                        : "block",
                    width:
                      data.value === "selectAll" || data.value === "deselectAll"
                        ? "48%"
                        : "100%",
                    textAlign: "center",
                    padding: "0.75rem",
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

            {/* Message Input Section */}
            <div className="mb-6">
              <label
                htmlFor="message"
                className="text-lg font-semibold text-gray-700 mb-2 block"
              >
                Message
              </label>
              <textarea
                id="message"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
              <button
                className="bg-blue-500 text-white px-6 py-2 mt-4 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleSendMessage}
              >
                Send Message
              </button>
            </div>

            {/* Display Sent Messages */}
            {/* <div>
              <h2 className="text-xl font-semibold mb-4">Sent Messages</h2>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-100 rounded-lg shadow-md flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-gray-700">Message:</p>
                        <p className="text-gray-800">{alert.message}</p>
                        <p className="font-medium text-gray-700 mt-2">
                          Sent to:
                        </p>
                        <p className="text-gray-800">{alert.recipient}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrashAlt size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No messages sent yet.</p>
              )}
            </div> */}
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
            <p className="text-lg font-semibold text-gray-700">
              {modalContent}
            </p>
            <button
              className="bg-blue-500 text-white px-6 py-2 mt-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeOwner;

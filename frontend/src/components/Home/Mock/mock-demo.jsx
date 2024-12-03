import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { quizData } from "../Mock/quiz";
import QuestionNavigation from "../Mock/navigation";
import MobileQuizLayout from "./MobileQuizLayout";
import config from "../../../config";
import { FaBrain, FaBook, FaCalculator, FaLanguage } from "react-icons/fa"; // Icons for sections
import Timer from "../Mock/Timer";

const MockDemo = () => {
  const user = {
    name: "John Doe",
    role: "Student",
    profileImage: "", // Empty string or null means it will show initials
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  //const [students, setStudents] = useState([]);
  //const [error, setError] = useState("");

  //const S = JSON.parse(localStorage.getItem("user"));
  //const token = S.token;

  const storedTestName = localStorage.getItem("selectedTestName");
  console.log("hii", storedTestName); // Logs the last stored test name

  const UserProfile = () => {
    const [user, setUser] = useState({ name: "Unknown User", role: "Student" }); // Default user state with name and role
    useEffect(() => {
      // Fetch user details from local storage
      const storedData = localStorage.getItem("user"); // Assuming JSON object is stored under this key
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData); // Parse the JSON string
          if (parsedData && parsedData.name) {
            setUser({ name: parsedData.name, role: parsedData.type }); // Set user name and role (assuming type is role)
          }
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          setUser({ name: "Unknown User", role: "Student" }); // Fallback in case of error
        }
      }
    }, []); // Runs once when the component mounts

    return (
      <div className="flex items-center space-x-3 px-2 bg-gray-50 rounded-lg shadow-sm">
        {/* Render initials based on user name */}
        <div className="w-12 h-12 p-2 rounded-full bg-blue-500 text-white flex items-center justify-center">
          <span className="text-lg font-semibold">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </span>{" "}
          {/* Initial of the name */}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-700">{user.name}</h2>{" "}
          {/* Display the user's name */}
          <p className="text-sm text-gray-500">{user.role}</p>{" "}
          {/* Display the user's role */}
        </div>
      </div>
    );
  };

  const [answeredQuestions, setAnsweredQuestions] = useState(
    quizData.map(() => [])
  );

  const [markedForReview, setMarkedForReview] = useState(
    quizData.map(() => [])
  );

  const [selectedSubject, setSelectedSubject] = useState(
    localStorage.getItem("selectedOptionalSubject") || ""
  );

  // Function to handle filtered data (to display only relevant sections)
  const filteredQuizData = quizData.filter((section) => {
    if (selectedSubject) {
      return (
        section.section === "General Intelligence and Reasoning" ||
        section.section === "General Awareness" ||
        section.section === "Quantitative Aptitude" ||
        section.section === selectedSubject
      );
    }
    return true;
  });

  // Ensure that the current section is correctly assigned based on index
  const currentSection = filteredQuizData[currentSectionIndex] || {};
  const currentQuestion = currentSection.questions
    ? currentSection.questions[currentQuestionIndex]
    : null;

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  useEffect(() => {
    setSelectedOption(
      answeredQuestions[currentSectionIndex]?.[currentQuestionIndex]
    );
  }, [currentQuestionIndex, currentSectionIndex, answeredQuestions]);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setAnsweredQuestions((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[currentSectionIndex][currentQuestionIndex] = option;
      return updatedAnswers;
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentQuestionIndex(
        filteredQuizData[currentSectionIndex - 1].questions.length - 1
      );
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSectionIndex < filteredQuizData.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handleSubmitNext = () => {
    try {
      // Retrieve existing data from localStorage or initialize an empty object
      const storedData =
        JSON.parse(localStorage.getItem("submittedData")) || {};

      // Get the current section and question
      const currentSection = mockTestData[currentSectionIndex];
      const currentQuestion =
        currentSection?.questions[currentQuestionIndex] || {};

      // Fetch the user's answer for the current question
      const userAnswer =
        answeredQuestions[currentSectionIndex]?.[currentQuestionIndex] || {}; // Fetch based on both section and question index
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        alert("User data not found. Please log in again.");
        return;
      }

      const student_id = user.id;
      const sectionName = currentSection?.subject || "Default Section";
      const questionId = currentQuestion.id;

      // Ensure the section exists in stored data
      if (!storedData[sectionName]) {
        storedData[sectionName] = {};
      }

      // Add/update the specific question's selected answer within the section
      storedData[sectionName][questionId] = {
        question: currentQuestion.id,
        selected_answer: userAnswer || "No Answer Provided",
        selected_answer_2: userAnswer.image || null,
        student: student_id,
      };

      // Save the updated structure to localStorage
      localStorage.setItem("submittedData", JSON.stringify(storedData));

      console.log("Updated LocalStorage Data:", storedData);

      // Move to the next question or section
      if (currentQuestionIndex < currentSection.questions.length - 1) {
        // Move to the next question in the current section
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (currentSectionIndex < mockTestData.length - 1) {
        // Move to the next section and reset question index
        setCurrentSectionIndex(currentSectionIndex + 1);
        setCurrentQuestionIndex(0);
      } else {
        // End of all sections and questions
        console.log("All sections and questions completed.");
      }
    } catch (error) {
      console.error("Error in handleSubmitNext:", error);
      alert("An error occurred while saving your answer. Please try again.");
    }
  };

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion =
    (currentSection?.questions?.length || 0) > 0 &&
    currentQuestionIndex === (currentSection?.questions?.length || 0) - 1;
  const isLastSection =
    (filteredQuizData?.length || 0) > 0 &&
    currentSectionIndex === (filteredQuizData?.length || 0) - 1;

  const handleSectionChange = (sectionIndex, subject) => {
    setCurrentSectionIndex(sectionIndex); // Update the active section index
    setSelectedSubject(subject); // Update the active subject
  };

  const handleMarkForReview = () => {
    setMarkedForReview((prevMarked) => {
      const updatedMarked = [...prevMarked];
      if (!updatedMarked[currentSectionIndex].includes(currentQuestionIndex)) {
        updatedMarked[currentSectionIndex] = [
          ...updatedMarked[currentSectionIndex],
          currentQuestionIndex,
        ];
      }
      return updatedMarked;
    });
  };

  const [mockTestData, setMockTestData] = useState([]);
  const [timerDuration, setTimerDuration] = useState(0); // State for timer
  const SubjectId = localStorage.getItem("selectedSubjectId");

  useEffect(() => {
    const fetchMockTests = async () => {
      try {
        const response = await fetch(
          `${config.apiUrl}/get-single-exam-details/?exam_id=${SubjectId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch mock test data");
        }

        const result = await response.json();
        console.log("Raw API Response:", result);

        if (result.data) {
          // Check if the stored test name exists in the API response
          const mockTestKeys = Object.keys(result.data);
          const mockTestKey = mockTestKeys.find(
            (key) => key !== "exam_domain" && key === storedTestName // Match stored test name
          );

          if (mockTestKey) {
            const testDetails = result.data[mockTestKey];

            if (testDetails) {
              setTimerDuration(Number(testDetails.exam_duration) || 0);

              const groupedTests = Object.entries(testDetails)
                .filter(
                  ([key, value]) =>
                    key !== "exam_duration" &&
                    key !== "total_marks" &&
                    key !== "total_questions"
                )
                .map(([subjectName, subjectDetails]) => ({
                  subject: subjectName,
                  no_of_questions: subjectDetails.no_of_questions,
                  questions: subjectDetails.questions.map(
                    (question, index) => ({
                      id: index + 1,
                      question: question.question,
                      marks: question.positive_marks,
                      negativeMarks: question.negative_marks,
                      subject: question.subject || subjectName,
                      options: [
                        question.option_1,
                        question.option_2,
                        question.option_3,
                        question.option_4,
                      ], // Dynamically map the options
                      files: [
                        question.file_1,
                        question.file_2,
                        question.file_3,
                        question.file_4,
                      ], // Dynamically map the files
                    })
                  ),
                }));

              console.log("Grouped Test Data:", groupedTests);
              setMockTestData(groupedTests);

              setSelectedSubject(groupedTests[0]?.subject || "");
            } else {
              console.error("Mock test data is missing");
            }
          } else {
            console.error(
              "Stored test name does not match any test in the API response"
            );
          }
        } else {
          console.error("Data field is missing from the API response");
        }
      } catch (error) {
        console.error("Error fetching mock test data:", error);
      }
    };

    if (SubjectId) {
      fetchMockTests();
    }
  }, [SubjectId]);

  // Debugging: Check the timerDuration and mockTestData
  useEffect(() => {
    console.log("Updated Timer Duration:", timerDuration);
    console.log("Updated mockTestData:", mockTestData);
  }, [timerDuration, mockTestData]);

  const filteredSections = mockTestData.filter((section) =>
    section.questions.some((q) => q.subject === selectedSubject)
  );

  console.log("Filtered Data", filteredSections);

  useEffect(() => {
    // When the component mounts, set the first section to blue
    if (mockTestData.length > 0 && mockTestData[0]?.questions.length > 0) {
      const firstSubject =
        mockTestData[0].questions[0]?.subject || "Unknown Subject";
      setSelectedSubject(firstSubject); // Set the selected subject
    }
  }, [mockTestData]);

  return isMobile ? (
    <MobileQuizLayout
      currentSectionIndex={currentSectionIndex}
      currentQuestionIndex={currentQuestionIndex}
      handleOptionChange={handleOptionChange}
      handleNext={handleNext}
      handlePrevious={handlePrevious}
      handleSubmitNext={handleSubmitNext}
      handleMarkForReview={handleMarkForReview}
      setSubmitted={setSubmitted}
      submitted={submitted}
      mockTestData={mockTestData}
      quizData={quizData} // Pass the fetched data here
      currentSection={mockTestData[currentSectionIndex]} // Adjusted to the fetched data
      currentQuestion={
        mockTestData[currentSectionIndex]?.questions[currentQuestionIndex]
      }
      setCurrentSectionIndex={setCurrentSectionIndex}
      setCurrentQuestionIndex={setCurrentQuestionIndex}
      answeredQuestions={answeredQuestions}
      markedForReview={markedForReview}
    />
  ) : (
    <div className="flex flex-col items-center bg-gray-100 min-h-full">
      <div className="grid lg:grid-cols-12 gap-4 w-full max-w-full">
        <div className="lg:col-span-9 col-span-full bg-white rounded-lg shadow-lg">
          <>
            {/* Section Navigation */}
            <div className="col-span-full grid grid-cols-4 space-x-4 py-4 px-8 bg-gray-100 rounded-lg shadow-md">
              {mockTestData.map((section, sectionIndex) => {
                // Get unique subjects from the section's questions
                const uniqueSubjects = [
                  ...new Set(section.questions.map((q) => q.subject)),
                ];

                return uniqueSubjects.map((subject, subjectIndex) => (
                  <button
                    key={`${sectionIndex}-${subjectIndex}`}
                    className={`flex items-center col-span-1 py-3 px-4 rounded-lg transition duration-300 ${
                      currentSectionIndex === sectionIndex &&
                      selectedSubject === subject
                        ? "bg-blue-700 text-white font-semibold shadow-lg" // Highlight active section
                        : "bg-white text-blue-700 hover:bg-blue-100 hover:shadow-sm" // Inactive sections
                    }`}
                    onClick={() => handleSectionChange(sectionIndex, subject)} // Handle section change
                  >
                    {/* <div className="mr-2">{sectionIcons[sectionIndex]}</div> */}
                    <span>{subject || "Unknown Subject"}</span>
                  </button>
                ));
              })}
            </div>

            {/* Header with Profile, Marks, Language, and Timer */}
            <div className="border items-center grid grid-cols-12 space-x-1 py-4 px-8 bg-white rounded-lg shadow-md">
              <div className="col-span-3">
                <UserProfile user={user} />
              </div>

              <div className="col-span-2" />

              <div className="col-span-5 flex items-center space-x-4">
                {mockTestData[currentSectionIndex]?.questions[0]?.marks && (
                  <div className="flex items-center justify-center p-3 bg-green-200 text-green-700 rounded-xl">
                    <h2 className="font-semibold">
                      +{mockTestData[currentSectionIndex]?.questions[0]?.marks}{" "}
                      marks
                    </h2>
                  </div>
                )}
                {mockTestData[currentSectionIndex]?.questions[0]
                  ?.negativeMarks && (
                  <div className="flex items-center justify-center p-3 bg-red-200 text-red-700 rounded-xl">
                    <h2 className="font-semibold">
                      {
                        mockTestData[currentSectionIndex]?.questions[0]
                          ?.negativeMarks
                      }{" "}
                      marks
                    </h2>
                  </div>
                )}
              </div>
              <div className="col-span-2 flex items-center justify-end">
                {timerDuration > 0 && <Timer totalMinutes={timerDuration} />}
              </div>
            </div>

            {/* Question Section */}
            <div className="p-8">
              <h2 className="text-3xl font-bold text-blue-600 mb-6">
                Question {currentQuestionIndex + 1}
              </h2>

              {/* Log current question */}
              <p className="text-lg font-medium mb-8">
                {
                  // Find the question for the selected subject and current question index
                  mockTestData.find(
                    (section) => section.subject === selectedSubject
                  )?.questions[currentQuestionIndex]?.question || "Loading..." // Display the question or "Loading..." if not available
                }
              </p>

              {/* Log options */}
              <div className="grid grid-cols-2 gap-6 mb-10">
                {
                  // Get the options for the current question directly from mockTestData
                  mockTestData
                    .find((section) => section.subject === selectedSubject)
                    ?.questions[currentQuestionIndex]?.options?.map(
                      (option, index) => (
                        <label
                          key={index}
                          className={`border border-gray-300 rounded-lg p-4 flex items-center justify-center text-center cursor-pointer transition duration-200 transform ${
                            selectedOption === option
                              ? "bg-blue-50 border-blue-500 shadow-md"
                              : "hover:bg-gray-50 hover:shadow-sm"
                          }`}
                        >
                          <input
                            type="radio"
                            name="option"
                            value={option}
                            checked={selectedOption === option}
                            onChange={() => handleOptionChange(option)}
                            className="hidden"
                          />
                          <span className="text-gray-800 font-medium">
                            {option}
                          </span>
                        </label>
                      )
                    )
                }
              </div>

              {/* Question Navigation and Actions */}
              <div className="grid grid-cols-12 items-center lg:mt-[25%] xl:mt-[20%] 2xl:mt-[17%]">
                <button
                  onClick={handleMarkForReview}
                  className="bg-red-500 text-white px-5 py-3 col-span-3 rounded-lg shadow-md hover:bg-red-600"
                >
                  Mark for Review
                </button>
                <div className="col-span-1" />
                <div className="grid grid-cols-2 col-span-4 items-center space-x-4 gap-10">
                  <button
                    onClick={handlePrevious}
                    disabled={isFirstQuestion}
                    className={`px-5 py-3 col-span-1 rounded-lg shadow-md ${
                      isFirstQuestion
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isLastQuestion && isLastSection}
                    className={`px-5 py-3 rounded-lg col-span-1 shadow-md ${
                      isLastQuestion && isLastSection
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="col-span-1" />

                <button
                  onClick={handleSubmitNext}
                  disabled={isLastQuestion && isLastSection}
                  className={`px-5 py-3 col-span-3 rounded-lg shadow-md ${
                    isLastQuestion && isLastSection
                      ? "bg-green-200 text-green-700 cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  Save & Next
                </button>
              </div>
            </div>
          </>
        </div>

        {/* Question Navigation Component */}
        <div className="lg:col-span-3 col-span-full space-y-3">
          <QuestionNavigation
            questions={mockTestData[currentSectionIndex]?.questions || []}
            selectedQuestionIndex={currentQuestionIndex}
            onSelectQuestion={(index) => setCurrentQuestionIndex(index)}
            onSubmit={() => setSubmitted(true)}
            sectionName={
              mockTestData[currentSectionIndex]?.questions
                ?.filter((question) => question.subject === selectedSubject)
                .map((question) => question.subject)[0] || "Unknown Subject"
            }
            answeredQuestions={answeredQuestions[currentSectionIndex] || []}
            markedForReview={markedForReview[currentSectionIndex] || []}
          />
        </div>
      </div>
    </div>
  );
};

export default MockDemo;

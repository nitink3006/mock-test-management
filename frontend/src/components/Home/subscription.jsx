import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { AiOutlineQuestionCircle } from "react-icons/ai";

function Subscription() {
  const plans = [
    {
      name: "Basic Plan",
      price: "₹450",
      description: "Ideal for institutes with up to 50 students per month.",
      features: [
        { text: "Mock tests accessible for up to 50 students", available: true },
        { text: "500+ Practice Questions for diverse topics", available: true },
        { text: "Detailed Explanations for correct answers", available: false },
        { text: "Basic Tracking of student progress", available: true },
        { text: "Standard Support for setup and queries", available: null },
      ],
    },
    {
      name: "Standard Plan",
      price: "₹599",
      description: "Perfect for institutes with up to 100 students per month.",
      features: [
        { text: "Mock tests accessible for up to 100 students", available: true },
        { text: "1000+ Practice Questions across subjects", available: true },
        { text: "Detailed Explanations for all questions", available: true },
        { text: "Advanced Tracking with performance insights", available: true },
        { text: "Priority Support for faster assistance", available: null },
      ],
    },
  ];

  return (
    <section className="bg-white">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:pb-16 lg:px-6">
        <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h1 className="mb-4 text-4xl md:text-5xl tracking-tight font-extrabold text-gray-900">
            Subscription<span className="text-[#007bff]"> Plan</span>
          </h1>
          <h6 className="mb-5 font-light text-gray-500 sm:text-xl">
            Get access to premium mock tests designed for group or individual preparation.
          </h6>
        </div>
        {/* Apply `items-stretch` to make cards uniform in height */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {plans.map((plan, index) => (
            <article
              key={index}
              className="flex flex-col p-6 mx-auto max-w-lg text-center bg-white rounded-lg border border-gray-200 shadow-md"
            >
              <h3 className="mb-4 text-2xl font-semibold text-gray-900">
                {plan.name}
              </h3>
              <p className="font-light text-gray-500 text-lg">
                {plan.description}
              </p>
              <div className="flex justify-center items-baseline my-8">
                <span className="mr-2 text-5xl font-extrabold">{plan.price}</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="mb-8 space-y-4 text-left">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center space-x-3"
                    aria-label={feature.text}
                  >
                    {feature.available === true ? (
                      <FaCheckCircle className="text-green-500" aria-hidden="true" />
                    ) : feature.available === false ? (
                      <FaTimesCircle className="text-red-500" aria-hidden="true" />
                    ) : (
                      <AiOutlineQuestionCircle className="text-gray-400" aria-hidden="true" />
                    )}
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
              <button
                className="text-white bg-[#007bff] hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                aria-label={`Subscribe to the ${plan.name}`}
              >
                Subscribe Now
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Subscription;

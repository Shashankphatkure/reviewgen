"use client";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion } from "framer-motion";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const categories = [
  "General Experience",
  "Technical Skills",
  "Communication",
  "Leadership",
  "Problem Solving",
];

const courses = [
  "Select Course",
  "Full Stack Development",
  "Data Structures & Algorithms",
  "System Design",
  "DevOps Engineering",
  "Cloud Computing",
  "Machine Learning",
];

// Pre-filled reviews for each course
const courseReviews = {
  "Full Stack Development": `Shashank's full stack development course was incredible. His explanation of both frontend and backend concepts was crystal clear. The projects we built were practical and industry-relevant.
    The way he explained React concepts and Node.js architecture was exceptional.
    His teaching methodology and hands-on approach really helped me land my first dev role.`,

  "Data Structures & Algorithms": `Shashank's DSA course transformed my problem-solving abilities. His systematic approach to breaking down complex problems was invaluable.
    The way he teaches dynamic programming and graph algorithms is simply outstanding.
    Thanks to his course, I cleared multiple FAANG interviews.`,

  "System Design": `The system design course by Shashank was eye-opening. His real-world examples and architectural insights were fantastic.
    His explanation of scalability concepts and distributed systems was very practical.
    The case studies of real companies' architecture were extremely helpful.`,

  "DevOps Engineering": `Shashank's DevOps course was comprehensive and practical. His coverage of CI/CD pipelines and container orchestration was excellent.
    The hands-on labs with Docker and Kubernetes were incredibly well-structured.
    His insights into DevOps best practices were invaluable.`,

  "Cloud Computing": `The cloud computing course exceeded my expectations. Shashank's expertise in AWS and cloud architecture is remarkable.
    His explanations of cloud services and best practices were very clear.
    The real-world projects helped me understand enterprise cloud deployment.`,

  "Machine Learning": `Shashank's machine learning course was outstanding. His ability to explain complex concepts in simple terms is remarkable.
    The practical implementations and real-world case studies were very helpful.
    His coverage of neural networks and deep learning was comprehensive yet accessible.`,
};

export default function Home() {
  const [inputReviews, setInputReviews] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("Select Course");
  const [generatedReview, setGeneratedReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState("General Experience");
  const [generatedReviews, setGeneratedReviews] = useState([]);
  const [copiedReviews, setCopiedReviews] = useState(new Set());

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  // Handle course change
  const handleCourseChange = async (course) => {
    setSelectedCourse(course);

    if (course !== "Select Course") {
      setInputReviews(courseReviews[course]);
      // Auto generate reviews for the selected course
      try {
        setLoading(true);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Based on these customer reviews about Shashank: "${courseReviews[course]}"
        Generate 3 different, authentic ${selectedCategory} reviews about Shashank with 5 star rating sentiment.
        Format each review to start with "###REVIEW###" and end with "###END###".
        Keep them natural and conversational.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const reviews = text
          .split("###REVIEW###")
          .filter((review) => review.trim().length > 0)
          .map((review) => review.replace("###END###", "").trim());

        setGeneratedReviews([]);

        reviews.forEach((reviewText) => {
          const newReview = {
            text: reviewText,
            category: selectedCategory,
            rating: 5,
            timestamp: new Date().toISOString(),
            id: Math.random().toString(36).substr(2, 9),
          };
          setGeneratedReviews((prev) => [newReview, ...prev]);
        });
      } catch (error) {
        console.error("Error generating review:", error);
        setGeneratedReview("Error generating review. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // Clear everything when "Select Course" is chosen
      setInputReviews("");
      setGeneratedReviews([]);
    }
  };

  const generateReview = async () => {
    try {
      setLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Based on these customer reviews about Shashank: "${inputReviews}"
      Generate 10 different, authentic ${selectedCategory} reviews about Shashank with 5 star rating sentiment.
      Format each review to start with "###REVIEW###" and end with "###END###".
      Keep them natural and conversational.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const reviews = text
        .split("###REVIEW###")
        .filter((review) => review.trim().length > 0)
        .map((review) => review.replace("###END###", "").trim());

      setGeneratedReviews([]);

      reviews.forEach((reviewText) => {
        const newReview = {
          text: reviewText,
          category: selectedCategory,
          rating: 5,
          timestamp: new Date().toISOString(),
          id: Math.random().toString(36).substr(2, 9),
        };
        setGeneratedReviews((prev) => [newReview, ...prev]);
      });
    } catch (error) {
      console.error("Error generating review:", error);
      setGeneratedReview("Error generating review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedReviews((prev) => new Set([...prev, id]));

      const button = document.getElementById(`copy-btn-${id}`);

      const originalText = button.innerHTML;
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Copied!
      `;

      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Add this new function after the copyToClipboard function
  const copyAllReviews = async () => {
    try {
      const allReviewsText = generatedReviews
        .slice(0, 10)
        .map((review) => review.text)
        .join("\n\n");

      await navigator.clipboard.writeText(allReviewsText);

      // Show temporary success message
      const button = document.getElementById("copy-all-btn");
      const originalText = button.innerHTML;
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        All Copied!
      `;

      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy all reviews: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 transition-all duration-500">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Review Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Generate authentic reviews about Shashank using AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-6 border border-white/20"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 }}
              >
                <label className="block text-gray-700 font-semibold mb-2 text-lg">
                  Select Course
                </label>
                <div className="relative">
                  <select
                    value={selectedCourse}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className={`w-full p-4 border border-gray-200 rounded-2xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 appearance-none hover:border-blue-300 ${
                      selectedCourse === "Select Course"
                        ? "text-gray-500"
                        : "text-gray-700"
                    }`}
                  >
                    {courses.map((course) => (
                      <option
                        key={course}
                        value={course}
                        disabled={course === "Select Course"}
                        className={
                          course === "Select Course"
                            ? "text-gray-500"
                            : "text-gray-700"
                        }
                      >
                        {course}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.4 }}
              >
                <label className="block text-gray-700 font-semibold mb-2 text-lg">
                  Review Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-2xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 appearance-none hover:border-blue-300"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <label className="block text-gray-700 font-semibold mb-2 text-lg">
                  Input Reviews for {selectedCourse}
                </label>
                <textarea
                  className="w-full p-6 border border-gray-200 rounded-2xl bg-white/50 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-300"
                  value={inputReviews}
                  onChange={(e) => setInputReviews(e.target.value)}
                  placeholder="Pre-filled reviews for the selected course..."
                />
                <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
                  {inputReviews.length} characters
                </div>
              </motion.div>

              {selectedCourse !== "Select Course" && (
                <motion.button
                  onClick={generateReview}
                  disabled={loading || !inputReviews.trim()}
                  className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                    loading || !inputReviews.trim()
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl"
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    "Generate New Reviews ✨"
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Generated Reviews Section */}
          <motion.div
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Generated Reviews
              {generatedReviews.length > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Latest batch: {Math.min(10, generatedReviews.length)}{" "}
                  reviews)
                </span>
              )}
            </h2>

            {/* Latest Batch Section */}
            {generatedReviews.length > 0 && (
              <motion.div
                className="mb-8 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {/* Add this new button */}
                <motion.button
                  id="copy-all-btn"
                  onClick={copyAllReviews}
                  className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-xl border border-blue-200 hover:bg-blue-50 transition-all duration-200 group mb-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy All Reviews
                </motion.button>

                {generatedReviews.slice(0, 10).map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl border border-blue-100 hover:border-blue-300 transition-all duration-300 relative group ${
                      copiedReviews.has(review.id)
                        ? "ring-2 ring-purple-200"
                        : ""
                    }`}
                  >
                    {copiedReviews.has(review.id) && (
                      <div className="absolute inset-0 bg-purple-50 opacity-20 rounded-2xl pointer-events-none" />
                    )}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-blue-600">
                          Review {index + 1}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {review.category}
                        </span>
                      </div>
                      <span className="text-yellow-500 text-lg">
                        {"⭐".repeat(review.rating)}
                      </span>
                    </div>
                    <p className="text-gray-700 bg-white/80 p-5 rounded-xl shadow-sm">
                      {review.text}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <motion.button
                        id={`copy-btn-${review.id}`}
                        onClick={() => copyToClipboard(review.text, review.id)}
                        className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-xl border border-blue-200 hover:bg-blue-50 transition-all duration-200 group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy Review
                      </motion.button>
                      <span className="text-xs text-gray-500">
                        {new Date(review.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {generatedReviews.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">
                  No reviews generated yet. Start by generating your first
                  review!
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

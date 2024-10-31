"use client";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const categories = [
  "General Experience",
  "Technical Skills",
  "Communication",
  "Leadership",
  "Problem Solving",
];

export default function Home() {
  const [inputReviews, setInputReviews] = useState("");
  const [generatedReview, setGeneratedReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState("General Experience");
  const [generatedReviews, setGeneratedReviews] = useState([]);

  const generateReview = async () => {
    try {
      setLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Based on these customer reviews about Shashank: "${inputReviews}"
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
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);

      // Get the button element
      const button = document.getElementById(`copy-btn-${id}`);

      // Temporarily change the button text
      const originalText = button.innerHTML;
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Copied!
      `;

      // Revert back after 2 seconds
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Review Generator
          </h1>
          <p className="text-gray-600">
            Generate authentic reviews about Shashank using Gemini AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Review Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Input Reviews
              </label>
              <textarea
                className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={inputReviews}
                onChange={(e) => setInputReviews(e.target.value)}
                placeholder="Paste existing reviews here..."
              />
            </div>

            <button
              onClick={generateReview}
              disabled={loading || !inputReviews.trim()}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                loading || !inputReviews.trim()
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
              }`}
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
                "Generate Review"
              )}
            </button>
          </div>

          {/* Generated Reviews Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Generated Reviews
              {generatedReviews.length > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Latest batch: {Math.min(3, generatedReviews.length)} reviews)
                </span>
              )}
            </h2>

            {/* Latest Batch Section */}
            {generatedReviews.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-blue-600 mb-4">
                  Latest Generated Batch
                </h3>
                <div className="space-y-4">
                  {generatedReviews.slice(0, 3).map((review, index) => (
                    <div
                      key={review.id}
                      className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-blue-600 mr-2">
                            Review {index + 1}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {review.category}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-yellow-500">
                            {"⭐".repeat(review.rating)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 bg-white p-4 rounded-lg shadow-sm">
                        {review.text}
                      </p>
                      <div className="mt-3 flex justify-between items-center">
                        <button
                          id={`copy-btn-${review.id}`}
                          onClick={() =>
                            copyToClipboard(review.text, review.id)
                          }
                          className="flex items-center px-3 py-1.5 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
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
                        </button>
                        <span className="text-xs text-gray-500">
                          {new Date(review.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Reviews Section */}
            {generatedReviews.length > 3 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-4">
                  Previous Reviews
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {generatedReviews.slice(3).map((review) => (
                    <div
                      key={review.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-blue-600">
                          {review.category}
                        </span>
                        <div className="flex items-center">
                          <span className="text-yellow-500">
                            {"⭐".repeat(review.rating)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.text}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <button
                          onClick={() =>
                            copyToClipboard(review.text, review.id)
                          }
                          className="text-blue-500 hover:text-blue-600 flex items-center space-x-1 text-sm"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
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
                          <span>Copy Review</span>
                        </button>
                        <span className="text-xs text-gray-500">
                          {new Date(review.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {generatedReviews.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No reviews generated yet. Start by generating your first review!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

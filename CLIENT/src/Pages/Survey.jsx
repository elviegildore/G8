import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const SurveyList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("surveys")
        .select(`
          id,
          title,
          survey_questions (
            id,
            question_text,
            question_type,
            survey_options (
              id,
              option_text
            )
          )
        `);

      if (error) {
        console.error("❌ Error fetching surveys:", error.message);
      } else {
        setSurveys(data || []);
      }
      setLoading(false);
    };

    fetchSurveys();
  }, []);

  if (loading) return <p className="items-center">Loading surveys...</p>;

  if (surveys.length === 0) return <p>No surveys found.</p>;

  // Just show the first survey for simplicity
  const survey = surveys[0];
  const questions = survey.survey_questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4 font-[Montserrat tracking-widest]">{survey.title}</h1>

      {/* Page-like container */}
      <div className="border rounded-lg shadow-md h-[70vh] p-6 flex flex-col">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <p className="font-bold text-lg mb-3 font-[Poppins] tracking-widest">
            {currentQuestion?.question_text}
          </p>
          <ul className="space-y-2 ml-4 list-disc font-[Poppins] tracking-wide">
            {(currentQuestion?.survey_options || []).map((opt) => (
              <li key={opt.id}>{opt.option_text}</li>
            ))}
          </ul>
        </div>

        {/* Navigation */}
        <div className="mt-4 flex justify-between">
        
          <button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className="w-28 h-12 px-4 py-2 text-base bg-[#696969] text-white rounded disabled:opacity-50 hover:bg-[#555555]"
          >
            Previous
          </button>
          <button
            onClick={nextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            className="w-28 h-12 px-4 py-2 text-base bg-[#696969] text-white rounded disabled:opacity-50 hover:bg-[#555555]"
          >
            Next
          </button>


        </div>
      </div>
    </div>
  );
};

export default SurveyList;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const SurveyList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading surveys...</p>;

  console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Supabase Key:", import.meta.env.VITE_SUPABASE_ANON_KEY);


  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Available Surveys</h1>
      <ul className="space-y-4">
        {surveys.map((survey) => (
          <li
            key={survey.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition"
          >
            <Link
              to={`/survey/${survey.id}`}
              className="text-blue-600 font-semibold"
            >
              {survey.title}
            </Link>

            {/* Questions + options */}
            <ul className="mt-3 space-y-2">
              {(survey.survey_questions || []).map((q) => (
                <li key={q.id} className="border-t pt-2">
                  <p className="font-medium">{q.question_text}</p>
                  <ul className="ml-4 list-disc">
                    {(q.survey_options || []).map((opt) => (
                      <li key={opt.id}>{opt.option_text}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SurveyList;

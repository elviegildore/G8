// src/Pages/SurveyList.jsx
import { useEffect, useState } from "react";
import supabase from "../supabaseClient.js";
import { Eye, EyeOff } from "lucide-react";

const SurveyList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchSurveys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("surveys")
      .select(`
        id,
        title,
        description,
        is_published,
        survey_questions (
          id,
          question_text,
          question_type,
          survey_options (
            id,
            option_text
          )
        )
      `)
      .order("id", { ascending: true });

    if (error) {
      console.error("❌ Error fetching surveys:", error.message);
    } else {
      setSurveys(data || []);
    }
    setLoading(false);
  };

  const togglePublish = async (surveyId, currentStatus) => {
    const { error } = await supabase
      .from("surveys")
      .update({ is_published: !currentStatus })
      .eq("id", surveyId);

    if (error) {
      console.error("❌ Error updating publish status:", error.message);
    } else {
      fetchSurveys();
    }
  };

  useEffect(() => {
    fetchSurveys();

    const channel = supabase
      .channel("surveys-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "surveys" },
        () => {
          fetchSurveys();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredSurveys =
    filter === "all" ? surveys : surveys.filter((s) => s.title === filter);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-gray-600 mb-4"></div>
        <p className="text-lg font-semibold text-gray-700 font-[Poppins]">
          Loading surveys...
        </p>
      </div>
    );

  return (
    <div className="p-10 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <h1 className="text-3xl font-extrabold mb-8 font-[Montserrat] tracking-widest text-[#333] text-center">
        Survey List
      </h1>

      {/* 🔹 Filter Section */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-3 bg-white shadow-md px-6 py-3 rounded-xl border border-gray-200">
          <label className="font-semibold font-[Poppins] text-gray-700">
            Filter by:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-[Poppins] text-gray-700 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-all"
          >
            <option value="all">All</option>
            {surveys.map((s) => (
              <option key={s.id} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🔹 Centered Cards (auto height, nice balance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {filteredSurveys.map((survey) => (
          <div
            key={survey.id}
            className="w-[5in] border border-gray-200 rounded-2xl shadow-lg p-8 bg-white hover:shadow-2xl transition-transform duration-300 hover:scale-[1.01] flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold font-[Montserrat] text-[#222]">
                {survey.title}
              </h2>

              <button
                onClick={() => togglePublish(survey.id, survey.is_published)}
                className={`p-2 rounded-full border transition-all ${
                  survey.is_published
                    ? "bg-green-100 border-green-400 hover:bg-green-200"
                    : "bg-red-100 border-red-400 hover:bg-red-200"
                }`}
                title={
                  survey.is_published
                    ? "Unpublish this survey"
                    : "Publish this survey"
                }
              >
                {survey.is_published ? (
                  <Eye className="text-green-600 w-5 h-5" />
                ) : (
                  <EyeOff className="text-red-600 w-5 h-5" />
                )}
              </button>
            </div>

            {/* Description */}
            <p className="mb-4 text-gray-700 font-[Poppins] leading-relaxed">
              {survey.description}
            </p>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-[#333] text-white">
                  <tr>
                    <th className="border px-4 py-2 text-left w-1/3 font-[Montserrat] tracking-wider">
                      Question
                    </th>
                    <th className="border px-4 py-2 text-left w-2/3 font-[Montserrat] tracking-wider">
                      Choices
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {survey.survey_questions.map((q) => (
                    <tr
                      key={q.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="border px-4 py-2 font-[Poppins] text-gray-800 align-top">
                        {q.question_text}
                      </td>
                      <td className="border px-4 py-2 font-[Poppins] text-gray-700">
                        <ul className="list-disc ml-5 space-y-1">
                          {q.survey_options.map((opt) => (
                            <li key={opt.id}>{opt.option_text}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <p
              className={`mt-4 text-center font-[Poppins] text-sm font-semibold ${
                survey.is_published ? "text-green-600" : "text-red-600"
              }`}
            >
              {survey.is_published ? "Published" : "Unpublished"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurveyList;

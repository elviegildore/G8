import { useEffect, useState } from "react";
import supabase from "../supabaseClient.js";

const SurveyList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // 🔹 Fetch surveys
  const fetchSurveys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("surveys")
      .select(`
        id,
        title,
        description,
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

  useEffect(() => {
    fetchSurveys();

    // 🔹 Real-time subscription to auto-update when new survey is inserted
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

  // 🔹 Apply filter (by title)
  const filteredSurveys =
    filter === "all"
      ? surveys
      : surveys.filter((s) => s.title === filter);

  if (loading) return 
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-semibold">Loading surveys...</p>
    </div>;

  if (filteredSurveys.length === 0) return <p>No surveys found.</p>;

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-2xl font-bold mb-4 font-[Montserrat] tracking-widest">
        Survey List
      </h1>

      {/* 🔹 Filter dropdown (Survey Titles) */}
      <div className="mb-6">
        <label className="mr-2 font-semibold font-[Poppins]">Filter by survey:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option className="font-[Poppins]" value="all">All</option>
          {surveys.map((s) => (
            <option key={s.id} value={s.title}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 List surveys in table format */}
      {filteredSurveys.map((survey) => (
        <div
          key={survey.id}
          className="border rounded-lg shadow-md p-6 bg-white"
        >
          <h2 className="text-xl font-bold mb-2 font-[Montserrat]">{survey.title}</h2>
          <p className="mb-4 text-black font-[Poppins]">{survey.description}</p>

          <table className="w-full table-fixed border-collapse border rounded-md">
            <thead>
              <tr className="bg-[#696969]">
                <th className="border px-4 py-2 w-1/3 text-white font-[Montserrat] tracking-widest text-center">Question</th>
                <th className="border px-4 py-2 w-2/3 text-white font-[Montserrat] tracking-widest text-center">Choices</th>
              </tr>
            </thead>
            <tbody>
              {survey.survey_questions.map((q) => (
                <tr key={q.id}>
                  <td className="border px-4 py-2  font-[Poppins]">{q.question_text}</td>
                  <td className="border px-4 py-2 font-[Poppins]">
                    <ul className="list-disc ml-5">
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
      ))}
    </div>
  );
};

export default SurveyList;

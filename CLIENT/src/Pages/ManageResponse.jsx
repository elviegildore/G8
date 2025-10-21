// src/Pages/ManageResponse.jsx
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function DashboardCharts() {
  const [surveyData, setSurveyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveyResponses();
  }, []);

  const fetchSurveyResponses = async () => {
    try {
      const { data, error } = await supabase
        .from("survey_response")
        .select("survey_id, survey_title, question, answer");

      if (error) {
        console.error("❌ Supabase fetch error:", error);
        return;
      }

      if (!data || data.length === 0) {
        setSurveyData([]);
        return;
      }

      // Group responses by survey_id
      const grouped = Object.values(
        data.reduce((acc, curr) => {
          if (!acc[curr.survey_id]) {
            acc[curr.survey_id] = {
              survey_id: curr.survey_id,
              survey_title: curr.survey_title,
              responses: [],
            };
          }
          acc[curr.survey_id].responses.push(curr);
          return acc;
        }, {})
      );

      setSurveyData(grouped);
    } catch (err) {
      console.error("⚠️ Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#4F46E5", "#22C55E", "#FACC15", "#F97316", "#EF4444"];

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 font-medium animate-pulse text-lg">
          Loading analytics...
        </p>
      </div>
    );

  if (surveyData.length === 0)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white p-10 rounded-2xl shadow-md border border-gray-200 text-center w-full max-w-xl">
          <h2 className="text-3xl font-semibold text-gray-700 mb-3">
            No Survey Responses Yet
          </h2>
          <p className="text-gray-500 text-lg">
            Once responses are submitted, you’ll see the analytics appear here.
          </p>
          <div className="mt-8 w-[350px] h-[220px] bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
            <p className="text-gray-400 italic text-sm">📊 Chart Preview</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-screen px-6">
      <div className="w-full max-w-6xl space-y-10">
        {surveyData.map((survey) => {
          const answerCounts = {};
          survey.responses.forEach((r) => {
            answerCounts[r.answer] = (answerCounts[r.answer] || 0) + 1;
          });

          const chartData = Object.keys(answerCounts).map((key) => ({
            answer: key,
            count: answerCounts[key],
          }));

          return (
            <div
              key={survey.survey_id}
              className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center">
                {survey.survey_title}
              </h2>

              <div className="flex flex-wrap justify-center gap-10">
                {/* Bar Chart */}
                <div className="h-[350px] w-[400px] flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="answer" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="count"
                        fill="#4F46E5"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="h-[350px] w-[400px] flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="count"
                        nameKey="answer"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ManageResponse() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-8">
      <h1 className="text-4xl font-bold mb-10 text-gray-800 text-center">
        Survey Analytics
      </h1>
      <DashboardCharts />
    </div>
  );
}

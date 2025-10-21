import { useEffect, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import supabase from "../supabaseClient";

const COLORS = ["#8e24aa", "#e53935", "#43a047", "#fdd835", "#1e88e5", "#fb8c00"];
const UNITS = ["HHC", "ESC", "542ECB", "543ECB", "546ECB", "552ECB"];

export default function DashboardCharts() {
  const [unitData, setUnitData] = useState([]);
  const [counts, setCounts] = useState({
    training: 0,
    sample: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: users, error: userError } = await supabase
          .from("users")
          .select("unit");
        if (userError) throw userError;

        const unitCount = {};
        UNITS.forEach((unit) => (unitCount[unit] = 0));
        users.forEach((user) => {
          const unit = user.unit?.toUpperCase();
          if (UNITS.includes(unit)) {
            unitCount[unit] = (unitCount[unit] || 0) + 1;
          }
        });

        const formattedUnitData = UNITS.map((unit, index) => ({
          name: unit,
          value: unitCount[unit] || 0,
          color: COLORS[index % COLORS.length],
        }));

        const { data: surveys } = await supabase
          .from("surveys")
          .select("id, title");

        const trainingSurvey = surveys?.find(
          (s) => s.title === "53E INDIVIDUAL TRAINING PROFILE"
        );
        const sampleSurvey = surveys?.find(
          (s) => s.title === "SAMPLE SURVEY THIS IS SAMPLE DESCRIPTION"
        );

        const { count: trainingCount } = await supabase
          .from("survey_responses")
          .select("*", { count: "exact", head: true })
          .eq("survey_id", trainingSurvey?.id);

        const { count: sampleCount } = await supabase
          .from("survey_responses")
          .select("*", { count: "exact", head: true })
          .eq("survey_id", sampleSurvey?.id);

        setUnitData(formattedUnitData);
        setCounts({
          training: trainingCount || 0,
          sample: sampleCount || 0,
          totalUsers: users.length || 0,
        });
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  const dataTraining = [
    { name: "Answered", value: counts.training },
    { name: "Not Answered", value: Math.max(0, counts.totalUsers - counts.training) },
  ];

  const dataSample = [
    { name: "Answered", value: counts.sample },
    { name: "Not Answered", value: Math.max(0, counts.totalUsers - counts.sample) },
  ];

  const renderColumnLine = (title, data, showLegend = false, useCustomColors = false) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="bg-white p-6 rounded-2xl shadow-md w-full h-[420px] flex flex-col items-center justify-between">
        <h2 className="text-lg font-semibold text-center mb-2">{title}</h2>
        <div className="flex-grow w-full">
          <ResponsiveContainer>
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" barSize={50} radius={[6, 6, 0, 0]}>
                {useCustomColors
                  ? data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  : null}
              </Bar>
              <Line type="monotone" dataKey="value" stroke="#1e88e5" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {showLegend && (
          <div className="flex flex-wrap justify-center gap-4 mt-3">
            {data.map((entry) => {
              const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
              return (
                <div key={entry.name} className="flex items-center gap-2 text-sm font-medium">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span>
                    {entry.name} — {percent}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {renderColumnLine("Registered Users per Unit", unitData, true, true)}
      {renderColumnLine("53E Individual Training Profile", dataTraining)}
      {renderColumnLine("Sample Survey", dataSample)}
    </div>
  );
}

// AdminSurvey.js
import React, { useEffect, useState } from "react";

function Survey() {
  const [surveys, setSurveys] = useState([]);
  const [newSurveyTitle, setNewSurveyTitle] = useState("");

  useEffect(() => {
    fetch("/api/surveys")
      .then(res => res.json())
      .then(data => setSurveys(data));
  }, []);

  const createSurvey = () => {
    fetch("/api/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSurveyTitle })
    })
    .then(res => res.json())
    .then(survey => {
      setSurveys([...surveys, survey]);
      setNewSurveyTitle("");
    });
  };

  const deleteSurvey = (id) => {
    fetch(`/api/surveys/${id}`, { method: "DELETE" })
      .then(() => setSurveys(surveys.filter(s => s.id !== id)));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Manage Surveys</h2>

      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          className="border p-2"
          placeholder="New survey title"
          value={newSurveyTitle}
          onChange={(e) => setNewSurveyTitle(e.target.value)}
        />
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={createSurvey}
        >
          Add Survey
        </button>
      </div>

      <ul>
        {surveys.map(survey => (
          <li key={survey.id} className="flex justify-between items-center mb-2">
            <span>{survey.title}</span>
            <div className="flex gap-2">
              <button 
                className="bg-yellow-500 text-white px-2 py-1 rounded"
                onClick={() => alert("Edit survey UI not implemented")}
              >
                Edit
              </button>
              <button 
                className="bg-red-600 text-white px-2 py-1 rounded"
                onClick={() => deleteSurvey(survey.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Survey;

// src/Pages/ManageSurvey.jsx
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { Edit, Trash2, Plus, X } from "lucide-react";
import ManageSurveyModal from "../Components/ManageSurveyModal";
import { motion, AnimatePresence } from "framer-motion";

const QUESTION_TYPES = [
  { value: "short_text", label: "Short text" },
  { value: "paragraph", label: "Paragraph" },
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "checkbox", label: "Checkbox" },
  { value: "dropdown", label: "Dropdown" },
  { value: "scale", label: "Scale" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
];

export default function ManageSurvey() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSurveyId, setOpenSurveyId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [currentSurveyId, setCurrentSurveyId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    id: null,
    question_text: "",
    question_type: "short_text",
    options: [],
  });
  const [questionSaving, setQuestionSaving] = useState(false);

  const emptyQuestion = () => ({
    question_text: "",
    question_type: "short_text",
    options: [],
  });

  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    questions: [emptyQuestion()],
  });

  async function fetchSurveys() {
    setLoading(true);
    try {
      const { data: surveysData, error: sErr } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (sErr) throw sErr;

      const withRelations = await Promise.all(
        (surveysData || []).map(async (surv) => {
          const { data: qData, error: qErr } = await supabase
            .from("survey_questions")
            .select("*")
            .eq("survey_id", surv.id)
            .order("id", { ascending: true });

          if (qErr) throw qErr;

          const withOptions = await Promise.all(
            (qData || []).map(async (q) => {
              const { data: oData, error: oErr } = await supabase
                .from("survey_options")
                .select("*")
                .eq("question_id", q.id)
                .order("id", { ascending: true });

              if (oErr) throw oErr;
              return { ...q, options: oData || [] };
            })
          );
          return { ...surv, questions: withOptions };
        })
      );

      setSurveys(withRelations);
    } catch (err) {
      console.error("fetchSurveys error", err);
      alert("Error fetching surveys.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSurveys();
  }, []);

  function openCreateModal() {
    setForm({
      id: null,
      title: "",
      description: "",
      questions: [emptyQuestion()],
    });
    setIsModalOpen(true);
  }

  function openEditModal(survey) {
    const questions = (survey.questions || []).map((q) => ({
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      options: (q.options || []).map((o) => ({
        id: o.id,
        option_text: o.option_text,
      })),
    }));

    setForm({
      id: survey.id,
      title: survey.title || "",
      description: survey.description || "",
      questions: questions.length ? questions : [emptyQuestion()],
    });
    setIsModalOpen(true);
  }

  function openQuestionModal(survey, question = null) {
    setCurrentSurveyId(survey?.id ?? null);
    if (question) {
      setCurrentQuestion(question);
      setQuestionForm({
        id: question.id,
        question_text: question.question_text || "",
        question_type: question.question_type || "short_text",
        options: (question.options || []).map((o) => ({
          id: o.id,
          option_text: o.option_text,
        })),
      });
    } else {
      setCurrentQuestion(null);
      setQuestionForm({
        id: null,
        question_text: "",
        question_type: "short_text",
        options: [],
      });
    }
    setIsQuestionModalOpen(true);
  }

  async function handleSaveQuestion(e) {
    e.preventDefault();
    setQuestionSaving(true);
    try {
      if (!questionForm.question_text.trim()) {
        alert("Question text is required.");
        return;
      }

      if (questionForm.id) {
        const { error: qErr } = await supabase
          .from("survey_questions")
          .update({
            question_text: questionForm.question_text,
            question_type: questionForm.question_type,
            updated_at: new Date(),
          })
          .eq("id", questionForm.id);
        if (qErr) throw qErr;

        const { data: dbOpts = [] } = await supabase
          .from("survey_options")
          .select("*")
          .eq("question_id", questionForm.id);

        const dbOptIds = new Set(dbOpts.map((o) => o.id));

        for (const opt of questionForm.options || []) {
          if (opt.id) {
            await supabase
              .from("survey_options")
              .update({ option_text: opt.option_text })
              .eq("id", opt.id);
            dbOptIds.delete(opt.id);
          } else if (opt.option_text.trim()) {
            await supabase
              .from("survey_options")
              .insert({
                question_id: questionForm.id,
                option_text: opt.option_text,
              });
          }
        }

        if (dbOptIds.size) {
          await supabase
            .from("survey_options")
            .delete()
            .in("id", Array.from(dbOptIds));
        }
      } else {
        const { data: newQ } = await supabase
          .from("survey_questions")
          .insert([
            {
              survey_id: currentSurveyId,
              question_text: questionForm.question_text,
              question_type: questionForm.question_type,
            },
          ])
          .select()
          .single();

        for (const opt of questionForm.options || []) {
          if (opt.option_text.trim()) {
            await supabase
              .from("survey_options")
              .insert({
                question_id: newQ.id,
                option_text: opt.option_text,
              });
          }
        }
      }

      await fetchSurveys();
      setIsQuestionModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error saving question.");
    } finally {
      setQuestionSaving(false);
    }
  }

  async function handleDeleteSurvey(id) {
    if (!window.confirm("Delete this survey and its contents?")) return;
    await supabase.from("surveys").delete().eq("id", id);
    fetchSurveys();
  }

  async function handleDeleteQuestionDB(id) {
    if (!window.confirm("Delete this question?")) return;
    await supabase.from("survey_questions").delete().eq("id", id);
    fetchSurveys();
  }

  function formatDate(dt) {
    return dt ? new Date(dt).toLocaleString() : "-";
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-3xl font-bold font-[Montserrat] tracking-widest text-gray-800">
          Manage Surveys
        </h1>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md font-[Poppins] hover:bg-green-800 transition"
          >
            <Plus size={18} /> Add Survey
          </button>
          <button
            onClick={fetchSurveys}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-[Poppins] hover:bg-gray-300 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 font-[Poppins] text-gray-500 text-lg">
          Fetching surveys...
        </div>
      ) : surveys.length === 0 ? (
        <div className="text-center py-12 font-[Poppins] text-gray-500 text-lg">
          No surveys yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {surveys.map((s) => (
            <div
              key={s.id}
              className="bg-white shadow rounded-lg p-5 border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-bold text-xl text-green-800">{s.title}</h2>
                  <p className="text-gray-700 font-[Poppins] mt-1">
                    {s.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Created: {formatDate(s.created_at)} | Updated:{" "}
                    {formatDate(s.updated_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="bg-green-700 text-white flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-800 transition"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSurvey(s.id)}
                    className="bg-red-600 text-white flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-700 transition"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <button
                  onClick={() =>
                    setOpenSurveyId(openSurveyId === s.id ? null : s.id)
                  }
                  className="text-green-700 font-[Poppins] underline text-sm hover:text-green-900"
                >
                  {openSurveyId === s.id ? "Hide Questions" : "Manage Questions"}
                </button>

                {openSurveyId === s.id && (
                  <div className="mt-4 space-y-3">
                    {(s.questions || []).length === 0 ? (
                      <div className="text-sm text-gray-500 font-[Poppins]">
                        No questions yet.
                      </div>
                    ) : (
                      s.questions.map((q) => (
                        <div
                          key={q.id}
                          className="border rounded-md p-3 bg-gray-50 hover:bg-green-50 transition"
                        >
                          <div className="flex flex-col sm:flex-row justify-between gap-2">
                            <div>
                              <p className="font-medium">{q.question_text}</p>
                              <p className="text-xs text-gray-600">
                                {q.question_type}
                              </p>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => openQuestionModal(s, q)}
                                className="text-green-700 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteQuestionDB(q.id)}
                                className="text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <button
                      onClick={() => openQuestionModal(s, null)}
                      className="text-sm text-green-700 hover:underline font-[Poppins]"
                    >
                      + Add Question
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
  <ManageSurveyModal
    form={form}
    setForm={setForm}
    onClose={(reason, newSurvey) => {
      setIsModalOpen(false);

      if (reason === "saved" && newSurvey) {
        // Update surveys list instantly without refreshing
        setSurveys((prev) => [newSurvey, ...prev]);
      } else if (reason && reason !== "cancel") {
        fetchSurveys();
      }
    }}
    saving={saving}
  />
)}


      {isQuestionModalOpen && (
        <ManageQuestionModal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          currentQuestion={currentQuestion}
          questionForm={questionForm}
          setQuestionForm={setQuestionForm}
          handleSaveQuestion={handleSaveQuestion}
          QUESTION_TYPES={QUESTION_TYPES}
          saving={questionSaving}
        />
      )}
    </div>
  );
}

function ManageQuestionModal({
  isOpen,
  onClose,
  currentQuestion,
  questionForm,
  setQuestionForm,
  handleSaveQuestion,
  QUESTION_TYPES,
  saving,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-xl shadow-lg p-6 space-y-4 overflow-y-auto max-h-[90vh] border border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-green-800">
            {currentQuestion ? "Edit Question" : "Add Question"}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Question Text
            </label>
            <input
              className="w-full border p-2 rounded focus:outline-green-700"
              value={questionForm.question_text}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  question_text: e.target.value,
                })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              className="w-full border p-2 rounded focus:outline-green-700"
              value={questionForm.question_type}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  question_type: e.target.value,
                })
              }
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {(questionForm.question_type === "multiple_choice" ||
            questionForm.question_type === "checkbox" ||
            questionForm.question_type === "dropdown") && (
            <div>
              <label className="block text-sm font-medium mb-1">Options</label>
              <div className="space-y-2">
                {(questionForm.options || []).map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={opt.option_text}
                      onChange={(e) => {
                        const updated = [...questionForm.options];
                        updated[i].option_text = e.target.value;
                        setQuestionForm({
                          ...questionForm,
                          options: updated,
                        });
                      }}
                      className="flex-1 border p-2 rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionForm({
                          ...questionForm,
                          options: questionForm.options.filter(
                            (_, j) => j !== i
                          ),
                        })
                      }
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setQuestionForm({
                      ...questionForm,
                      options: [
                        ...(questionForm.options || []),
                        { option_text: "" },
                      ],
                    })
                  }
                  className="text-green-700 text-sm hover:underline"
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

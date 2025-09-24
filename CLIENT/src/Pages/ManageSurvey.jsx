// src/Pages/ManageSurvey.jsx
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { Edit, Trash2, Plus, X, Trash } from "lucide-react";
import ManageSurveyModal from "../Components/ManageSurveyModal"; // keep your survey modal

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

  // UI state
  const [openSurveyId, setOpenSurveyId] = useState(null); // which survey's panel is open
  const [isModalOpen, setIsModalOpen] = useState(false); // survey create/edit modal
  const [saving, setSaving] = useState(false);

  // Question modal state (new)
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

  // Survey form state (used for both add & edit)
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

  // Fetch nested surveys -> questions -> options
  async function fetchSurveys() {
    setLoading(true);
    try {
      const { data: surveysData, error: sErr } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (sErr) throw sErr;

      // Attach questions and options
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
      alert("Error fetching surveys. See console.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSurveys();
  }, []);

  // ---------- Survey create/edit (kept as you had it) ----------
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
      options: (q.options || []).map((o) => ({ id: o.id, option_text: o.option_text })),
    }));

    setForm({
      id: survey.id,
      title: survey.title || "",
      description: survey.description || "",
      questions: questions.length ? questions : [emptyQuestion()],
    });
    setIsModalOpen(true);
  }
  // ---------- Question modal helpers (new) ----------
  function openQuestionModal(survey, question = null) {
    // survey: the survey object where the question belongs
    setCurrentSurveyId(survey?.id ?? null);

    if (question) {
      // editing an existing question
      setCurrentQuestion(question);
      setQuestionForm({
        id: question.id,
        question_text: question.question_text || "",
        question_type: question.question_type || "short_text",
        options: (question.options || []).map((o) => ({ id: o.id, option_text: o.option_text })),
      });
    } else {
      // creating a new question for this survey
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
      if (!questionForm.question_text || !questionForm.question_text.trim()) {
        alert("Question text is required.");
        setQuestionSaving(false);
        return;
      }

      // UPDATE existing question
      if (questionForm.id) {
        // update question row
        const { error: qErr } = await supabase
          .from("survey_questions")
          .update({
            question_text: questionForm.question_text,
            question_type: questionForm.question_type,
            updated_at: new Date(),
          })
          .eq("id", questionForm.id);

        if (qErr) throw qErr;

        // fetch current DB options for this question
        const { data: dbOpts = [], error: dbOptsErr } = await supabase
          .from("survey_options")
          .select("*")
          .eq("question_id", questionForm.id);

        if (dbOptsErr) throw dbOptsErr;

        const dbOptIds = new Set(dbOpts.map((o) => o.id));

        // upsert options from form
        for (const opt of questionForm.options || []) {
          if (opt.id) {
            const { error: upErr } = await supabase
              .from("survey_options")
              .update({ option_text: opt.option_text, updated_at: new Date() })
              .eq("id", opt.id);
            if (upErr) throw upErr;
            dbOptIds.delete(opt.id);
          } else {
            if (!opt.option_text || !opt.option_text.trim()) continue;
            const { error: inErr } = await supabase
              .from("survey_options")
              .insert({ question_id: questionForm.id, option_text: opt.option_text });
            if (inErr) throw inErr;
          }
        }

        // delete options that were removed in the form
        if (dbOptIds.size) {
          const idsToDelete = Array.from(dbOptIds);
          const { error: delErr } = await supabase
            .from("survey_options")
            .delete()
            .in("id", idsToDelete);
          if (delErr) throw delErr;
        }
      } else {
        // CREATE new question and its options
        if (!currentSurveyId) {
          alert("Missing survey ID for new question.");
          setQuestionSaving(false);
          return;
        }

        const { data: newQ, error: newQErr } = await supabase
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

        if (newQErr) throw newQErr;

        // insert options
        for (const opt of questionForm.options || []) {
          if (!opt.option_text || !opt.option_text.trim()) continue;
          const { error: inOptErr } = await supabase
            .from("survey_options")
            .insert({ question_id: newQ.id, option_text: opt.option_text });
          if (inOptErr) throw inOptErr;
        }
      }

      // refresh UI
      await fetchSurveys();
      setIsQuestionModalOpen(false);
    } catch (err) {
      console.error("handleSaveQuestion error", err);
      alert("Error saving question. See console.");
    } finally {
      setQuestionSaving(false);
    }
  }

  // ---------- existing DB delete helpers (unchanged) ----------
  async function handleDeleteSurvey(surveyId) {
    if (!window.confirm("Are you sure? This will delete the survey and all related questions/options.")) return;
    try {
      const { error } = await supabase.from("surveys").delete().eq("id", surveyId);
      if (error) throw error;
      await fetchSurveys();
    } catch (err) {
      console.error("delete survey", err);
      alert("Error deleting survey. See console.");
    }
  }

  async function handleDeleteQuestionDB(questionId) {
    if (!window.confirm("Delete this question?")) return;
    try {
      const { error } = await supabase.from("survey_questions").delete().eq("id", questionId);
      if (error) throw error;
      await fetchSurveys();
    } catch (err) {
      console.error(err);
      alert("Error deleting question. See console.");
    }
  }

  async function handleDeleteOptionDB(optionId) {
    if (!window.confirm("Delete this option?")) return;
    try {
      const { error } = await supabase.from("survey_options").delete().eq("id", optionId);
      if (error) throw error;
      await fetchSurveys();
    } catch (err) {
      console.error(err);
      alert("Error deleting option. See console.");
    }
  }

  // UI helpers
  function formatDate(dt) {
    if (!dt) return "-";
    try {
      return new Date(dt).toLocaleString();
    } catch {
      return dt;
    }
  }

  // ------------------- RETURN JSX (unchanged layout but wired to openQuestionModal) -------------------
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold font-[Montserrat] tracking-widest">Manage Surveys</h1>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button
            onClick={openCreateModal}
            className="font-[Poppins] tracking-normal px-3 py-2 bg-green-800 text-white rounded flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus size={16} /> Add Survey
          </button>
          <button
            onClick={fetchSurveys}
            className="font-[Poppins] tracking-normal px-3 py-2 bg-gray-200 rounded w-full sm:w-auto"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-[min-content] w-full text-center border-collapse">
          <thead className="bg-gray-500 text-sm sm:text-base text-white font-[Montserrat] tracking-widest">
            <tr>
              <th className="px-4 p-1 border font-[Poppins] tracking-wide font-semibold uppercase">Survey</th>
              <th className="px-4 p-1 border font-[Poppins] tracking-wide font-semibold uppercase">Manage</th>
              <th className="px-4 p-1 border font-[Poppins] tracking-wide font-semibold uppercase">Created</th>
              <th className="px-4 p-1 border font-[Poppins] tracking-wide font-semibold uppercase">Last Edited</th>
              <th className="px-4 p-1 border font-[Poppins] tracking-wide font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center font-[Montserrat] text-xl"
                  style={{ minHeight: "400px" }}
                >
                  Fetching data from database...
                </td>
              </tr>
            ) : surveys.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center font-[Montserrat] text-xl">
                  No surveys yet
                </td>
              </tr>
            ) : (
              surveys.map((s) => (
                <tr key={s.id} className="align-top border-t text-sm sm:text-base space-y-3">
                  <td className="px-4 py-3 w-full sm:w-1/3">
                    <div className="font-semibold font-[Poppins] text-lg tracking-widest">{s.title}</div>
                    <div className="text-sm text-black font-[Poppins] mt-4">{s.description}</div>
                  </td>

                  <td className="px-4 py-3 w-full sm:w-1/3">
                    <button
                      onClick={() =>
                        setOpenSurveyId(openSurveyId === s.id ? null : s.id)
                      }
                      className="text-white hover:underline mb-2 font-[Poppins] border rounded-sm bg-green-800 p-3 text-sm"
                    >
                      {openSurveyId === s.id ? "Hide Questions" : "Manage Questions"}
                    </button>

                    {/* Collapsible area */}
                    {openSurveyId === s.id && (
                      <div className="mt-3 space-y-3">
                        {(s.questions || []).length === 0 ? (
                          <div className="text-sm text-black font-[Poppins]">No questions yet</div>
                        ) : (
                          (s.questions || []).map((q) => (
                            <div
                              key={q.id}
                              className="p-3 bg-gray-50 rounded border flex flex-col gap-3"
                            >
                              <div className="flex flex-col sm:flex-row justify-between gap-3">
                                <div>
                                  <div className="font-medium font-[Poppins]">{q.question_text}</div>
                                  <div className="text-xs text-black font-[Poppins]">
                                    {q.question_type}
                                  </div>
                                  <div className="text-xs text-black font-[Poppins]">
                                    Created: {formatDate(q.created_at)} | Updated:{" "}
                                    {formatDate(q.updated_at)}
                                  </div>
                                </div>
                                <div className="flex flex-row sm:flex-col gap-2">
                                  <button
                                    className="text-green-800 font-[Poppins]"
                                    onClick={() => openQuestionModal(s, q)}
                                  >
                                    Edit Question
                                  </button>
                                  <button
                                    className="text-red-600 font-[Poppins]"
                                    onClick={() => handleDeleteQuestionDB(q.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}

                        <div>
                          <button
                            onClick={() => openQuestionModal(s, null)}
                            className="text-green-800 font-[Poppins]"
                          >
                            Add Question
                          </button>
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 font-[Poppins]">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-3 font-[Poppins]">
                    {s.updated_at ? formatDate(s.updated_at) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="font-[Poppins] flex items-center justify-center gap-2 text-white bg-green-800 px-4 py-2 rounded w-full sm:w-28 hover:opacity-70"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSurvey(s.id)}
                        className="font-[Poppins] flex items-center justify-center gap-2 text-white bg-red-600 px-4 py-2 rounded w-full sm:w-28 hover:opacity-70"
                      >
                        <Trash size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Survey modal (your existing component) */}
      {isModalOpen && (
          <ManageSurveyModal
              form={form}
              setForm={setForm}
              onClose={() => setIsModalOpen(false)}
              saving={saving}
              handleSaveSurvey={handleSaveSurvey}   // ❌ THIS FUNCTION DOESN’T EXIST
              addQuestionAt={addQuestionAt}
              updateQuestion={updateQuestion}
              updateOption={updateOption}
              removeOption={removeOption}
              removeQuestion={removeQuestion}
              QUESTION_TYPES={QUESTION_TYPES}
            />
      )}

      {/* Question modal (new) */}
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

/* ---------------------------
   Inline ManageQuestionModal
   (You can move this to Components/ManageQuestionModal.jsx if you prefer.)
   --------------------------- */
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white w-[95%] sm:w-[600px] max-h-[90vh] rounded-lg shadow-lg overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold">{currentQuestion ? "Edit Question" : "New Question"}</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Question</label>
            <input
              required
              className="w-full border p-2 rounded"
              value={questionForm.question_text}
              onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Type</label>
            <select
              className="w-full border p-2 rounded"
              value={questionForm.question_type}
              onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })}
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
              <label className="block text-sm font-medium">Options</label>
              <div className="space-y-2 mt-2">
                {(questionForm.options || []).map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={opt.option_text}
                      onChange={(e) => {
                        const updated = [...(questionForm.options || [])];
                        updated[i] = { ...updated[i], option_text: e.target.value };
                        setQuestionForm({ ...questionForm, options: updated });
                      }}
                      className="flex-1 border p-2 rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionForm({
                          ...questionForm,
                          options: (questionForm.options || []).filter((_, j) => j !== i),
                        })
                      }
                      className="text-red-600"
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
                      options: [...(questionForm.options || []), { option_text: "" }],
                    })
                  }
                  className="text-blue-600 text-sm mt-1"
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

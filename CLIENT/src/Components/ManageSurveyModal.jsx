const ManageSurveyModal = ({
  isOpen,
  onClose,
  currentQuestion,
  questionForm,
  setQuestionForm,
  handleSaveQuestion,
  QUESTION_TYPES,
}) => {
  if (!isOpen) return null; // <-- hide modal when not open

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white w-full sm:w-[600px] max-h-[90vh] rounded-lg shadow-lg overflow-y-auto p-6">
        <h2 className="text-xl font-semibold mb-4">
          {currentQuestion ? "Edit Question" : "New Question"}
        </h2>

        <form onSubmit={handleSaveQuestion} className="space-y-4">
          {/* Question text */}
          <div>
            <label className="block text-sm font-medium">Question</label>
            <input
              required
              className="w-full border p-2 rounded"
              value={questionForm.question_text}
              onChange={(e) =>
                setQuestionForm({ ...questionForm, question_text: e.target.value })
              }
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select
              className="w-full border p-2 rounded"
              value={questionForm.question_type}
              onChange={(e) =>
                setQuestionForm({ ...questionForm, question_type: e.target.value })
              }
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Options (conditional) */}
          {(questionForm.question_type === "multiple_choice" ||
            questionForm.question_type === "checkbox" ||
            questionForm.question_type === "dropdown") && (
            <div>
              <label className="block text-sm font-medium">Options</label>
              <div className="space-y-2">
                {questionForm.options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={opt.option_text}
                      onChange={(e) => {
                        const updated = [...questionForm.options];
                        updated[i].option_text = e.target.value;
                        setQuestionForm({ ...questionForm, options: updated });
                      }}
                      className="flex-1 border p-2 rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionForm({
                          ...questionForm,
                          options: questionForm.options.filter((_, j) => j !== i),
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
                      options: [...questionForm.options, { option_text: "" }],
                    })
                  }
                  className="text-blue-600 text-sm"
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageSurveyModal;

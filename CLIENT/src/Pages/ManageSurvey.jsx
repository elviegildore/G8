import { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";

function ManageSurvey() {
  const [surveys, setSurveys] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Fetch surveys from backend
  const fetchSurveys = async () => {
    const res = await fetch("/api/surveys"); // adjust API endpoint
    setSurveys(await res.json());
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  // Create or Update Survey
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      // update
      await fetch(`/api/surveys/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    } else {
      // create
      await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    }

    setTitle("");
    setEditingId(null);
    fetchSurveys();
  };

  // Delete Survey
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this survey?")) return;
    await fetch(`/api/surveys/${id}`, { method: "DELETE" });
    setSurveys(surveys.filter((s) => s.id !== id));
  };

  // Edit Survey
  const handleEdit = (survey) => {
    setTitle(survey.title);
    setEditingId(survey.id);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📋 Survey Manager</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2 mb-6"
      >
        <input
          type="text"
          placeholder="Survey Title"
          className="flex-1 border rounded-lg px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {editingId ? "Update" : "Add"}
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 border-b">ID</th>
              <th className="px-4 py-3 border-b">Title</th>
              <th className="px-4 py-3 border-b">Created At</th>
              <th className="px-4 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {surveys.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center text-gray-500 py-4"
                >
                  No surveys yet.
                </td>
              </tr>
            ) : (
              surveys.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b">{s.id}</td>
                  <td className="px-4 py-3 border-b">{s.title}</td>
                  <td className="px-4 py-3 border-b">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border-b">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(s)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageSurvey;
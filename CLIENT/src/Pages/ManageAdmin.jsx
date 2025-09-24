import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import supabase from "../supabaseClient";

const ManageAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
  rank: "",
  fullname: "",
  serial_number: "",
  unit: "",
  office_designation: "",  
  skills: "",            
  password: "",           
  role: "user",
});

  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Fetch admins with optional search filter
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("users")             // <- make sure your table name is exactly "users"
        .select("*")
        .in("role", ["admin", "sub_admin"])
        .order("id", { ascending: true });

      if (search.trim() !== "") {
        // Use ilike (case-insensitive) across columns
        query = query.or(
          `fullname.ilike.%${search}%,rank.ilike.%${search}%,unit.ilike.%${search}%,serial_number.ilike.%${search}%`
        );
      }

      const { data, error } = await query;
      if (error) {
        console.error("Fetch admins error:", error);
        setFeedback({ type: "error", message: `Fetch error: ${error.message}` });
      } else {
        setAdmins(data || []);
        setFeedback(null);
      }
    } catch (err) {
      console.error("Unexpected fetch error:", err);
      setFeedback({ type: "error", message: "Unexpected fetch error (check console)" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [search]);

  // Validate required fields
  const validate = () => {
    const { rank, fullname, serial_number, unit } = formData;
    if (!rank?.trim() || !fullname?.trim() || !serial_number?.trim() || !unit?.trim()) {
      setFeedback({ type: "error", message: "Please fill all fields." });
      return false;
    }
    return true;
  };

  // Submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!validate()) return;

    setSubmitLoading(true);

    try {
      // If inserting, optionally check uniqueness of serial_number first
      if (!editingId) {
        const { data: existing, error: existsErr } = await supabase
          .from("users")
          .select("id")
          .eq("serial_number", formData.serial_number)
          .limit(1)
          .maybeSingle();

        if (existsErr) {
          console.error("Exist check error:", existsErr);
          // continue — will likely fail on insert if constraint exists
        } else if (existing) {
          setFeedback({ type: "error", message: "Serial number already exists." });
          setSubmitLoading(false);
          return;
        }
      }

      if (editingId) {
        const { data, error } = await supabase
          .from("users")
          .update(formData)
          .eq("id", editingId)
          .select(); // return updated row(s)

        console.log("Update response:", { data, error });

        if (error) throw error;

        setFeedback({ type: "success", message: "Admin updated successfully." });
      } else {
        // ensure role forced to admin
        const insertPayload = { ...formData, role: "admin" };

        const { data, error } = await supabase
          .from("users")
          .insert([insertPayload])
          .select(); // return inserted row(s)

        console.log("Insert response:", { data, error });

        if (error) throw error;

        setFeedback({ type: "success", message: "Admin added successfully." });
      }

      // clear form + refresh list
      setEditingId(null);
      setFormData({ rank: "", fullname: "", serial_number: "", unit: "", role: "admin" });
      fetchAdmins();
    } catch (err) {
      console.error("Supabase insert/update error:", err);
      // Helpful to the user: show exact message
      setFeedback({ type: "error", message: err?.message || JSON.stringify(err) });

      // Common RLS/permissions failure hint:
      if ((err?.message || "").toLowerCase().includes("not authorized") ||
          (err?.message || "").toLowerCase().includes("permission")) {
        setFeedback(prev => ({
          type: "error",
          message:
            (prev?.message || "Permission error") +
            ". If you have Row-Level Security enabled you must allow inserts for this role or authenticate."
        }));
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (admin) => {
    setEditingId(admin.id);
    setFormData({
      rank: admin.rank || "",
      fullname: admin.fullname || "",
      serial_number: admin.serial_number || "",
      unit: admin.unit || "",
      role: admin.role || "admin",
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); // scroll to form
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this admin?")) return;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      setFeedback({ type: "error", message: `Delete error: ${error.message}` });
    } else {
      setFeedback({ type: "success", message: "Admin deleted." });
      fetchAdmins();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Admins</h1>

      {feedback && (
        <div
          className={`mb-4 p-3 rounded ${
            feedback.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Search */}
      <div className="mb-4 flex items-center gap-2">
        <Search />
        <input
          type="text"
          placeholder="Search fullname, rank, unit, or serial..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2">Full Name</th>
              <th className="px-4 py-2">Serial Number</th>
              <th className="px-4 py-2">Unit</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-4">Loading…</td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4">No admins found</td>
              </tr>
            ) : (
              admins.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{a.rank}</td>
                  <td className="px-4 py-2">{a.fullname}</td>
                  <td className="px-4 py-2">{a.serial_number}</td>
                  <td className="px-4 py-2">{a.unit}</td>
                  <td className="px-4 py-2">{a.role}</td>
                  <td className="px-4 py-2 text-center flex gap-2 justify-center">
                    <button onClick={() => handleEdit(a)} className="p-2 text-blue-500 hover:bg-blue-100 rounded">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="p-2 text-red-500 hover:bg-red-100 rounded">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">{editingId ? "Edit Admin" : "Add New Admin"}</h2>
        <form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
          <input type="text" placeholder="Rank" value={formData.rank}
            onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
            className="border p-2 rounded" required />

          <input type="text" placeholder="Full Name" value={formData.fullname}
            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
            className="border p-2 rounded" required />

          <input type="text" placeholder="Serial Number" value={formData.serial_number}
            onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
            className="border p-2 rounded" required />

          <input type="text" placeholder="Unit" value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="border p-2 rounded" required />

        <input
        type="text"
        placeholder="Office Designation"
        value={formData.office_designation}
        onChange={(e) =>
            setFormData({ ...formData, office_designation: e.target.value })
        }
        className="border p-2 rounded"
        required
        />

        <input
        type="text"
        placeholder="Skills"
        value={formData.skills}
        onChange={(e) =>
            setFormData({ ...formData, skills: e.target.value })
        }
        className="border p-2 rounded"
        required
        />

        <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
        }
        className="border p-2 rounded"
        required
        />

          <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="border p-2 rounded">
            <option value="admin">Admin</option>
            <option value="sub_admin">Sub Admin</option>
          </select>

          <button type="submit" disabled={submitLoading} className="col-span-full flex items-center gap-2 justify-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-60">
            <Plus size={16} /> {submitLoading ? (editingId ? "Updating..." : "Saving...") : (editingId ? "Update Admin" : "Add Admin")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageAdmin;

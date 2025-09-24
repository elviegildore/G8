import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import supabase from "../supabaseClient";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    rank: "",
    fullname: "",
    serial_number: "",
    unit: "",
    office_designation: "",
    skills: "",
    password: "",
    role: "user", // default role
  });
  const [editingId, setEditingId] = useState(null);

  // 🔹 Fetch users
  const fetchUsers = async () => {
    setLoading(true);

    let query = supabase
      .from("users")
      .select("*")
      .in("role", ["user", "users"]) // include sub_user if needed
      .order("id");

    if (search.trim() !== "") {
      query = query.or(
        `fullname.ilike.%${search}%,rank.ilike.%${search}%,unit.ilike.%${search}%,serial_number.ilike.%${search}%,office_designation.ilike.%${search}%,skills.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) console.error("Error fetching users:", error);
    else setUsers(data);

    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  // 🔹 Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from("users")
        .update(formData)
        .eq("id", editingId);

      if (!error) {
        setEditingId(null);
        resetForm();
        fetchUsers();
      }
    } else {
      const { error } = await supabase.from("users").insert([formData]);
      if (!error) {
        resetForm();
        fetchUsers();
      }
    }
  };

  // 🔹 Reset form
  const resetForm = () => {
    setFormData({
      rank: "",
      fullname: "",
      serial_number: "",
      unit: "",
      office_designation: "",
      skills: "",
      password: "",
      role: "user",
    });
  };

  // 🔹 Edit
  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      rank: user.rank,
      fullname: user.fullname,
      serial_number: user.serial_number,
      unit: user.unit,
      office_designation: user.office_designation,
      skills: user.skills,
      password: user.password, // ⚠️ shows plain password
      role: user.role,
    });
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (!error) fetchUsers();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

      {/* Search */}
      <div className="flex items-center gap-2 mb-4">
        <Search />
        <input
          type="text"
          placeholder="Search by name, rank, unit, serial number, designation, or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full"
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
              <th className="px-4 py-2">Office Designation</th>
              <th className="px-4 py-2">Skills</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center p-4">Loading…</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{user.rank}</td>
                  <td className="px-4 py-2">{user.fullname}</td>
                  <td className="px-4 py-2">{user.serial_number}</td>
                  <td className="px-4 py-2">{user.unit}</td>
                  <td className="px-4 py-2">{user.office_designation}</td>
                  <td className="px-4 py-2">{user.skills}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2 text-center flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 text-blue-500 hover:bg-blue-100 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded"
                    >
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
        <h2 className="text-lg font-semibold mb-2">
          {editingId ? "Edit User" : "Add New User"}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
          <input
            type="text"
            placeholder="Rank"
            value={formData.rank}
            onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Serial Number"
            value={formData.serial_number}
            onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="border p-2 rounded"
            required
          />
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
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="user">User</option>
          </select>

          <button
            type="submit"
            className="col-span-full flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            <Plus size={16} />
            {editingId ? "Update User" : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageUser;

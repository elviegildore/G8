// src/Components/ManageSurveyModal.jsx
import { X } from "lucide-react";
import supabase from "../supabaseClient";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ManageSurveyModal({ form, setForm, onClose }) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!form.title.trim()) {
        alert("Survey title is required.");
        return;
      }

      if (form.id) {
        // ✅ Update existing survey
        const { data: updated, error } = await supabase
          .from("surveys")
          .update({
            title: form.title,
            description: form.description,
            updated_at: new Date(),
          })
          .eq("id", form.id)
          .select()
          .single();

        if (error) throw error;

        // ✅ Return updated survey to parent
        onClose("saved", updated);
      } else {
        // ✅ Add new survey and get inserted row
        const { data: newSurvey, error } = await supabase
          .from("surveys")
          .insert([
            {
              title: form.title,
              description: form.description,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // ✅ Send the new survey back to ManageSurvey
        onClose("saved", newSurvey);
      }
    } catch (error) {
      console.error(error);
      alert("Error saving survey.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {/* Background overlay */}
      <motion.div
        className="fixed inset-0 bg-black/20 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onClose("cancel")}
      />

      {/* Slide-in panel */}
      <motion.div
        key="sidePanel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed top-0 right-0 w-full sm:w-[480px] h-full bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-green-800">
              {form.id ? "Edit Survey" : "Add Survey"}
            </h2>
            <button
              onClick={() => onClose("cancel")}
              className="text-gray-600 hover:text-black"
            >
              <X size={22} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4 font-[Poppins]">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                className="w-full border p-2 rounded focus:outline-green-700"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                className="w-full border p-2 rounded focus:outline-green-700"
                rows="3"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => onClose("cancel")}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

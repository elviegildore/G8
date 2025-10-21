import supabase from "../supabaseClient"; // ✅ correct import

// Function to save a survey response
export async function saveSurveyResponse(currentUser, selectedSurvey) {
  try {
    // 1️⃣ Insert response
    const { data, error } = await supabase
      .from("survey_responses")
      .insert([
        {
          user_id: currentUser.id,
          survey_id: selectedSurvey.id,
          submitted_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error("Error saving response:", error);
      return { success: false, error };
    }

    console.log("Survey response saved:", data);

    // 2️⃣ Count how many already answered this survey (optional)
    const { count: sampleCount, error: countError } = await supabase
      .from("survey_responses")
      .select("*", { count: "exact", head: true })
      .eq("survey_id", selectedSurvey.id);

    if (countError) {
      console.error("Error counting responses:", countError);
      return { success: true, data, countError };
    }

    console.log(`Total responses for survey ${selectedSurvey.id}:`, sampleCount);

    // ✅ Return both insert data and count
    return { success: true, data, sampleCount };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err };
  }
}

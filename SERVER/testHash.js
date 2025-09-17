import bcrypt from "bcryptjs";
import supabase from "./supabaseClient.js"; // your existing supabase client

const testUser = async () => {
  try {
    const password = "TestPass123!"; // test password
    console.log("Plain password:", password);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);

    // Insert into Supabase
    const { data, error } = await supabase
      .from("users")
      .insert([{
        rank: "CPT",
        fullname: "Test User",
        serial_number: "99999",
        unit: "HHC",
        office_designation: "Office",
        skills: "Coding",
        password: hashedPassword
      }])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
    } else {
      console.log("Inserted user:", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
};

testUser();

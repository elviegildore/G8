import { useEffect, useState } from 'react'
import supabase from "../supabaseClient"

const UserProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log("No user is logged in")
        setLoading(false)
        return
      }

        const { data, error } = await supabase
        .from("users")
        .select("rank, fullname, unit, serial_number, office_designation, skills")
        .eq("id", user.fullname)
        .single();

      if (error) {
        console.error("Error fetching profile:", error)
      } else {
        setProfile(data)
      }

      console.log("Auth user ID:", user.id)
      setLoading(false)
    }

    getProfile()
  }, [])

  return (

    <div>
      <h2>HELLO {profile?.fullname || "Guest"}, Welcome to the</h2>
      <table>
        <thead>
          {loading ? (
            <tr><td colSpan="6">Loading...</td></tr>
          ) : (
            <tr>
              <th>Rank</th>
              <th>Fullname</th>
              <th>Unit</th>
              <th>Serial Number</th>
              <th>Office Of Designation</th>
              <th>Skills</th>
            </tr>
          )}
        </thead>
        <tbody>
          <tr>
            <td>{profile?.rank}</td>
            <td>{profile?.fullname}</td>
            <td>{profile?.unit}</td>
            <td>{profile?.serial_number}</td>
            <td>{profile?.office_designation}</td>
            <td>{profile?.skills}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default UserProfile

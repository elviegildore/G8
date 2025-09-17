function UserHeader({ user }) {
  return (
    <header className="bg-white shadow rounded-lg p-4 mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">{user.fullname}</h2>
        <p className="text-sm text-gray-500">
          {user.rank} | {user.serial_number} | {user.unit} |{" "}
          {user.office_designation}
        </p>
      </div>
    </header>
  );
}

export default UserHeader

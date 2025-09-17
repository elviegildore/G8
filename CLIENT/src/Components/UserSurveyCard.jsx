
 function UserSurveryCard({ survey }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col">
      <h3 className="text-lg font-bold mb-2">{survey.title}</h3>
      <ProgressBar progress={survey.progress} />
      <p className="text-sm text-gray-600">{survey.progress}% completed</p>
    </div>
  );
}

export default UserSurveryCard  
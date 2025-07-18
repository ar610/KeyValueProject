import StudentOrderForm from "./components/StudentOrderForm";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">XMeal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Student View</h2>
          <StudentOrderForm />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Admin View</h2>
          <AdminDashboard />
        </div>
      </div>
    </div>
  );
}

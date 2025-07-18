// src/components/StudentOrderForm.jsx
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function StudentOrderForm() {
  const [name, setName] = useState("");
  const [meal, setMeal] = useState(false);
  const [chai, setChai] = useState(false);
  const [samosa, setSamosa] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const order = {
      name,
      items: {
        meal,
        chai,
        samosa
      },
      timestamp: Timestamp.now(),
      paid: false
    };

    try {
      await addDoc(collection(db, "orders"), order);
      alert("Order placed successfully!");
      setName("");
      setMeal(false);
      setChai(false);
      setSamosa(false);
    } catch (err) {
      console.error("Error adding order:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
      <input
        type="text"
        placeholder="Your Name"
        className="border p-2 mb-2 w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div className="mb-2">
        <label>
          <input type="checkbox" checked={meal} onChange={() => setMeal(!meal)} />
          Meals ₹40
        </label>
        <br />
        <label>
          <input type="checkbox" checked={chai} onChange={() => setChai(!chai)} />
          Chai ₹10
        </label>
        <br />
        <label>
          <input type="checkbox" checked={samosa} onChange={() => setSamosa(!samosa)} />
          Samosa ₹8
        </label>
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Place Order
      </button>
    </form>
  );
}

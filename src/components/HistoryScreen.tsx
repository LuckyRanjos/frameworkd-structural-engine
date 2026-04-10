"use client";

import React, { useEffect, useState } from "react";
import { useCurrentUser } from "./UserContext";
import { getUserDecisions } from "@/lib/firebase-helpers";

const HistoryScreen: React.FC = () => {
  const { userId } = useCurrentUser();
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getUserDecisions(userId, 50).then((data) => {
      setDecisions(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <p className="text-center py-12 text-gray-500">Loading...</p>;

  return (
    <div>
      <h2 className="text-lg font-medium mb-6">DECISION LOG</h2>
      {/* same rendering code as before */}
      <div className="space-y-4">
        {decisions.map((d) => (
          <div key={d.id} className="card p-6 flex justify-between items-center">
            {/* ... same as previous version */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryScreen;
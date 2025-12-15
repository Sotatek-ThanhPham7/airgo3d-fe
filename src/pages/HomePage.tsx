import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";

const HomePage: React.FC = () => {
  return (
    <div className="flex w-full flex-col gap-4">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome to AirGo</h1>
        <p className="text-sm text-slate-600">
          Browse and manage your panoramas, discover tagged scenes, and explore
          your 3D experiences.
        </p>
      </section>

      <section>
        <Link to="/panoramas">
          <Button type="primary" size="middle">
            View panoramas
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default HomePage;



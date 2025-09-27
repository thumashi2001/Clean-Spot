// client/src/pages/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 opacity-90" />

      {/* decorative blurred blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/20 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-black/10 rounded-full blur-3xl -z-10" />

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left: hero copy */}
          <div className="text-white">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
              Find restrooms near you
            </h1>
            <p className="mt-4 text-lg md:text-xl/relaxed text-white/90 max-w-prose">
              Instantly discover accessible restrooms around you. Report issues with photos, and track cleaning progress in real time.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/map" className="btn btn-primary btn-lg shadow-lg">
                Open the map
              </Link>
              <Link
                to="/signup"
                className="btn btn-outline btn-lg text-white border-white/70 hover:border-white"
              >
                Create account
              </Link>
            </div>

            {/* quick badges */}
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="badge badge-success">Wheelchair filters</span>
              <span className="badge badge-info">Water availability</span>
              <span className="badge badge-warning">Report &amp; track cleaning</span>
            </div>
          </div>

          {/* Right: logo highlight */}
          <div className="flex justify-center md:justify-end">
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-white/20 blur-xl" />
              <img
                src="./assets/logo.png"
                alt="Restroom Finder"
                className="relative h-44 w-44 md:h-56 md:w-56 rounded-2xl ring-2 ring-white/60 shadow-2xl bg-white/10 p-4 backdrop-blur"
              />
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-white shadow-xl">
            <div className="card-body">
              <div className="text-3xl">🗺️</div>
              <h3 className="card-title text-slate-900">Live map</h3>
              <p className="text-slate-700">
                See nearby restrooms with filters for accessibility, gender, and water.
              </p>
            </div>
          </div>
          <div className="card bg-white shadow-xl">
            <div className="card-body">
              <div className="text-3xl">📸</div>
              <h3 className="card-title text-slate-900">Report with photos</h3>
              <p className="text-slate-700">
                Help keep places clean by reporting issues with quick photo uploads.
              </p>
            </div>
          </div>
          <div className="card bg-white shadow-xl">
            <div className="card-body">
              <div className="text-3xl">🧹</div>
              <h3 className="card-title text-slate-900">Tracked cleaning</h3>
              <p className="text-slate-700">
                Admins assign staff; status moves from confirmed → in cleaning → resolved.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
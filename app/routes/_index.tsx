export default function Index() {
  return (
    <div className="flex flex-col text-center items-center justify-center px-4 py-16 gap-4">
      <h1 className="text-3xl sm:text-6xl font-bold">
        <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent box-decoration-clone">
          Pollo
        </span>
      </h1>

      <h2 className="my-4 text-xl sm:text-3xl font-bold">
        A <span className="text-primary">dead-simple </span>{" "}
        <span className="text-secondary">real-time  </span>{" "}
        <span className="text-accent">voting tool</span>.
      </h2>

      <div className="card glass card-compact bg-secondary text-black font-bold text-left">
        <div className="card-body">
          <h2 className="card-title">Features:</h2>
          <ul>
            <li>🚀 Real-time voting!</li>
            <li>🚀 Customizable room name and vote scale!</li>
            <li>🚀 CSV Reports for every room!</li>
            <li>🚀 100% free and open-source... forever!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import History from "../components/history";

function Home() {
  return (
    <div>
      <Link to="/contract">Contract</Link>
      <Link to="/home">Home</Link>
      <div>
        <History />
      </div>
    </div>
  );
}

export default Home;

import {Link} from "react-router-dom";
export function Unauthorized() {
  return (
    <>
      <div className="unauthorized-container">
        <h1>Unauthorized Access</h1>
        <p>You do not have permission to access this page.</p>
      </div>
      <Link to="/">Go to home</Link>

    </>
  );
}

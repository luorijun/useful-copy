import Home from "./pages/Home";
import Pickup from "./pages/Pickup";

function pickupId(pathname: string) {
  const match = pathname.match(/^\/pickup\/([^/]+)\/?$/u);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function App() {
  const pathname = decodeURI(window.location.pathname);
  const id = pickupId(pathname);

  if (id) return <Pickup id={id} />;
  if (pathname === "/" || pathname === "") return <Home />;

  return (
    <main className="pickup-page">
      <div className="pickup-shell">
        <a href="/" className="back">返回首页</a>
        <div className="pickup-card">
          <div className="state">页面不存在</div>
        </div>
      </div>
    </main>
  );
}

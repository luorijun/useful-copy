import Home from "./pages/Home";
import Pickup from "./pages/Pickup";

function pickupId(pathname: string) {
  const match = pathname.match(/^\/([^/]+)\/?$/u);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export default function App() {
  const pathname = window.location.pathname;
  const id = pickupId(pathname);

  if (id) return <Pickup id={id} />;
  if (pathname === "/" || pathname === "") return <Home />;

  return (
    <main class="pickup-page">
      <div class="pickup-shell">
        <a href="/" class="back">
          返回首页
        </a>
        <div class="pickup-card">
          <div class="state">页面不存在</div>
        </div>
      </div>
    </main>
  );
}

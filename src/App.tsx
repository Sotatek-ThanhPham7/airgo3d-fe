import * as React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Layout, Menu, Result } from "antd";
import PanoramaListPage from "./pages/PanoramaListPage";
import HomePage from "./pages/HomePage";
import CreatePanoramaPage from "./pages/CreatePanoramaPage";
import PanoramaViewerPage from "./pages/PanoramaViewerPage";

const { Header, Content, Footer } = Layout;

const AppShell: React.FC = () => {
  const location = useLocation();

  const isViewerRoute = location.pathname === "/panoramas/viewer";

  const selectedKey = location.pathname.startsWith("/panoramas")
    ? "/panoramas"
    : "/";

  const menuItems = [
    {
      key: "/",
      label: <Link to="/">Home</Link>,
    },
    {
      key: "/panoramas",
      label: <Link to="/panoramas">Panoramas</Link>,
    },
  ];

  if (isViewerRoute) {
    // Fullscreen viewer without header/footer/layout padding
    return (
      <Routes>
        <Route path="/panoramas/viewer" element={<PanoramaViewerPage />} />
        <Route
          path="*"
          element={
            <Result
              status="404"
              title="404"
              subTitle="Sorry, the page you visited does not exist."
              extra={<Link to="/">Back Home</Link>}
            />
          }
        />
      </Routes>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontWeight: 600,
            fontSize: 18,
            marginRight: 24,
          }}
        >
          AirGo
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={menuItems}
        />
      </Header>
      <Content style={{ padding: "24px 32px" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/panoramas" element={<PanoramaListPage />} />
          <Route path="/panoramas/new" element={<CreatePanoramaPage />} />
          <Route
            path="*"
            element={
              <Result
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
                extra={<Link to="/">Back Home</Link>}
              />
            }
          />
        </Routes>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        AirGo ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
};

export default App;

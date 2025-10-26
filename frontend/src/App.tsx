import { Routes, Route } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import NavBar from './components/navbar/NavBar';
import Home from './pages/Home';
import Search from './pages/Search';
import Profile from './pages/Profile';
import type { AppProps } from './types/theme';
import { PAGES_ROUTE } from './constants/Pages';
import { Toolbar } from '@mui/material';
import { Outlet } from "react-router-dom";
import BusinessPostsPage from "./components/publish/Publish"
import {RequireBusiness} from "./components/publish/RequireBusiness"

function DefaultLayout() {
  return (
    <Container disableGutters sx={{ py: 4, px: { xs: 2, md: 2 } }}>
      <Outlet />
    </Container>
  );
}

export default function App({ mode, setMode }: AppProps) {  

  return (
    <Box>
      <NavBar
        mode={mode}
        setMode={setMode}
      />
      
      <Toolbar disableGutters sx={{ px: { xs: 2, md: 2 } }} />

      <Routes>
        <Route path={PAGES_ROUTE.profile} element={<Profile />} />

        {/* Rutas hijas con el layout */}
        <Route element={<DefaultLayout />}>
          <Route path={PAGES_ROUTE.root} element={<Home />} />
          <Route path={PAGES_ROUTE.search} element={<Search />} />
          <Route
            path={PAGES_ROUTE.businessPosts}
            element={
              <RequireBusiness>
                <BusinessPostsPage/>
              </RequireBusiness>
            }
          />
        </Route>
      </Routes>
    </Box>
  );
}

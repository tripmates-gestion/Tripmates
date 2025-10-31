import { Routes, Route } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import NavBar from './components/navbar/NavBar';
import Home from './pages/Home';
import Search from './pages/Search';
import UserProfile from './pages/UserProfile';
import BusinessProfile from './pages/BusinessProfile';
import type { AppProps } from './types/theme';
import { PAGES_ROUTE } from './constants/Pages';
import { Toolbar } from '@mui/material';
import { Outlet } from "react-router-dom";
import RoleBasedRoute from './routes/RoleBasedRoute';
import { ACCOUNT_TYPES } from './constants/Rol';
import { SnackbarProvider } from 'notistack';

function DefaultLayout() {
  return (
    <Container disableGutters sx={{ py: 4, px: { xs: 2, md: 2 } }}>
      <Outlet />
    </Container>
  );
}

export default function App({ mode, setMode }: AppProps) {  

  return (
    <SnackbarProvider
    maxSnack={3}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    autoHideDuration={2500}
    preventDuplicate
  >
    <Box>
      <NavBar
        mode={mode}
        setMode={setMode}
      />
      
      <Toolbar disableGutters sx={{ px: { xs: 2, md: 2 } }} />

      <Routes>
        {/* Public routes */}
        <Route element={<DefaultLayout />}>
          <Route path={PAGES_ROUTE.root} element={<Home />} />
          <Route path={PAGES_ROUTE.search} element={<Search />} />
          {/* <Route path={PAGES_ROUTE.restaurantPublic} element={<RestaurantPublicPage />} />
          <Route path={PAGES_ROUTE.hotelPublic} element={<HotelPublicPage />} /> */}
        </Route>

        {/* Profile route with role-based rendering */}
        <Route element={<RoleBasedRoute allowedRoles={[ACCOUNT_TYPES.user, ACCOUNT_TYPES.business]} />}>
          <Route 
            path={PAGES_ROUTE.profile} 
            element={
              <RoleBasedRoute 
                allowedRoles={[ACCOUNT_TYPES.user, ACCOUNT_TYPES.business]}
                render={({ user }) => {
                  if (user?.role === ACCOUNT_TYPES.business) {
                    return <BusinessProfile />;
                  }
                  return <UserProfile />;
                }}
              />
            } 
          />
        </Route>
      </Routes>
    </Box>
    </SnackbarProvider>
  );
}

import { Button, Stack, Avatar } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PAGES_ROUTE } from "../../constants/Pages";
import AuthDialog from "../../components/auth/AuthDialog";
import AdviseToComplementProfile from "../../components/auth/AdviseToComplementBusinessProfile";
import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";

export function AuthControls() {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showAdviseToComplementProfile, setShowAdviseToComplementProfile] =
    useState(false);
  const { user, logout } = useAuth();

  // Evitar que el recordatorio se muestre más de una vez por sesión
  useEffect(() => {
    if (user?.role === "BUSINESS" && localStorage.getItem("profileAdvised") !== "true") {
      if (showAdviseToComplementProfile) {
        localStorage.setItem("profileAdvised", "true");
      }
    }
  }, [showAdviseToComplementProfile, user]);

  return (
    <>
      {user !== null ? (
        <Stack direction="row" spacing={1}>
          <Button
            component={RouterLink}
            to={PAGES_ROUTE.profile}
            sx={{
              minWidth: "auto",
              p: 0,
              lineHeight: 0,
            }}
          >
            <Avatar
              src={user.avatarURL}
              alt={user.name}
              sx={{
                width: 42,
                height: 42,
                borderColor: "primary.main",
              }}
            />
          </Button>

          <Button color="secondary" variant="outlined" onClick={logout}>
            Cerrar sesión
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => setShowAuthForm(true)}>
            Ingresar
          </Button>

          <AuthDialog
            open={showAuthForm}
            onClose={() => setShowAuthForm(false)}
            onRegisterSuccess={() => setShowAdviseToComplementProfile(true)}
          />
        </Stack>
      )}

      {showAdviseToComplementProfile &&
        user != null &&
        user.role === "BUSINESS" && (
          <AdviseToComplementProfile
            open={showAdviseToComplementProfile}
            onClose={() => setShowAdviseToComplementProfile(false)}
          />
        )}
    </>
  );
}

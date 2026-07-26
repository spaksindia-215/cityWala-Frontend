import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axios'
import { setAccessToken, clearAccessToken } from '../utils/authToken'

const AuthContext = createContext(null)

// const safeStorage = {
//   getItem(key) {
//     if (typeof window === 'undefined') return null
//     try {
//       return window.localStorage?.getItem(key) ?? null
//     } catch {
//       return null
//     }
//   },
//   setItem(key, value) {
//     if (typeof window === 'undefined') return
//     try {
//       window.localStorage?.setItem(key, value)
//     } catch {
//       // ignore storage errors (blocked/quota)
//     }
//   },
//   removeItem(key) {
//     if (typeof window === 'undefined') return
//     try {
//       window.localStorage?.removeItem(key)
//     } catch {
//       // ignore storage errors (blocked)
//     }
//   },
// }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [partner, setPartner] = useState(null)
  const [admin, setAdmin] = useState(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // User/partner session and admin session are checked independently so a
    // 401 on one (e.g. an admin-only cookie) doesn't clear the other.
    const checkAuth = async () => {
      try {
        const { data } = await API.get('/auth/me')

        if (data.user) {
          setUser(data.user)
          setPartner(null)
        }
        if (data.partner) {
          setPartner(data.partner)
          setUser(null)
        }
      } catch {
        setUser(null)
        setPartner(null)
      }
    }

    const checkAdmin = async () => {
      try {
        const { data } = await API.get('/auth/admin/me')
        setAdmin(data.admin)
      } catch {
        setAdmin(null)
      }
    }

    Promise.allSettled([checkAuth(), checkAdmin()]).finally(() =>
      setLoading(false)
    )
  }, [])
  // const [admin, setAdmin] = useState(() => JSON.parse(safeStorage.getItem('admin') || 'null'))

  // ── User ─────────────────────────────────────────────────────────────────────
  // const login = async (loginId, password) => {
  //   const { data } = await API.post('/auth/login', { login: loginId, password })
  //   if (!data?.token) throw new Error('Token missing from login response')
  //   safeStorage.setItem('token', data.token)
  //   safeStorage.setItem('user', JSON.stringify(data.user))
  //   setUser(data.user)
  //   return data
  // }


  //   const login = async (loginId, password) => {
  //   const { data } = await API.post('/auth/login', {
  //     login: loginId,
  //     password
  //   });

  //   if (!data?.token) {
  //     throw new Error("Token missing from login response");
  //   }

  //   // common token
  //   safeStorage.setItem("token", data.token);

  //   // backend agar user bheje
  //   if (data.user) {
  //     safeStorage.setItem(
  //       "user",
  //       JSON.stringify(data.user)
  //     );
  //     setUser(data.user);
  //   }

  //   // backend agar partner bheje
  //   if (data.partner) {
  //     safeStorage.setItem(
  //       "partner",
  //       JSON.stringify(data.partner)
  //     );
  //     setPartner(data.partner);
  //   }

  //   return data;
  // };

  // const login = async (loginId, password) => {
  //   const { data } = await API.post('/auth/login', { login: loginId, password });

  //   if (!data?.token) throw new Error("Token missing from login response");

  //   if (data.role === "partner" && data.partner.status === "suspended") {
  //     localStorage.removeItem("partnerToken");
  //     localStorage.removeItem("partner");

  //     throw new Error("Your account has been suspended. Contact admin.");
  //   }

  //   if (data.role === 'partner') {
  //     // ✅ Save as partnerToken so the interceptor picks it up correctly
  //     safeStorage.setItem('partnerToken', data.token);
  //     // Only save essential data, not sensitive info
  //     const partnerDataToStore = {
  //       id: data.partner._id || data.partner.id,
  //       name: data.partner.name,
  //       email: data.partner.email,
  //       mobile: data.partner.mobile,
  //       status: data.partner.status,
  //       role: 'partner'
  //     }
  //     safeStorage.setItem('partner', JSON.stringify(partnerDataToStore));
  //     setPartner(data.partner);
  //   } else {
  //     safeStorage.setItem('token', data.token);
  //     safeStorage.setItem('user', JSON.stringify(data.user));
  //     setUser(data.user);
  //   }

  //   return data;
  // };


  //   const login = async (loginId, password) => {
  //   const { data } = await API.post("/auth/login", {
  //     login: loginId,
  //     password,
  //   });

  //   if (!data?.token) throw new Error("Token missing");

  //   const isPartner = data.role === "partner";
  //   const isSuspended = data.partner?.status === "suspended";

  //   if (isPartner && isSuspended) {
  //     safeStorage.removeItem("partnerToken");
  //     safeStorage.removeItem("partner");

  //     setPartner(null);

  //     throw new Error("Account suspended");
  //   }

  //   if (isPartner) {
  //     safeStorage.setItem("partnerToken", data.token);

  //     const partnerData = {
  //       id: data.partner._id || data.partner.id,
  //       name: data.partner.name,
  //       email: data.partner.email,
  //       mobile: data.partner.mobile,
  //       status: data.partner.status,
  //       role: "partner",
  //     };

  //     safeStorage.setItem("partner", JSON.stringify(partnerData));
  //     setPartner(partnerData);
  //   } else {
  //     safeStorage.setItem("token", data.token);
  //     safeStorage.setItem("user", JSON.stringify(data.user));
  //     setUser(data.user);
  //   }

  //   return data;
  // };

  // const login = async (loginId, password) => {
  //   const { data } = await API.post("/auth/login", {
  //     login: loginId,
  //     password,
  //   });


  //   console.log("FULL LOGIN DATA:", data);
  //   console.log("ROLE:", data.role);
  //   console.log("PARTNER:", data.partner);
  //   console.log("STATUS:", data.partner?.status);

  //   if (!data?.token) throw new Error("Token missing");

  //   const isPartner = data.role === "partner";
  //   const isSuspended = data.partner?.status === "suspended";

  //   if (isPartner && isSuspended) {
  //     safeStorage.removeItem("partnerToken");
  //     safeStorage.removeItem("partner");

  //     setPartner(null);

  //     throw new Error("Account suspended");
  //   }

  //   if (isPartner) {
  //     safeStorage.setItem("partnerToken", data.token);

  //     const partnerData = {
  //       id: data.partner._id || data.partner.id,
  //       name: data.partner.name,
  //       email: data.partner.email,
  //       mobile: data.partner.mobile,
  //       status: data.partner.status,
  //       role: "partner",
  //       test: "HELLO"

  //     };

  //     safeStorage.setItem("partner", JSON.stringify(partnerData));
  //     setPartner(partnerData);
  //   } else {
  //     safeStorage.setItem("token", data.token);
  //     safeStorage.setItem("user", JSON.stringify(data.user));
  //     setUser(data.user);
  //   }

  //   return data;
  // };

  // new
  const login = async (loginId, password) => {
  const { data } = await API.post("/auth/login", {
    login: loginId,
    password,
  });

  if (!data) throw new Error("Login failed");

  if (data.token) {
    setAccessToken(data.token);
  }

  const isPartner = data.role === "partner";

  const isSuspended = data.partner?.status === "suspended";
  if (isPartner && isSuspended) {
    setPartner(null);
    clearAccessToken();
    throw new Error("Account suspended");
  }

  if (isPartner) {
    const partnerData = {
      id: data.partner._id || data.partner.id,
      name: data.partner.name,
      email: data.partner.email,
      mobile: data.partner.mobile,
      status: data.partner.status,
      isVerified: data.partner.isVerified,
      role: "partner",
    };

    setUser(null);
    setPartner(partnerData);
  } else {
    const userData = {
      id: data.user?.id,
      name: data.user?.name,
      email: data.user?.email,
      mobile: data.user?.mobile,
      isVerified: data.user?.isVerified,
    };

    setPartner(null);
    setUser(userData);
  }

  return data;
};


  // forgot password
  //  const forgotPassword = async (email) => {  
  //   const { data } = await API.post('/auth/forgot-password', { email });
  //   return data;
  // };

  //  const forgotPassword = async (emailOrPhone) => {  
  //   const { data } = await API.post('/auth/forgot-password', { emailOrPhone });
  //   return data;
  // };
  const forgotPassword = async (emailOrPhone) => {
    try {
      const { data } = await API.post('/auth/forgot-password', { emailOrPhone });
      return data;
    } catch (error) {
      console.log(error.response?.data || error.message);
      throw error;
    }
  };



  // Registration no longer auto-logs-in: the account is created unverified
  // and the caller should route to the verification-pending page using
  // data.email from the response.
  const register = async (form) => {
    const { data } = await API.post('/auth/register', form)
    return data
  }

  const resendVerification = async (email) => {
    const { data } = await API.post('/auth/resend-verification', { email })
    return data
  }

  // ── Partner ──────────────────────────────────────────────────────────────────
  const partnerLogin = async (email, password) => {
    const { data } = await API.post('/auth/login', { login: email, password })
    if (!data?.token) throw new Error('Token missing from partner login response')

    if (!data.partner) throw new Error('Partner account not found')
    if (data.partner.status !== 'approved') throw new Error(`Account ${data.partner.status}`)

    setAccessToken(data.token)
    const partnerData = {
      id: data.partner._id || data.partner.id,
      name: data.partner.name,
      email: data.partner.email,
      mobile: data.partner.mobile,
      status: data.partner.status,
      isVerified: data.partner.isVerified,
      role: 'partner'
    }
    setPartner(partnerData)
    setUser(null)
    return data
  }

  // Registration no longer auto-logs-in (see `register` above).
  const partnerRegister = async (form) => {
    const isFormData = typeof FormData !== 'undefined' && form instanceof FormData
    const { data } = await API.post('/auth/partner/register', form, isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined
    )
    return data
  }


  // ── Admin ────────────────────────────────────────────────────────────────────
  // Admin auth is cookie-based (no token in storage), mirroring the old
  // standalone admin app.
  const adminLogin = async (email, password) => {
    const { data } = await API.post('/auth/admin/login', { email, password })
    setAdmin(data.admin)
    return data
  }

  // ── Logout (all) ─────────────────────────────────────────────────────────────
  // const logout = () => {
  //   ;['token', 'user', 'partnerToken', 'partner', 'adminToken', 'admin'].forEach((k) => safeStorage.removeItem(k))
  //   setUser(null); setPartner(null); setAdmin(null)
  // }

  // const logout = () => {
  //   ;['token', 'user', 'partnerToken', 'partner'].forEach((k) => safeStorage.removeItem(k))
  //   setUser(null); setPartner(null);
  // }

  const logout = async () => {
  try {
    await API.post("/auth/logout");
  } catch {}

  clearAccessToken();
  setUser(null);
  setPartner(null);
  setAdmin(null);
};

  // ── Update Partner Data ──────────────────────────────────────────────────────
  const updatePartnerData = (updatedPartner) => {
    // Only save essential data, not sensitive info
    const partnerDataToStore = {
      id: updatedPartner._id || updatedPartner.id,
      name: updatedPartner.name,
      email: updatedPartner.email,
      mobile: updatedPartner.mobile,
      role: 'partner'
    }
    setPartner(updatedPartner)
  }

  // Keep API interceptor in sync when tokens change
  // useEffect(() => {
  //   const token = safeStorage.getItem('partnerToken') || safeStorage.getItem('token')
  //   if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`
  // }, [user, partner])

  return (
    <AuthContext.Provider value={{ user, partner, admin, loading, login, partnerLogin, adminLogin, forgotPassword, register, partnerRegister, resendVerification, logout, updatePartnerData }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export default AuthContext

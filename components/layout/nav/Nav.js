import React, { useState } from "react";
import style from "./Nav.module.scss";
import { logo } from "../../reusable/logo";
import TopBar from "../top-bar/TopBar";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";
import { connect } from "react-redux";
import { logout } from "../../actions/auth";
import { LogIn, LogOut, Menu, UserPlus, X, Eye, User } from "react-feather";

const Nav = ({ auth: { isAuthenticated, user, loading }, logout }) => {
  const router = useRouter();
  const [isAuthRoute, detect] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const handlePageRoute = () => {
    const routeName = router.pathname.toLowerCase();
    switch (true) {
      case routeName.includes("signin"):
        return detect(true);
      case routeName.includes("signup"):
        return detect(true);
      case routeName.includes("analytics"):
        return detect(true);
      default:
        return detect(false);
    }
  };
  useEffect(() => {
    handlePageRoute();
  }, []);

  const authRouting = () => {
    return !isAuthenticated ? (
      <>
        <div className={style.auth_link}>
          <Eye />
          <Link href={`/`}>View Site</Link>
        </div>
        <div className={style.auth_link}>
          <LogIn />
          <Link href={`/SigninPage`}>Login</Link>
        </div>
        <div className={style.auth_link}>
          <UserPlus />
          <Link href={`/signuppage`}>Signup</Link>
        </div>
      </>
    ) : (
      <>
        {!loading && user ? (
          <div className={style.auth_link}>
            <User />
            <a>Welcome {user.name}</a>
          </div>
        ) : null}
        <div className={style.auth_link}>
          <Eye />
          <Link href={`/`}>View Site</Link>
        </div>
        <div className={style.auth_link}>
          <LogOut />
          <a onClick={(e) => logout()}>Logout</a>
        </div>
      </>
    );
  };
  return (
    <nav className={style.nav}>
      <TopBar />
      {isAuthRoute ? (
        <div className={style.nav_inner}>
          <div className={style.nav_left}>{logo}</div>

          <>
            <div className={style.mobile_nav}>
              <Menu onPointerDown={(e) => setMobileNav(!mobileNav)} />
            </div>
            <div
              className={
                mobileNav
                  ? style.mobile_menu
                  : style.mobile_menu + " " + style.mobile_menu_hidden
              }
            >
              <div className={style.mobile_menu__top}>
                <X onPointerDown={(e) => setMobileNav(!mobileNav)} />
              </div>

              {authRouting()}
            </div>
            <div className={style.nav_right}>{authRouting()}</div>
          </>
        </div>
      ) : null}
    </nav>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logout })(Nav);

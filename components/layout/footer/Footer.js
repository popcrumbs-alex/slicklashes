import React from "react";
import PropTypes from "prop-types";
import style from "./Footer.module.scss";
import { logo } from "../../reusable/logo";
import EmailSignup from "./EmailSignup";
import { connect } from "react-redux";
import { Alert } from "../../reusable/alerts/Alert";
import TrustSection from "./TrustSection";

const Footer = ({
  alert: { alerts },
  email: { errors, emailResponse },
  shopifystore: { businessSite },
}) => {
  return (
    <>
      <TrustSection />
      <footer className={style.footer}>
        <div className={style.container}>
          <div className={style.col}>
            <a>{logo}</a>
          </div>
          <div className={style.col}>
            <div className={style.heading}>
              <h2>Customer Service</h2>
            </div>
            <div className={style.list}>
              <a
                href="https://slicklashes.zendesk.com/hc/en-us"
                target="_blank"
                rel="noopner noreferrer"
              >
                Contact Us
              </a>
              <a
                href="https://slick.love/policies/refund-policy"
                target="_blank"
                rel="noopner noreferrer"
              >
                Refund Policy
              </a>
              <a
                href="https://slick.love/pages/terms-of-service"
                target="_blank"
                rel="noopner noreferrer"
              >
                Terms of Service
              </a>
              <a
                href="https://slick.love/pages/privacy-policy"
                target="_blank"
                rel="noopner noreferrer"
              >
                Privacy Policy
              </a>
            </div>
          </div>
          <div className={style.col}>
            <div className={style.heading}>
              <h2>Newsletter</h2>
              <p>Promotions, new products and sales. Directly to your inbox.</p>
            </div>
            {(alerts.length > 0 && errors) ||
            (alerts.length > 0 && emailResponse)
              ? alerts.map((alert, i) => (
                  <Alert msg={alert.msg} status={alert.type} key={i} />
                ))
              : null}
            <EmailSignup />
          </div>
        </div>
        <div className={style.btm_container}>
          <div className={style.inner}>
            <p>
              &copy; {businessSite} {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

Footer.propTypes = {
  alerts: PropTypes.object,
  email: PropTypes.object,
};

const mapStateToProps = (state) => ({
  alert: state.alert,
  email: state.email,
  shopifystore: state.shopifystore,
});

export default connect(mapStateToProps, null)(Footer);

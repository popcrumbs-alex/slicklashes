import React from "react";
import { connect } from "react-redux";
import style from "./TrustSection.module.scss";
import { FaMapMarkerAlt, FaWarehouse } from "react-icons/fa";
const TrustSection = ({ reviews: { productId } }) => {
  return (
    <section className={style.section}>
      <div className={style.content}>
        <div className={style.row}>
          <div className={style.image_container}>
            <img
              src={
                "https://ik.imagekit.io/usam13ogl7u/trust-symbol-1_ek483n_mGvkmEtOq.png"
              }
            />
          </div>
          <div className={style.image_container}>
            <img
              src={
                "https://ik.imagekit.io/usam13ogl7u/trusteee_hiitgf_c2atDQAYMv.png"
              }
            />
          </div>
          <div className={style.image_container}>
            <a
              href="https://www.bbb.org/us/ny/melville/profile/online-retailer/luciana-rose-couture-0121-186589"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={
                  "https://ik.imagekit.io/usam13ogl7u/trust-symbol-2.jpg_kozddl__6Lif42Xq_.png"
                }
              />
            </a>
          </div>
        </div>
        <div className={style.map_container}>
          <div className={style.col}>
            <div className={style.col_heading}>
              <FaMapMarkerAlt size={20} />
              <p>Office Location</p>
            </div>
            <p>
              Our Offices are Located at: 534 Broadhollow Rd Suite 305 Melville
              NY 11747
            </p>
            <div className={style.image_container}>
              <img
                src={
                  "https://ik.imagekit.io/usam13ogl7u/office-location_fny366_jMfidn7jEO.png"
                }
              />
            </div>
          </div>
          <div className={style.col}>
            <div className={style.col_heading}>
              <FaWarehouse size={20} />
              <p>Warehouse Location</p>
            </div>
            <p>
              All items ship from our warehouse at 4051 Freeport Parkway
              Grapevine Texas, 76051
            </p>
            <div className={style.image_container}>
              <img
                src={
                  "https://ik.imagekit.io/usam13ogl7u/texas-warehouse_gpjlnk_UUE98pyfG.png"
                }
              />
            </div>
          </div>
        </div>
        <div className={style.col}>
          <p>Check out our recent reviews from around the web</p>
          <div id="looxReviews" data-loox-aggregate></div>
        </div>
      </div>
    </section>
  );
};

const mapStateToProps = (state) => ({
  reviews: state.reviews,
});
export default connect(mapStateToProps, null)(TrustSection);

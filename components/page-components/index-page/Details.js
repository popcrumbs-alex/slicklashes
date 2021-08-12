import React from "react";
import SectionBreak from "../../reusable/misc/SectionBreak";
import style from "./Details.module.scss";
import {
  FaBan,
  FaCalendarAlt,
  FaCoins,
  FaExclamationCircle,
  FaFlagUsa,
} from "react-icons/fa";
import ImageKit from "../../reusable/images/ImageKit";

//Component is clean
const Details = () => {
  const detailsData = [
    {
      icon: (
        <div className={style.container}>
          <ImageKit
            imgSrc={
              "https://ik.imagekit.io/usam13ogl7u/Slick_DL_VIOLETBUTTERLFY_0009_zugxhm_mfhhi1pxdu.png"
            }
          />
        </div>
      ),
      text: `Make your eyes stand out!`,
    },
    {
      icon: (
        <div className={style.container}>
          <ImageKit
            imgSrc={
              "https://ik.imagekit.io/usam13ogl7u/Slick_DL_VIOLETBUTTERLFY_0008_iov8eo_md6Zgerl_.png"
            }
          />
        </div>
      ),
      text: `change your look easily.`,
    },
    {
      icon: (
        <div className={style.container}>
          <ImageKit
            imgSrc={
              "https://ik.imagekit.io/usam13ogl7u/Slick_DL_COY_0023_qimnbf_8UuV5fKMn.png"
            }
          />
        </div>
      ),
      text: `There’s no limit on how many looks you can rock.`,
    },

    {
      icon: (
        <div className={style.container}>
          <FaBan size={60} />
        </div>
      ),
      text: `No forced subscriptions, monthly billing, or gimmicks.`,
    },
    {
      icon: (
        <div className={style.container}>
          <FaExclamationCircle size={60} />
        </div>
      ),
      text: `Some side affects are lots of compliments on your eyes.`,
    },
    {
      icon: (
        <div className={style.container}>
          <FaCalendarAlt size={60} />
        </div>
      ),
      text: `We ship from Texas, your items will arrive in days`,
    },
  ];

  return (
    <>
      <SectionBreak
        headline={"SlickLashes.com – The Easy Way To Get Longer/Fuller Lashes"}
        style={style.section_break}
      />
      <section className={style.section}>
        <div className={style.content}>
          <div className={style.grid}>
            {detailsData.map((item, i) => {
              return (
                <div className={style.item} key={i}>
                  <div className={style.icon_box}>{item.icon}</div>
                  <div className={style.item_content}>
                    <p>{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default Details;

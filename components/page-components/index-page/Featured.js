import React from "react";
import style from "./Featured.module.scss";

//Component is clean
const Featured = () => {
  const imgs = [
    "https://res.cloudinary.com/fillthevoidio/image/upload/v1615328663/pg/Picture2_ndxxhy.jpg",
    "https://res.cloudinary.com/fillthevoidio/image/upload/v1615328663/pg/Picture1_jk5ls1.png",
    "https://res.cloudinary.com/fillthevoidio/image/upload/v1615328663/pg/Picture3_qt6zks.png",
  ];
  return (
    <section className={style.section}>
      <div className={style.inner}>
        <div className={style.title_row}>
          <span></span>
          <h2>As Featured On</h2>
          <span></span>
        </div>
        <div className={style.images_row}>
          {imgs.map((img, i) => (
            <img src={img} alt="logos" key={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Featured;

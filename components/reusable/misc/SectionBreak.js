import React from "react";
import PropTypes from "prop-types";

const SectionBreak = ({ headline = "", style }) => {
  return <section className={style}>{headline && <h1>{headline}</h1>}</section>;
};

SectionBreak.propTypes = { headline: PropTypes.string, style: PropTypes.any };

export default SectionBreak;

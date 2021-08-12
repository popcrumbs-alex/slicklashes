import React from "react";
import PropTypes from "prop-types";

const Select = ({
  options,
  value,
  isRequired,
  onChange,
  placeHolder,
  inputStyle,
  label,
  name,
  onFocus,
  labelStyle = null,
  activeElement = "",
  activeStyle = null,
  isDisabled = false,
}) => {
  return (
    <div
      className={
        activeElement === name ? activeStyle + " " + inputStyle : inputStyle
      }
      onMouseEnter={(e) => onFocus(e)}
    >
      {activeElement === name && (
        <label htmlFor={name} className={labelStyle}>
          {label}
          {isRequired ? "*" : null}
        </label>
      )}
      <select
        value={value}
        required={isRequired}
        onChange={onChange}
        name={name}
        onFocus={onFocus ? (e) => onFocus(e) : null}
        disabled={isDisabled}
      >
        <option value={null}>{placeHolder}</option>
        {options.map((opt, i) => {
          return (
            <option value={opt.name ? opt.name : opt.value} key={i}>
              {opt.name ? opt.name : opt.value}
            </option>
          );
        })}
      </select>
    </div>
  );
};

Select.propTypes = {
  options: PropTypes.array.isRequired,
  value: PropTypes.string.isRequired,
  isRequired: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  placeHolder: PropTypes.string.isRequired,
};

export default Select;

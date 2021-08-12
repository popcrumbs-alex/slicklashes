import React from "react";
import PropTypes from "prop-types";

const Input = ({
  name,
  value,
  isRequired,
  placeholderText,
  onChange,
  inputStyle,
  label,
  type = "text",
  autoFocus = false,
  onFocus = () => {},
  id = null,
  inputRef = null,
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
      {/* the name acts as the id of the input for active selection */}
      {activeElement === name ? (
        <label htmlFor={name} className={labelStyle}>
          {label}
          {isRequired ? "*" : null}
        </label>
      ) : (
        <label style={{ opacity: 0, maxWidth: 0 }}></label>
      )}
      <input
        name={name}
        value={value}
        required={isRequired}
        placeholder={placeholderText}
        onChange={(e) => onChange(e)}
        type={type}
        autoFocus={autoFocus ? true : false}
        id={id ? id : null}
        onFocus={onFocus ? (e) => onFocus(e) : null}
        ref={inputRef}
        disabled={isDisabled}
      />
    </div>
  );
};

Input.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  isRequired: PropTypes.bool.isRequired,
  placeholderText: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Input;

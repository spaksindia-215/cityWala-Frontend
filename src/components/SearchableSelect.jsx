
import Select from "react-select";

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select",
  valueKey = "value",
  labelKey = "label",
  searchable = true,
  variant = "default",
}) => {

  const formattedOptions = options.map((item) => ({
    value: item[valueKey],
    label: item[labelKey],
  }));

  const onDark = variant === "on-dark";

  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: onDark ? "transparent" : "#fff",
      border: onDark ? "1px solid rgba(255,255,255,.2)" : "1px solid var(--cw-gray-200, #e2e8f0)",
      color: onDark ? "#fff" : "var(--cw-gray-700, #334155)",
      minHeight: onDark ? "28px" : "48px",
      fontSize: "14px",
      borderRadius: onDark ? "6px" : "12px",
      boxShadow: state.isFocused ? (onDark ? "none" : "0 0 0 3px rgba(16,117,190,.35)") : "none",
      borderColor: state.isFocused && !onDark ? "var(--cw-blue-600, #1075be)" : base.borderColor,
    }),
    singleValue: (base) => ({
      ...base,
      color: onDark ? "#fff" : "var(--cw-gray-700, #334155)",
      fontSize: "14px",
    }),
    placeholder: (base) => ({
      ...base,
      color: onDark ? "rgba(255,255,255,.6)" : "var(--cw-gray-500, #64748b)",
      fontSize: "14px",
    }),
    input: (base) => ({
      ...base,
      color: onDark ? "#fff" : "var(--cw-gray-700, #334155)",
      fontSize: "14px",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({
      ...base,
      color: onDark ? "rgba(255,255,255,.6)" : "var(--cw-gray-500, #64748b)",
      padding: onDark ? "0 6px" : base.padding,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--cw-blue-600, #1075be)"
        : state.isFocused
        ? "var(--cw-blue-50, #eef7ff)"
        : "#fff",
      color: state.isSelected ? "#fff" : "var(--cw-gray-700, #334155)",
      cursor: "pointer",
      fontSize: "14px",
      padding: "10px 12px",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#fff",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(15,23,42,.08)",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <Select
      options={formattedOptions}
      placeholder={placeholder}
      isSearchable={searchable}
      maxMenuHeight={200}
      value={
        formattedOptions.find(
          (option) => option.value === value
        ) || null
      }
      onChange={(selected) =>
        onChange(selected?.value || "")
      }
      styles={customStyles}
      menuPortalTarget={document.body}
      menuPosition="fixed"
    />
  );
};

export default SearchableSelect;


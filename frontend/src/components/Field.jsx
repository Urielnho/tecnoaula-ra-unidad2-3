import { Form } from "semantic-ui-react";
export default function Field({ formik, name, label, ...props }) {
  const invalid = formik.touched[name] && formik.errors[name];
  return (
    <Form.Field error={Boolean(invalid)}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        aria-invalid={Boolean(invalid)}
        aria-describedby={invalid ? `${name}-error` : undefined}
        {...props}
      />
      {invalid && (
        <span className="field-error" id={`${name}-error`}>
          {formik.errors[name]}
        </span>
      )}
    </Form.Field>
  );
}

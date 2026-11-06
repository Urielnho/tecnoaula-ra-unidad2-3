import { Link, Navigate, useNavigate } from "react-router-dom";
import { Form } from "semantic-ui-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import Field from "../../components/Field";
import { registerApi } from "../../api/user";
import { useAuth } from "../../hooks/useAuth";
export default function Register() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      matricula: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      first_name: Yup.string().max(150).required("Escribe tu nombre."),
      last_name: Yup.string().max(150).required("Escribe tus apellidos."),
      matricula: Yup.string().max(20).required("Escribe tu matrícula."),
      email: Yup.string()
        .email("Escribe un correo válido.")
        .required("Escribe tu correo."),
      password: Yup.string()
        .min(8, "Usa al menos 8 caracteres.")
        .required("Escribe una contraseña."),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password")], "Las contraseñas no coinciden.")
        .required("Confirma tu contraseña."),
    }),
    onSubmit: async (values, { setStatus, setFieldError }) => {
      setStatus("");
      try {
        const { confirm_password, ...payload } = values;
        await registerApi(payload);
        navigate("/login", { replace: true, state: { registered: true } });
      } catch (error) {
        Object.entries(error.fields || {}).forEach(([key, value]) => {
          if (key in values)
            setFieldError(
              key,
              Array.isArray(value) ? value.join(" ") : String(value),
            );
        });
        setStatus(
          error.status === 400
            ? "Revisa los datos del formulario."
            : error.message === "Failed to fetch"
              ? "No se pudo conectar con Django. Intenta nuevamente."
              : error.message,
        );
      }
    },
  });
  if (auth) return <Navigate to="/dashboard" replace />;
  return (
    <section className="auth-card register-card">
      <Link to="/login" className="back-link">
        <ArrowLeft size={16} />
        Volver al inicio de sesión
      </Link>
      <span className="section-number">REGISTRO EN TECNOAULA</span>
      <h1>Crea tu cuenta.</h1>
      <p className="auth-subtitle">
        Tu información y tus herramientas, en un mismo lugar.
      </p>
      <Form onSubmit={formik.handleSubmit} noValidate>
        <div className="form-grid">
          <Field
            formik={formik}
            name="first_name"
            label="Nombre"
            placeholder="Tu nombre"
            autoComplete="given-name"
          />
          <Field
            formik={formik}
            name="last_name"
            label="Apellidos"
            placeholder="Tus apellidos"
            autoComplete="family-name"
          />
        </div>
        <Field
          formik={formik}
          name="matricula"
          label="Matrícula"
          placeholder="Ej. IDGS9002"
          maxLength={20}
        />
        <Field
          formik={formik}
          name="email"
          label="Correo electrónico"
          type="email"
          placeholder="tu.correo@ejemplo.com"
          autoComplete="email"
        />
        <Field
          formik={formik}
          name="password"
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
        />
        <Field
          formik={formik}
          name="confirm_password"
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
        />
        {formik.status && (
          <div className="form-error" role="alert">
            {formik.status}
          </div>
        )}
        <button
          className="primary-btn"
          type="submit"
          disabled={formik.isSubmitting}
          aria-busy={formik.isSubmitting}
          aria-label="Crear mi cuenta"
        >
          {formik.isSubmitting ? (
            <>
              Creando cuenta <LoaderCircle size={16} className="spinner" />
            </>
          ) : (
            <>
              Crear mi cuenta <ArrowRight size={16} />
            </>
          )}
        </button>
      </Form>
      <p className="auth-fine">
        Tu matrícula te identifica dentro de TecnoAula.
      </p>
    </section>
  );
}

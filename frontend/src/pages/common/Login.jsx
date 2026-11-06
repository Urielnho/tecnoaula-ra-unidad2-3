import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Form } from "semantic-ui-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { ArrowRight, Mail, LockKeyhole } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Field from "../../components/Field";
export default function Login() {
  const { auth, login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Escribe un correo válido.")
        .required("Escribe tu correo."),
      password: Yup.string().required("Escribe tu contraseña."),
    }),
    onSubmit: async (values, { setStatus }) => {
      setStatus("");
      try {
        await login(values);
        toast.dismiss();
        navigate(
          location.state?.from === "/dashboard"
            ? location.state.from
            : "/dashboard",
          { replace: true },
        );
      } catch (error) {
        const message =
          error.status === 401
            ? "El correo o la contraseña no son correctos."
            : error.message === "Failed to fetch"
              ? "No se pudo conectar con Django. Intenta nuevamente."
              : error.message;
        setStatus(message);
        toast.error(message);
      }
    },
  });
  if (!loading && auth) return <Navigate to="/dashboard" replace />;
  return (
    <section className="auth-card">
      <span className="section-number">BIENVENIDO A TU ESPACIO</span>
      <h2>Qué gusto verte de nuevo.</h2>
      <p className="auth-subtitle">
        Inicia sesión y continúa donde lo dejaste.
      </p>
      {location.state?.registered && (
        <div className="success-message" role="status">
          Tu cuenta está lista. Ya puedes iniciar sesión.
        </div>
      )}
      <Form onSubmit={formik.handleSubmit} noValidate>
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
          placeholder="Escribe tu contraseña"
          autoComplete="current-password"
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
        >
          Iniciar sesión <ArrowRight size={18} />
        </button>
      </Form>
      <div className="auth-divider">
        <span />
        ¿Es tu primera vez aquí?
        <span />
      </div>
      <Link className="secondary-btn" to="/register">
        Crear una cuenta <ArrowRight size={17} />
      </Link>
      <p className="auth-fine">
        <LockKeyhole size={14} />
        Tu sesión es personal y segura.
      </p>
    </section>
  );
}

import { LegalLink, LegalPage, LegalSection } from "@/features/legal/LegalPage"
import { LEGAL_CONTACT_EMAIL, LEGAL_UPDATED } from "@/features/legal/legalLinks"
import { generateRouteMetadata } from "@/lib/generatePageMetadata"

export const generateMetadata = () =>
  generateRouteMetadata({
    title: "Política de privacidad",
    description: "Qué datos guarda Marcadores, para qué se usan y cómo pedir su eliminación.",
    path: "/privacidad",
  })

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de privacidad" updated={LEGAL_UPDATED}>
      <LegalSection title="1. Quién trata los datos">
        <p>
          Marcadores trata los datos de la cuenta y de la biblioteca para prestar el servicio. Contacto:{" "}
          <LegalLink href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué se guarda">
        <p>Con una cuenta, en la base de datos:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Correo electrónico y credenciales de acceso, gestionadas por el proveedor de autenticación.</li>
          <li>Marcadores: título, URL, descripción, carpeta, etiquetas, metadatos, favorito y fechas.</li>
          <li>Carpetas y su orden.</li>
          <li>Conteo y fecha de apertura de un marcador, cuando abres el enlace desde la app.</li>
          <li>
            Tokens de agente: solo un identificador y el hash del secreto, no el token en claro. El secreto se muestra
            una sola vez al crearlo.
          </li>
        </ul>
        <p>
          La demo no guarda tu biblioteca. Usa datos de ejemplo en memoria y una cookie de sesión de demo. Al salir, esa
          sesión no se convierte en tu cuenta.
        </p>
      </LegalSection>

      <LegalSection title="3. Para qué se usan">
        <ul className="list-disc space-y-1 pl-5">
          <li>Crear la sesión y mostrar tu biblioteca solo a ti.</li>
          <li>Ordenar, buscar, etiquetar y recuperar elementos de la papelera.</li>
          <li>Dejar que un agente autorizado lea o modifique tu biblioteca si creas un token.</li>
          <li>Recordar tema y apariencia en este navegador.</li>
          <li>Corregir fallos cuando el reporte de errores está configurado.</li>
        </ul>
        <p>No se venden ni se usan para publicidad.</p>
      </LegalSection>

      <LegalSection title="4. Encargados">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Supabase</strong>: autenticación y base de datos de la biblioteca.
          </li>
          <li>
            <strong>Vercel</strong>: alojamiento del sitio y analítica agregada de páginas visitadas, sin identificarte
            por nombre.
          </li>
          <li>
            <strong>Sentry</strong>, solo si hay un DSN configurado: errores técnicos. Las URL se envían con tokens y
            credenciales ocultos. No hay grabación de sesión.
          </li>
        </ul>
        <p>
          Las cookies concretas están en la <LegalLink href="/cookies">página de cookies</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="5. Cuánto tiempo">
        <p>
          La biblioteca permanece mientras la cuenta exista. Lo que envías a la papelera se borra a los 30 días. La
          cookie de apariencia dura un año. La cookie de demo dura un día.
        </p>
      </LegalSection>

      <LegalSection title="6. Tus derechos">
        <p>
          Puedes consultar, corregir o pedir la eliminación de tus datos escribiendo a{" "}
          <LegalLink href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</LegalLink> desde el correo de la
          cuenta. En el perfil puedes cerrar sesión, cambiar la contraseña y revocar tokens. Exportar la biblioteca a
          JSON está en la barra de marcadores.
        </p>
        <p>El tratamiento se informa conforme a la Ley 1581 de 2012 de Colombia.</p>
      </LegalSection>

      <LegalSection title="7. Menores">
        <p>El servicio no está dirigido a menores de edad. No pidas una cuenta en su nombre.</p>
      </LegalSection>

      <LegalSection title="8. Cambios">
        <p>Si esta política cambia, la fecha de arriba se actualiza en esta misma página.</p>
      </LegalSection>
    </LegalPage>
  )
}

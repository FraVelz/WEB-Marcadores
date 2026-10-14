import { LegalLink, LegalPage, LegalSection } from "@/features/legal/LegalPage"
import { LEGAL_CONTACT_EMAIL, LEGAL_UPDATED } from "@/features/legal/legalLinks"
import { generateRouteMetadata } from "@/lib/generatePageMetadata"

export const generateMetadata = () =>
  generateRouteMetadata({
    title: "Términos y condiciones",
    description: "Condiciones de uso de Marcadores: cuenta, biblioteca, demo, papelera y acceso de agente.",
    path: "/terminos",
  })

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones" updated={LEGAL_UPDATED}>
      <LegalSection title="1. El servicio">
        <p>
          Marcadores es un gestor personal de enlaces. Permite guardar marcadores en carpetas, etiquetarlos, buscarlos y
          consultarlos con atajos. El servicio es gratuito. No vende los datos de la biblioteca.
        </p>
        <p>
          Al crear una cuenta aceptas estos términos y la{" "}
          <LegalLink href="/privacidad">política de privacidad</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="2. Cuenta">
        <p>
          El registro usa correo y contraseña. Hay que confirmar el correo antes de entrar. La contraseña y la sesión
          son responsabilidad de quien usa la cuenta. No compartas el acceso.
        </p>
        <p>
          Para cerrar la cuenta o pedir la eliminación de los datos, escribe a{" "}
          <LegalLink href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</LegalLink>. La app no borra sola el
          usuario de autenticación.
        </p>
      </LegalSection>

      <LegalSection title="3. Tu biblioteca">
        <p>
          Los títulos, URL, descripciones, carpetas, etiquetas y metadatos que guardas son tuyos. Marcadores no se
          apropia de ese contenido. Tú respondes de tener derecho a guardar y compartir esos enlaces.
        </p>
        <p>
          La interfaz, el código y la marca de la aplicación pertenecen a su autor. Guardar un marcador no transfiere
          derechos sobre el sitio enlazado.
        </p>
      </LegalSection>

      <LegalSection title="4. Modo demo">
        <p>
          La demo muestra datos de ejemplo en memoria y no es tu biblioteca. No hace falta cuenta. Esos datos no se
          guardan en tu cuenta y se pierden al salir del modo demo.
        </p>
      </LegalSection>

      <LegalSection title="5. Papelera">
        <p>
          Borrar un marcador o una carpeta lo mueve a la papelera. A los 30 días se elimina de forma permanente, junto
          con lo que hubiera dentro de esa carpeta.
        </p>
      </LegalSection>

      <LegalSection title="6. Agente y MCP">
        <p>
          Desde el perfil puedes crear un token de acceso personal para la API de agente y el servidor MCP. El secreto
          se muestra una vez. Guárdalo como una contraseña: quien lo tenga puede actuar sobre tu biblioteca con los
          permisos de ese token. Puedes revocarlo en el perfil.
        </p>
      </LegalSection>

      <LegalSection title="7. Uso aceptable">
        <p>No uses el servicio para atacar la aplicación, saturar la API ni guardar contenido que infrinja la ley.</p>
      </LegalSection>

      <LegalSection title="8. Disponibilidad">
        <p>
          El servicio puede cambiar, interrumpirse o dejar de ofrecerse. No hay garantía de que un enlace externo siga
          disponible: Marcadores guarda la referencia, no el sitio de destino.
        </p>
      </LegalSection>

      <LegalSection title="9. Ley aplicable">
        <p>Estos términos se rigen por las leyes de la República de Colombia.</p>
        <p>
          Contacto: <LegalLink href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</LegalLink>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}

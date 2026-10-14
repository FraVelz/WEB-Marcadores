import { LegalLink, LegalPage, LegalSection } from "@/features/legal/LegalPage"
import { LEGAL_UPDATED } from "@/features/legal/legalLinks"
import { generateRouteMetadata } from "@/lib/generatePageMetadata"

export const generateMetadata = () =>
  generateRouteMetadata({
    title: "Cookies",
    description: "Cookies y almacenamiento local que usa Marcadores para la sesión, la demo y la apariencia.",
    path: "/cookies",
  })

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies" updated={LEGAL_UPDATED}>
      <LegalSection title="1. Qué se usa">
        <p>
          Marcadores usa cookies propias para mantener la sesión y la apariencia. No usa cookies de publicidad. La
          analítica de Vercel no identifica la cuenta con una cookie.
        </p>
      </LegalSection>

      <LegalSection title="2. Necesarias">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Sesión de Supabase.</strong> Mantiene la cuenta iniciada. La pone el inicio de sesión y se borra al
            cerrarla.
          </li>
          <li>
            <strong>demo_session.</strong> Marca que estás en la demo. Dura un día. No contiene tu biblioteca.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Preferencias">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>marcadores_app_appearance_v1.</strong> Tema y ajustes de apariencia. Dura un año.
          </li>
          <li>
            <strong>marcadores_app_wallpaper_v1.</strong> Tapiz, guardado en el almacenamiento local del navegador, no
            en una cookie.
          </li>
        </ul>
        <p>Si las borras, la app vuelve a la apariencia por defecto. La biblioteca en la cuenta no se pierde.</p>
      </LegalSection>

      <LegalSection title="4. Analítica y errores">
        <p>
          Vercel Web Analytics mide páginas visitadas de forma agregada. Sentry, si está activo, recibe errores técnicos
          sin grabar la pantalla. Ninguno de los dos se usa para seguirte entre sitios.
        </p>
      </LegalSection>

      <LegalSection title="5. Cómo gestionarlas">
        <p>
          Puedes borrar las cookies desde el navegador. Si quitas la de sesión, tendrás que entrar otra vez. El detalle
          del tratamiento está en la <LegalLink href="/privacidad">política de privacidad</LegalLink>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}

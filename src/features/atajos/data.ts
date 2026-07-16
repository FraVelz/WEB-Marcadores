type ShortcutRow = { keys: string; desc: string }

export type ShortcutSection = { title: string; hint?: string; rows: ShortcutRow[] }

export const shortcutSections: ShortcutSection[] = [
  {
    title: "Pestañas y foco",
    hint: "Saltar entre vistas del panel principal.",
    rows: [
      { keys: "Ctrl+1", desc: "Ir a Marcadores" },
      { keys: "Ctrl+2", desc: "Ir a Estadísticas" },
      { keys: "Ctrl+3", desc: "Ir a Atajos" },
      { keys: "Ctrl+4", desc: "Ir a Perfil" },
      { keys: "n", desc: "Alternar foco entre sidebar y área de marcadores" },
    ],
  },
  {
    title: "Búsqueda",
    rows: [
      { keys: "Ctrl+K / Cmd+K", desc: "Abrir paleta de comandos (buscar marcadores y navegar)" },
      { keys: "Ctrl+F", desc: "Abrir búsqueda en Marcadores (título, descripción, URL, tags)" },
    ],
  },
  {
    title: "Sidebar (carpetas)",
    hint: "Con el foco en la barra lateral.",
    rows: [
      { keys: "j / k", desc: "Navegar carpetas arriba/abajo" },
      { keys: "h / l", desc: "Colapsar / expandir carpeta" },
      { keys: "Enter", desc: "Abrir carpeta y ver enlaces" },
      { keys: "r", desc: "Renombrar carpeta seleccionada" },
    ],
  },
  {
    title: "Lista de marcadores",
    hint: "Con el foco en la cuadrícula o lista de enlaces.",
    rows: [
      { keys: "↑ / k", desc: "Elemento anterior (marcadores)" },
      { keys: "↓ / j", desc: "Elemento siguiente (marcadores)" },
      { keys: "← / h", desc: "Elemento a la izquierda" },
      { keys: "→ / l", desc: "Elemento a la derecha" },
      { keys: "Enter", desc: "Abrir enlace o entrar en carpeta" },
      { keys: "z", desc: "Subir una carpeta (volver atrás en la jerarquía)" },
    ],
  },
  {
    title: "Crear, mover y eliminar",
    rows: [
      { keys: "a", desc: "Crear nuevo enlace" },
      { keys: "Ctrl+A", desc: "Crear nueva carpeta" },
      { keys: "Ctrl+X", desc: "Cortar carpeta o enlace (mover)" },
      { keys: "Ctrl+V", desc: "Pegar en la carpeta actual" },
      { keys: "Arrastrar y soltar", desc: "Mover carpetas y enlaces entre carpetas" },
      { keys: "dd", desc: "Eliminar elemento enfocado (pide confirmación)" },
      { keys: "Enter", desc: "Confirmar eliminación (cuadro de confirmación)" },
      { keys: "Esc", desc: "Cancelar eliminación (cuadro de confirmación)" },
    ],
  },
  {
    title: "Edición y vistas",
    rows: [
      { keys: "r", desc: "Modificar enlace o renombrar carpeta" },
      { keys: "i", desc: "Ver/ocultar propiedades del marcador (solo enlaces)" },
      { keys: "Enter", desc: "Seleccionar/deseleccionar enlace (modo selección)" },
      { keys: "Esc", desc: "Cerrar modal, panel de detalle o cancelar" },
      { keys: "Doble clic", desc: "Abrir marcador en nueva pestaña" },
    ],
  },
]

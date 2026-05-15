/** @type {import("prettier").Config} */

const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["clsx", "cn", "cnLines"],

  semi: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 120,
}

export default config

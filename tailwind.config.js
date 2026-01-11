/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./*.html", "./**/*.html", "./**/*.js"],
	theme: {
		extend: {
			fontFamily: {
				inter: ["Inter", "system-ui", "sans-serif"],
			},
			colors: {
				primary: "#19255A",
				accent: "#D4A84A",
			},
		},
	},
	plugins: [],
};

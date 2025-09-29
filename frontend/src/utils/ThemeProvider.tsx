import { useState, useEffect } from "react";
import type { PropsWithChildren } from "react";
import type { Theme } from "./types";
import { ThemeContext } from "./ThemeContext";

export const ThemeProvider = ({ children }: PropsWithChildren) => {
	const [theme, setTheme] = useState<Theme>("corporate");

	useEffect(() => {
		const storedTheme =
			(localStorage.getItem("theme") as Theme) || "corporate";
		setTheme(storedTheme);
		document.documentElement.setAttribute("data-theme", storedTheme);
	}, []);

	const changeTheme = (newTheme: Theme) => {
		setTheme(newTheme);
		document.documentElement.setAttribute("data-theme", newTheme);
		localStorage.setItem("theme", newTheme);
	};

	return (
		<ThemeContext.Provider value={{ theme, setTheme: changeTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

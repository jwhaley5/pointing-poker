
import { useTheme } from "./ThemeContext";
import type { Theme } from "./types";
import { ThemeArr } from "./types";

export const ThemeSwitcher = () => {
	const { setTheme } = useTheme();
	return (
		<div title="Change Theme" className="dropdown dropdown-end block">
			<div
				tabIndex={0}
				role="button"
				className="btn group btn-sm gap-1.5 px-1.5 btn-ghost"
			>
				<div className="bg-base-100 group-hover:border-base-content/20 border-base-content/10 grid shrink-0 grid-cols-2 gap-0.5 rounded-md border p-1 transition-colors">
					<div className="bg-base-content size-1 rounded-full"></div>
					<div className="bg-primary size-1 rounded-full"></div>
					<div className="bg-secondary size-1 rounded-full"></div>
					<div className="bg-accent size-1 rounded-full"></div>
				</div>
				<svg
					width="12px"
					height="12px"
					className="mt-px hidden size-2 fill-current opacity-60 sm:inline-block"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 2048 2048"
				>
					<path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
				</svg>
			</div>
			<div
				tabIndex={0}
				className="dropdown-content bg-base-200 text-base-content rounded-box top-px h-[30.5rem] max-h-[calc(100dvh-8.6rem)] overflow-y-auto border border-white/5 shadow-2xl outline-1 outline-black/5 mt-8"
			>
				<ul className="menu w-56">
					<li className="menu-title">Theme</li>
					{ThemeArr.map((theme) => (
						<li key={theme}>
							<button
								className="gap-3 px-2"
								onClick={() => setTheme(theme as Theme)}
							>
								<div
									data-theme={theme}
									className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
								>
									<div className="bg-base-content size-1 rounded-full"></div>
									<div className="bg-primary size-1 rounded-full"></div>
									<div className="bg-secondary size-1 rounded-full"></div>
									<div className="bg-accent size-1 rounded-full"></div>
								</div>
								<div className="w-32 truncate">{theme}</div>
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};
